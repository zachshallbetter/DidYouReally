-- Insert sample companies
INSERT INTO public.companies (id, name, website, industry) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tech Solutions Inc', 'https://techsolutions.com', 'Technology'),
  ('22222222-2222-2222-2222-222222222222', 'Innovation Corp', 'https://innovationcorp.com', 'Technology'),
  ('33333333-3333-3333-3333-333333333333', 'StartUp Tech', 'https://startuptech.com', 'Technology'),
  ('44444444-4444-4444-4444-444444444444', 'Product Co', 'https://productco.com', 'Product'),
  ('55555555-5555-5555-5555-555555555555', 'Tech Giants', 'https://techgiants.com', 'Technology'),
  ('66666666-6666-6666-6666-666666666666', 'Analytics Co', 'https://analyticsco.com', 'Analytics'),
  ('77777777-7777-7777-7777-777777777777', 'AI Solutions', 'https://aisolutions.com', 'Artificial Intelligence');

-- Insert sample resumes
INSERT INTO public.resumes (job_title, company_id, tracking_url, status, version, created_at) VALUES
  ('Senior Software Engineer', '11111111-1111-1111-1111-111111111111', 'tracking-001', 'active', 1, now() - interval '30 days'),
  ('Software Engineer', '22222222-2222-2222-2222-222222222222', 'tracking-002', 'active', 1, now() - interval '25 days'),
  ('Full Stack Developer', '33333333-3333-3333-3333-333333333333', 'tracking-003', 'active', 2, now() - interval '20 days'),
  ('Senior Product Manager', '44444444-4444-4444-4444-444444444444', 'tracking-004', 'active', 1, now() - interval '15 days'),
  ('Product Manager', '55555555-5555-5555-5555-555555555555', 'tracking-005', 'active', 1, now() - interval '10 days'),
  ('Senior Data Scientist', '66666666-6666-6666-6666-666666666666', 'tracking-006', 'active', 1, now() - interval '5 days'),
  ('Machine Learning Engineer', '77777777-7777-7777-7777-777777777777', 'tracking-007', 'active', 1, now());

-- Insert tracking logs
WITH resume_ids AS (SELECT id FROM public.resumes)
INSERT INTO public.tracking_logs (
  resume_id, 
  ip_address, 
  user_agent,
  country, 
  city,
  timestamp,
  view_duration,
  device_type,
  browser,
  os,
  retention_expires_at,
  event_type
) 
SELECT 
  id,
  '192.168.1.' || (random() * 255)::int,
  CASE (random() * 2)::int
    WHEN 0 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    WHEN 1 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ELSE 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  END,
  CASE (random() * 2)::int
    WHEN 0 THEN 'United States'
    WHEN 1 THEN 'United Kingdom'
    ELSE 'Canada'
  END,
  CASE (random() * 2)::int
    WHEN 0 THEN 'San Francisco'
    WHEN 1 THEN 'New York'
    ELSE 'London'
  END,
  now() - (random() * 30)::int * interval '1 day',
  (random() * 300)::int * interval '1 second',
  CASE (random() * 2)::int
    WHEN 0 THEN 'desktop'
    WHEN 1 THEN 'mobile'
    ELSE 'tablet'
  END,
  CASE (random() * 2)::int
    WHEN 0 THEN 'Chrome'
    WHEN 1 THEN 'Safari'
    ELSE 'Firefox'
  END,
  CASE (random() * 2)::int
    WHEN 0 THEN 'MacOS'
    WHEN 1 THEN 'Windows'
    ELSE 'iOS'
  END,
  now() + interval '90 days',
  CASE (random() * 4)::int
    WHEN 0 THEN 'view'
    WHEN 1 THEN 'send'
    WHEN 2 THEN 'open'
    WHEN 3 THEN 'click'
    ELSE 'download'
  END::event_type
FROM resume_ids
CROSS JOIN generate_series(1, 5);

-- Insert resume events
WITH resume_ids AS (SELECT id FROM public.resumes)
INSERT INTO public.resume_events (
  resume_id,
  event_type,
  occurred_at,
  actor,
  metadata,
  device_info,
  location_info
)
SELECT 
  id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'view'
    WHEN 1 THEN 'send'
    WHEN 2 THEN 'open'
    WHEN 3 THEN 'click'
    ELSE 'download'
  END::event_type,
  now() - (random() * 30)::int * interval '1 day',
  CASE (random() * 2)::int
    WHEN 0 THEN 'recruiter@company.com'
    WHEN 1 THEN 'hiring.manager@company.com'
    ELSE 'hr@company.com'
  END,
  jsonb_build_object(
    'source', CASE (random() * 2)::int
      WHEN 0 THEN 'email'
      WHEN 1 THEN 'linkedin'
      ELSE 'direct'
    END,
    'duration', (random() * 300)::int
  ),
  jsonb_build_object(
    'device_type', CASE (random() * 2)::int
      WHEN 0 THEN 'desktop'
      WHEN 1 THEN 'mobile'
      ELSE 'tablet'
    END,
    'browser', CASE (random() * 2)::int
      WHEN 0 THEN 'Chrome'
      WHEN 1 THEN 'Safari'
      ELSE 'Firefox'
    END,
    'os', CASE (random() * 2)::int
      WHEN 0 THEN 'MacOS'
      WHEN 1 THEN 'Windows'
      ELSE 'iOS'
    END
  ),
  jsonb_build_object(
    'country', CASE (random() * 2)::int
      WHEN 0 THEN 'United States'
      WHEN 1 THEN 'United Kingdom'
      ELSE 'Canada'
    END,
    'city', CASE (random() * 2)::int
      WHEN 0 THEN 'San Francisco'
      WHEN 1 THEN 'New York'
      ELSE 'London'
    END,
    'region', CASE (random() * 2)::int
      WHEN 0 THEN 'California'
      WHEN 1 THEN 'New York'
      ELSE 'Greater London'
    END
  )
FROM resume_ids
CROSS JOIN generate_series(1, 3);
