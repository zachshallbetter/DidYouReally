import { z } from 'zod';

// Shared enums and types
export const ResumeStatus = z.enum(['active', 'archived', 'deleted']);
export const ApplicationStatus = z.enum(['draft', 'sent', 'interviewing', 'rejected', 'accepted']);
export const DeviceType = z.enum(['desktop', 'mobile', 'tablet', 'unknown']);
export const ThemeType = z.enum(['light', 'dark', 'system']);
export const ApplicationTrackingStatus = z.enum([
  'applied',
  'screening',
  'interviewing',
  'offered',
  'rejected',
  'accepted',
  'withdrawn'
]);

// Schema definitions
export const resumeSchema = {
  tableName: 'resumes',
  columns: {
    id: { type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
    job_title: { type: 'text', nullable: false },
    company: { type: 'text', nullable: false },
    tracking_url: { type: 'text', nullable: false },
    job_listing_url: { type: 'text', nullable: true },
    status: { type: 'text', nullable: false, enum: ResumeStatus.options },
    version: { type: 'integer', nullable: false, defaultValue: 1 },
    created_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    archived_at: { type: 'timestamp with time zone', nullable: true },
    original_content: { type: 'text', nullable: true },
    metadata: { type: 'jsonb', defaultValue: '{}' },
    layout_preferences: { type: 'jsonb', defaultValue: '{}' },
    tags: { type: 'text[]', defaultValue: '{}' },
    company_type: { type: 'text', nullable: true },
    job_level: { type: 'text', nullable: true },
    application_status: { 
      type: 'text', 
      nullable: true,
      enum: ApplicationStatus.options
    },
    last_accessed_at: { type: 'timestamp with time zone', nullable: true },
    last_modified_by: { type: 'text', nullable: true },
    view_count: { type: 'integer', defaultValue: 0 },
    unique_locations: { type: 'integer', defaultValue: 0 },
    avg_view_duration: { type: 'float', defaultValue: 0 }
  },
  indexes: [
    { name: 'idx_resumes_status', columns: ['status'] },
    { name: 'idx_resumes_company', columns: ['company'] },
    { name: 'idx_resumes_application_status', columns: ['application_status'] }
  ]
};

export const trackingLogSchema = {
  tableName: 'tracking_logs',
  columns: {
    id: { type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
    resume_id: { 
      type: 'uuid', 
      nullable: false,
      references: { table: 'resumes', column: 'id', onDelete: 'CASCADE' as const }
    },
    ip_address: { type: 'text', nullable: false },
    user_agent: { type: 'text', nullable: false },
    timestamp: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    country: { type: 'text', nullable: true },
    city: { type: 'text', nullable: true },
    view_duration: { type: 'float', nullable: true },
    metadata: { type: 'jsonb', defaultValue: '{}' },
    is_bot: { type: 'boolean', defaultValue: false },
    device_type: { 
      type: 'text',
      nullable: false,
      enum: DeviceType.options,
      defaultValue: 'unknown'
    },
    browser: { type: 'text', nullable: true },
    os: { type: 'text', nullable: true },
    referrer: { type: 'text', nullable: true },
    retention_expires_at: { type: 'timestamp with time zone', nullable: false },
    engagement_metrics: { type: 'jsonb', defaultValue: '{}' }
  },
  indexes: [
    { name: 'idx_tracking_logs_resume_id', columns: ['resume_id'] },
    { name: 'idx_tracking_logs_timestamp', columns: ['timestamp'] }
  ]
};

export const userPreferencesSchema = {
  tableName: 'user_preferences',
  columns: {
    id: { type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
    user_id: { type: 'uuid', nullable: false },
    theme: { 
      type: 'text',
      nullable: false,
      enum: ThemeType.options,
      defaultValue: 'system'
    },
    notifications_enabled: { type: 'boolean', defaultValue: true },
    email_notifications: { type: 'boolean', defaultValue: false },
    retention_period: { type: 'integer', defaultValue: 90 },
    dashboard_layout: { type: 'jsonb', defaultValue: '{}' },
    created_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' }
  }
};

export const applicationTrackingSchema = {
  tableName: 'application_tracking',
  columns: {
    id: { type: 'uuid', primaryKey: true, defaultValue: 'uuid_generate_v4()' },
    resume_id: { 
      type: 'uuid', 
      nullable: false,
      references: { table: 'resumes', column: 'id', onDelete: 'CASCADE' as const }
    },
    company_name: { type: 'text', nullable: false },
    position: { type: 'text', nullable: false },
    application_date: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    status: { 
      type: 'text',
      nullable: false,
      enum: ApplicationTrackingStatus.options,
      defaultValue: 'applied'
    },
    last_interaction: { type: 'timestamp with time zone', nullable: true },
    next_steps: { type: 'text', nullable: true },
    notes: { type: 'text', nullable: true },
    metadata: { type: 'jsonb', defaultValue: '{}' },
    created_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp with time zone', defaultValue: 'CURRENT_TIMESTAMP' }
  },
  indexes: [
    { name: 'idx_application_tracking_resume_id', columns: ['resume_id'] },
    { name: 'idx_application_tracking_status', columns: ['status'] }
  ]
};

// Helper types for schema validation
export type ColumnDefinition = {
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  defaultValue?: any;
  enum?: string[];
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'SET DEFAULT' | 'RESTRICT';
  };
};

export type TableSchema = {
  tableName: string;
  columns: Record<string, ColumnDefinition>;
  indexes?: Array<{
    name: string;
    columns: string[];
    unique?: boolean;
  }>;
};

// Export all schemas
export const schemas: Record<string, TableSchema> = {
  resumes: resumeSchema,
  tracking_logs: trackingLogSchema,
  user_preferences: userPreferencesSchema,
  application_tracking: applicationTrackingSchema
}; 