# **Resume Tracking System Setup Guide**

A comprehensive guide for deploying a secure, scalable resume tracking system using **Supabase** and **Vercel**. This system enables tracking of resume views while maintaining privacy and security standards.

## **1. Prerequisites**

### **Required Tools & Accounts**

1. **Supabase Account** For database and authentication
   - Sign up at [Supabase](https://supabase.com/)
   - Free tier available for testing
   - Production tier recommended for live deployment

2. **Vercel Account** For hosting and serverless functions
   - Sign up at [Vercel](https://vercel.com/)
   - Integrates well with Next.js
   - Provides SSL certificates automatically

3. **Development Environment**
   - Node.js 18+ installed
   - npm (no yarn or pnpm)
   - Git for version control
   - VS Code recommended
   - TypeScript required
   - Python 3.8+ (for PDF processing)

### **Technical Stack Requirements**

- Next.js for all pages and routing
- TypeScript for all code with comprehensive type definitions
- Shadcn UI components (installed via npx shadcn@latest add)
- Tailwind CSS for responsive, mobile-first styling
- Supabase for database, auth, and real-time updates
- Vercel for deployment and edge functions
- Vercel AI SDK for AI features
- Proper error boundaries and fallbacks
- Accessibility (WCAG 2.1) compliance
- Data privacy and security measures

## **2. Database Schema**

### **Enums**

```sql
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

#### 1. **Companies Table**

```sql
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
```

#### 2. **Resumes Table**

```sql
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

CREATE INDEX idx_resumes_status ON resumes(status);
CREATE INDEX idx_resumes_application_status ON resumes(application_status);
CREATE INDEX idx_resumes_company_id ON resumes(company_id);
```

#### 3. **Resume Versions Table**

```sql
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id, version)
);

CREATE INDEX idx_resume_versions_resume_id ON resume_versions(resume_id);
```

#### 4. **Tracking Logs Table**

```sql
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

CREATE INDEX idx_tracking_logs_resume_id ON tracking_logs(resume_id);
CREATE INDEX idx_tracking_logs_created_at ON tracking_logs(created_at);
```

#### 5. **Resume Events Table**

```sql
CREATE TABLE resume_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resume_events_resume_id ON resume_events(resume_id);
CREATE INDEX idx_resume_events_type ON resume_events(type);
```

#### 6. **Application Tracking Table**

```sql
CREATE TABLE application_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  status application_tracking_status NOT NULL,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_application_tracking_resume_id ON application_tracking(resume_id);
CREATE INDEX idx_application_tracking_status ON application_tracking(status);
```

## **3. Security Configuration**

### **Row Level Security (RLS)**

```sql
-- Enable RLS
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
```

## **4. Performance Optimization**

### **Materialized Views**

```sql
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

REFRESH MATERIALIZED VIEW CONCURRENTLY resume_analytics;
```

## **5. Monitoring & Maintenance**

### **Database Health Checks**

```sql
-- Check table sizes and indexes
SELECT 
  schemaname || '.' || tablename as table_full_name,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_table_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Monitor index usage
SELECT 
  schemaname || '.' || tablename as table_full_name,
  indexrelname as index_name,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as number_of_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY number_of_scans DESC;
```

### **Automated Maintenance**

```sql
-- Create maintenance function
CREATE OR REPLACE FUNCTION perform_maintenance()
RETURNS void AS $$
BEGIN
  -- Refresh materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY resume_analytics;
  
  -- Vacuum analyze tables
  VACUUM ANALYZE companies;
  VACUUM ANALYZE resumes;
  VACUUM ANALYZE tracking_logs;
  VACUUM ANALYZE resume_events;
  VACUUM ANALYZE application_tracking;
  
  -- Clean up old tracking logs (90 days)
  DELETE FROM tracking_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule maintenance (requires pg_cron extension)
SELECT cron.schedule(
  'nightly-maintenance',
  '0 0 * * *',  -- Run at midnight
  'SELECT perform_maintenance()'
);
