import { TableSchema, ColumnDefinition, schemas } from './index';

function generateColumnDefinition(name: string, column: ColumnDefinition): string {
  const parts = [name, column.type];

  if (column.primaryKey) {
    parts.push('PRIMARY KEY');
  }

  if (!column.nullable && !column.primaryKey) {
    parts.push('NOT NULL');
  }

  if (column.defaultValue !== undefined) {
    parts.push(`DEFAULT ${column.defaultValue}`);
  }

  if (column.enum) {
    parts.push(`CHECK (${name} IN (${column.enum.map(v => `'${v}'`).join(', ')}))`);
  }

  if (column.references) {
    parts.push(`REFERENCES ${column.references.table}(${column.references.column})`);
    if (column.references.onDelete) {
      parts.push(`ON DELETE ${column.references.onDelete}`);
    }
  }

  return parts.join(' ');
}

function generateCreateTable(schema: TableSchema): string {
  const columnDefinitions = Object.entries(schema.columns)
    .map(([name, column]) => `  ${name} ${generateColumnDefinition(name, column)}`)
    .join(',\n');

  return `
-- Create ${schema.tableName} table
CREATE TABLE IF NOT EXISTS ${schema.tableName} (
${columnDefinitions}
);`;
}

function generateIndexes(schema: TableSchema): string {
  if (!schema.indexes?.length) return '';

  return schema.indexes.map(index => `
-- Create index ${index.name}
CREATE INDEX IF NOT EXISTS ${index.name}
  ON ${schema.tableName} (${index.columns.join(', ')});`
  ).join('\n');
}

function generateUpdatedAtTrigger(schema: TableSchema): string {
  if (!schema.columns.updated_at) return '';

  return `
-- Create updated_at trigger for ${schema.tableName}
DROP TRIGGER IF EXISTS update_${schema.tableName}_updated_at ON ${schema.tableName};
CREATE TRIGGER update_${schema.tableName}_updated_at
    BEFORE UPDATE ON ${schema.tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();`;
}

export function generateMigration(): string {
  // First create the updated_at function if any table uses it
  const hasUpdatedAt = Object.values(schemas).some(schema => schema.columns.updated_at);
  
  let migration = '';
  
  if (hasUpdatedAt) {
    migration += `
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
`;
  }

  // Generate table creation statements
  Object.values(schemas).forEach(schema => {
    migration += generateCreateTable(schema);
    migration += generateIndexes(schema);
    migration += generateUpdatedAtTrigger(schema);
    migration += '\n';
  });

  return migration;
}

// Generate a migration for altering existing tables
export function generateAlterMigration(existingSchemas: typeof schemas): string {
  let migration = '';

  Object.entries(schemas).forEach(([tableName, newSchema]) => {
    const existingSchema = existingSchemas[tableName];
    if (!existingSchema) {
      // New table
      migration += generateCreateTable(newSchema);
      migration += generateIndexes(newSchema);
      migration += generateUpdatedAtTrigger(newSchema);
      return;
    }

    // Check for new or modified columns
    Object.entries(newSchema.columns).forEach(([columnName, column]) => {
      const existingColumn = existingSchema.columns[columnName];
      if (!existingColumn) {
        migration += `
-- Add new column ${columnName} to ${tableName}
ALTER TABLE ${tableName}
ADD COLUMN IF NOT EXISTS ${columnName} ${generateColumnDefinition(columnName, column)};`;
      }
      // Note: We don't modify existing columns to avoid data loss
    });

    // Add new indexes
    newSchema.indexes?.forEach(index => {
      const existingIndex = existingSchema.indexes?.find(i => i.name === index.name);
      if (!existingIndex) {
        migration += `
-- Create new index ${index.name}
CREATE INDEX IF NOT EXISTS ${index.name}
  ON ${tableName} (${index.columns.join(', ')});`;
      }
    });
  });

  return migration;
}

// Example usage:
// const migration = generateMigration();
// console.log(migration);

// For altering existing tables:
// const alterMigration = generateAlterMigration(existingSchemas);
// console.log(alterMigration); 