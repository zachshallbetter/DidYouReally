import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateMigration, generateAlterMigration } from '../src/lib/schema/generate-migration';

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[^0-9]/g, '').slice(0, 14);
}

function createMigration(type: 'new' | 'alter' = 'new') {
  const timestamp = generateTimestamp();
  const fileName = `${timestamp}_${type === 'new' ? 'initial' : 'update'}_schema.sql`;
  const filePath = join(MIGRATIONS_DIR, fileName);

  // Create migrations directory if it doesn't exist
  mkdirSync(MIGRATIONS_DIR, { recursive: true });

  // Generate migration content
  const migration = type === 'new' ? generateMigration() : generateAlterMigration({});

  // Write migration file
  writeFileSync(filePath, migration, 'utf8');

  console.log(`Generated migration file: ${fileName}`);
  console.log('Review the generated SQL before applying the migration.');
}

// Get command line arguments
const args = process.argv.slice(2);
const type = args[0] as 'new' | 'alter' || 'new';

createMigration(type); 