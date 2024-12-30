# **Supabase Database Configuration Guide**

## **1. Schema Configuration**

### **Enum Types**

```sql
-- Create enum types for better data consistency
CREATE TYPE resume_status AS ENUM ('active', 'archived', 'deleted');
CREATE TYPE application_status AS ENUM ('draft', 'sent', 'interviewing', 'rejected', 'accepted');
CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'unknown');
CREATE TYPE event_type AS ENUM ('view', 'send', 'open', 'click', 'download');
CREATE TYPE application_tracking_status AS ENUM (
  'applied',
  'screening',
  'interviewing',
  'offered',
  'rejected',
  'accepted',
  'withdrawn'
);
```

### **Core Tables**

```sql
-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  website TEXT,
  industry TEXT,
  location TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE RESTRICT,
  tracking_url TEXT UNIQUE NOT NULL,
  job_listing_url TEXT,
  status resume_status DEFAULT 'active',
  version INTEGER DEFAULT 1,
  archived_at TIMESTAMP WITH TIME ZONE,
  original_content TEXT,
  current_content TEXT,
  metadata JSONB DEFAULT '{}',
  layout_preferences JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  company_type TEXT,
  job_level TEXT,
  application_status application_status,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  last_modified_by TEXT,
  view_count INTEGER DEFAULT 0,
  unique_locations INTEGER DEFAULT 0,
  avg_view_duration FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume versions table
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id, version)
);

-- Tracking logs table
CREATE TABLE tracking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  device_type device_type DEFAULT 'unknown',
  location TEXT,
  referrer TEXT,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume events table
CREATE TABLE resume_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application tracking table
CREATE TABLE application_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  status application_tracking_status NOT NULL,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Indexes**

```sql
-- Resume indexes
CREATE INDEX idx_resumes_status ON resumes(status);
CREATE INDEX idx_resumes_application_status ON resumes(application_status);
CREATE INDEX idx_resumes_company_id ON resumes(company_id);

-- Resume versions index
CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);

-- Tracking logs indexes
CREATE INDEX idx_tracking_logs_resume_id ON tracking_logs(resume_id);
CREATE INDEX idx_tracking_logs_created_at ON tracking_logs(created_at);

-- Resume events indexes
CREATE INDEX idx_resume_events_resume_id ON resume_events(resume_id);
CREATE INDEX idx_resume_events_type ON resume_events(type);

-- Application tracking indexes
CREATE INDEX idx_application_tracking_resume_id ON application_tracking(resume_id);
CREATE INDEX idx_application_tracking_status ON application_tracking(status);
```

## **2. Security Configuration**

### **Row Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for active resumes" 
ON resumes FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can manage their own resumes" 
ON resumes FOR ALL 
USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own tracking data" 
ON tracking_logs FOR SELECT 
USING (resume_id IN (
  SELECT id FROM resumes WHERE created_by = auth.uid()
));
```

## **3. Performance Optimization**

### **Materialized Views**

```sql
-- Resume analytics view
CREATE MATERIALIZED VIEW resume_analytics AS
SELECT 
  r.id as resume_id,
  r.job_title,
  c.name as company_name,
  r.status,
  COUNT(t.id) as view_count,
  COUNT(DISTINCT t.ip_address) as unique_viewers,
  AVG(t.duration) as avg_view_duration,
  array_agg(DISTINCT t.location) as viewer_locations
FROM resumes r
LEFT JOIN companies c ON r.company_id = c.id
LEFT JOIN tracking_logs t ON t.resume_id = r.id
GROUP BY r.id, r.job_title, c.name, r.status;

-- Application analytics view
CREATE MATERIALIZED VIEW application_analytics AS
SELECT 
  r.id as resume_id,
  r.job_title,
  r.company_type,
  r.job_level,
  COUNT(a.id) as application_count,
  COUNT(CASE WHEN a.status = 'interviewing' THEN 1 END) as interview_count,
  COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) as accepted_count
FROM resumes r
LEFT JOIN application_tracking a ON a.resume_id = r.id
GROUP BY r.id, r.job_title, r.company_type, r.job_level;
```

### **View Maintenance**

```sql
-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY resume_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY application_analytics;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (requires pg_cron)
SELECT cron.schedule(
  'refresh-analytics',
  '0 * * * *',  -- Every hour
  'SELECT refresh_materialized_views()'
);
```

## **4. Data Retention & Cleanup**

### **Cleanup Function**

```sql
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Remove old tracking logs (90 days)
  DELETE FROM tracking_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Archive old resumes (1 year)
  UPDATE resumes
  SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '1 year'
  AND status = 'active';
  
  -- Clean up old versions (keep last 5)
  DELETE FROM resume_versions rv
  WHERE version NOT IN (
    SELECT version
    FROM resume_versions
    WHERE resume_id = rv.resume_id
    ORDER BY version DESC
    LIMIT 5
  );
  
  -- Vacuum affected tables
  VACUUM ANALYZE tracking_logs;
  VACUUM ANALYZE resumes;
  VACUUM ANALYZE resume_versions;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron)
SELECT cron.schedule(
  'cleanup-old-data',
  '0 0 * * 0',  -- Every Sunday at midnight
  'SELECT cleanup_old_data()'
);
```

## **5. Monitoring**

### **Health Checks**

```sql
-- Table sizes
SELECT 
  schemaname || '.' || tablename as table_full_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_table_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Index usage
SELECT 
  schemaname || '.' || tablename as table_full_name,
  indexrelname as index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as number_of_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY number_of_scans DESC;

-- Table statistics
SELECT
  relname as table_name,
  n_live_tup as row_count,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
