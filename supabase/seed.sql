-- Drop existing objects first
drop materialized view if exists resume_view_stats;
drop materialized view if exists application_success_stats;
drop materialized view if exists feedback_analysis_stats;
drop table if exists public.recruiter_feedback cascade;
drop table if exists public.application_tracking cascade;
drop table if exists public.error_logs cascade;
drop table if exists public.tracking_logs cascade;
drop table if exists public.resumes cascade;
drop type if exists resume_status cascade;
drop type if exists company_type cascade;
drop type if exists job_level cascade;
drop type if exists response_type cascade;
drop type if exists feedback_type cascade;
drop type if exists sentiment_type cascade;

-- Create custom types
create type resume_status as enum ('active', 'archived', 'deleted');
create type company_type as enum ('startup', 'smb', 'enterprise', 'agency', 'other'); 
create type job_level as enum ('entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive');
create type response_type as enum ('screen', 'interview', 'offer', 'rejection');
create type feedback_type as enum ('interview_feedback', 'screening_feedback', 'general_feedback');
create type sentiment_type as enum ('positive', 'neutral', 'negative');

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create base tables
create table public.resumes (
    id uuid primary key default uuid_generate_v4(),
    job_title text not null check (length(job_title) >= 3 and length(job_title) <= 200),
    company text not null check (length(company) >= 2 and length(company) <= 100),
    tracking_url text unique not null check (length(tracking_url) >= 5),
    status resume_status default 'active',
    version int default 1 check (version > 0 and version <= 100),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    original_content text,
    metadata jsonb default '{}',
    constraint valid_dates check (updated_at >= created_at),
    constraint valid_tracking_url check (tracking_url ~ '^[a-zA-Z0-9\-_]+$'),
    constraint valid_metadata check (jsonb_typeof(metadata) = 'object')
);

create table public.tracking_logs (
    id uuid primary key default uuid_generate_v4(),
    resume_id uuid references public.resumes(id) on delete cascade,
    ip_address text not null,
    user_agent text check (user_agent is null or length(user_agent) <= 500),
    country text check (country is null or length(country) <= 100),
    city text check (city is null or length(city) <= 100),
    timestamp timestamp with time zone default now(),
    view_duration interval check (view_duration is null or view_duration >= interval '0 seconds'),
    metadata jsonb default '{}',
    is_bot boolean default false,
    retention_expires_at timestamp with time zone default now() + interval '90 days',
    constraint valid_ip check (ip_address ~ '^(\d{1,3}\.){3}\d{1,3}$'),
    constraint valid_timestamp check (timestamp <= now()),
    constraint valid_location check (
        (country is null and city is null) or
        (country is not null and city is not null)
    ),
    constraint valid_metadata check (jsonb_typeof(metadata) = 'object'),
    constraint valid_retention check (retention_expires_at > timestamp)
);

create table public.error_logs (
    id uuid primary key default uuid_generate_v4(),
    endpoint text not null check (length(endpoint) <= 200),
    error_message text not null check (length(error_message) <= 1000),
    stack_trace text check (stack_trace is null or length(stack_trace) <= 5000),
    timestamp timestamp with time zone default now(),
    severity text check (severity in ('INFO', 'WARN', 'ERROR', 'FATAL')),
    resolved boolean default false,
    context jsonb default '{}',
    retention_expires_at timestamp with time zone default now() + interval '30 days',
    constraint valid_timestamp check (timestamp <= now()),
    constraint valid_context check (jsonb_typeof(context) = 'object'),
    constraint valid_retention check (retention_expires_at > timestamp)
);

create table public.application_tracking (
    id uuid primary key default uuid_generate_v4(),
    resume_group text not null check (resume_group in ('human', 'ats', 'control')),
    company_type company_type not null,
    job_level job_level not null,
    application_date date not null default current_date,
    response_received boolean default false,
    response_date date,
    response_type response_type,
    days_to_response int,
    metadata jsonb default '{}',
    notes text,
    constraint valid_response_date check (
        (response_received = false and response_date is null and response_type is null and days_to_response is null) or
        (response_received = true and response_date is not null and response_date >= application_date)
    ),
    constraint valid_days_to_response check (
        days_to_response is null or 
        (days_to_response >= 0 and days_to_response = extract(day from response_date::timestamp - application_date::timestamp))
    ),
    constraint valid_application_date check (application_date <= current_date),
    constraint valid_metadata check (jsonb_typeof(metadata) = 'object'),
    constraint valid_notes check (notes is null or length(notes) <= 5000)
);

create table public.recruiter_feedback (
    id uuid primary key default uuid_generate_v4(),
    application_id uuid references public.application_tracking(id) on delete cascade,
    feedback_type feedback_type not null,
    feedback_text text not null check (length(feedback_text) >= 10 and length(feedback_text) <= 2000),
    mentioned_keywords text[] not null check (array_length(mentioned_keywords, 1) > 0 and array_length(mentioned_keywords, 1) <= 10),
    sentiment sentiment_type not null,
    created_at timestamp with time zone default now(),
    metadata jsonb default '{}',
    is_anonymous boolean default false,
    constraint valid_timestamp check (created_at <= now()),
    constraint valid_metadata check (jsonb_typeof(metadata) = 'object')
);

-- Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_resumes_updated_at
    before update on public.resumes
    for each row
    execute function update_updated_at_column();

-- Create indexes
create index idx_resumes_job_title on public.resumes (job_title);
create index idx_resumes_company on public.resumes (company);
create index idx_resumes_status on public.resumes (status);
create index idx_resumes_created_at on public.resumes (created_at);

create index idx_tracking_logs_resume_id on public.tracking_logs (resume_id);
create index idx_tracking_logs_timestamp on public.tracking_logs (timestamp);
create index idx_tracking_logs_country_city on public.tracking_logs (country, city);

create index idx_error_logs_timestamp on public.error_logs (timestamp);
create index idx_error_logs_severity on public.error_logs (severity);
create index idx_error_logs_endpoint on public.error_logs (endpoint);

create index idx_application_tracking_resume_group on public.application_tracking (resume_group);
create index idx_application_tracking_company_type on public.application_tracking (company_type);
create index idx_application_tracking_job_level on public.application_tracking (job_level);
create index idx_application_tracking_dates on public.application_tracking (application_date, response_date);

create index idx_recruiter_feedback_application_id on public.recruiter_feedback (application_id);
create index idx_recruiter_feedback_sentiment on public.recruiter_feedback (sentiment);
create index idx_recruiter_feedback_type on public.recruiter_feedback (feedback_type); 

-- Insert sample data
insert into public.resumes (id, job_title, company, tracking_url, status, version, created_at) values
  -- Software Engineering Resumes
  (uuid_generate_v4(), 'Senior Software Engineer', 'Tech Solutions Inc', 'tracking-001', 'active', 1, now() - interval '30 days'),
  (uuid_generate_v4(), 'Software Engineer', 'Innovation Corp', 'tracking-002', 'active', 1, now() - interval '25 days'),
  (uuid_generate_v4(), 'Full Stack Developer', 'StartUp Tech', 'tracking-003', 'active', 2, now() - interval '20 days'),
  
  -- Product Management Resumes
  (uuid_generate_v4(), 'Senior Product Manager', 'Product Co', 'tracking-004', 'active', 1, now() - interval '15 days'),
  (uuid_generate_v4(), 'Product Manager', 'Tech Giants', 'tracking-005', 'active', 1, now() - interval '10 days'),
  
  -- Data Science Resumes
  (uuid_generate_v4(), 'Senior Data Scientist', 'Analytics Co', 'tracking-006', 'active', 1, now() - interval '5 days'),
  (uuid_generate_v4(), 'Machine Learning Engineer', 'AI Solutions', 'tracking-007', 'active', 1, now());

-- Insert tracking logs
with resume_ids as (select id from public.resumes)
insert into public.tracking_logs (id, resume_id, ip_address, user_agent, country, city, timestamp) 
select 
  uuid_generate_v4(),
  id,
  '192.168.1.' || (random() * 255)::int,
  case (random() * 2)::int
    when 0 then 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    when 1 then 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    else 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  end,
  case (random() * 2)::int
    when 0 then 'United States'
    when 1 then 'United Kingdom'
    else 'Canada'
  end,
  case (random() * 2)::int
    when 0 then 'San Francisco'
    when 1 then 'New York'
    else 'London'
  end,
  now() - (random() * 30)::int * interval '1 day'
from resume_ids
cross join generate_series(1, 5);

-- Insert error logs
insert into public.error_logs (id, endpoint, error_message, stack_trace, timestamp) values
  (uuid_generate_v4(), '/api/track', 'Invalid tracking ID', 'Error: Invalid tracking ID\n    at validateTrackingId (/app/api/track.ts:15)', now() - interval '2 days'),
  (uuid_generate_v4(), '/api/upload', 'File size exceeds limit', 'Error: File size exceeds 5MB limit\n    at validateUpload (/app/api/upload.ts:22)', now() - interval '1 day');

-- Insert application tracking data
insert into public.application_tracking (
  id, resume_group, company_type, job_level, 
  application_date, response_received, response_date, 
  response_type, days_to_response
) values
  -- Human-Focused Group
  (uuid_generate_v4(), 'human', 'enterprise', 'senior', now() - interval '30 days', true, now() - interval '25 days', 'interview', 5),
  (uuid_generate_v4(), 'human', 'startup', 'mid', now() - interval '28 days', true, now() - interval '24 days', 'interview', 4),
  (uuid_generate_v4(), 'human', 'smb', 'entry', now() - interval '25 days', true, now() - interval '22 days', 'screen', 3),
  
  -- ATS-Optimized Group
  (uuid_generate_v4(), 'ats', 'enterprise', 'senior', now() - interval '30 days', true, now() - interval '28 days', 'screen', 2),
  (uuid_generate_v4(), 'ats', 'startup', 'mid', now() - interval '28 days', false, null, null, null),
  (uuid_generate_v4(), 'ats', 'smb', 'entry', now() - interval '25 days', true, now() - interval '20 days', 'rejection', 5),
  
  -- Control Group
  (uuid_generate_v4(), 'control', 'enterprise', 'senior', now() - interval '30 days', false, null, null, null),
  (uuid_generate_v4(), 'control', 'startup', 'mid', now() - interval '28 days', true, now() - interval '25 days', 'screen', 3),
  (uuid_generate_v4(), 'control', 'smb', 'entry', now() - interval '25 days', true, now() - interval '20 days', 'interview', 5);

-- Insert recruiter feedback
with app_ids as (select id from public.application_tracking where response_received = true)
insert into public.recruiter_feedback (
  id, application_id, feedback_type, feedback_text, 
  mentioned_keywords, sentiment
) 
select
  uuid_generate_v4(),
  id,
  (case (random() * 2)::int
    when 0 then 'interview_feedback'::feedback_type
    when 1 then 'screening_feedback'::feedback_type
    else 'general_feedback'::feedback_type
  end),
  case (random() * 2)::int
    when 0 then 'Strong technical background with clear communication skills.'
    when 1 then 'Good experience but could provide more specific examples.'
    else 'Interesting project work but metrics could be clearer.'
  end,
  array[
    case (random() * 2)::int
      when 0 then 'technical_skills'
      when 1 then 'communication'
      else 'experience'
    end,
    case (random() * 2)::int
      when 0 then 'leadership'
      when 1 then 'metrics'
      else 'projects'
    end
  ],
  (case (random() * 2)::int
    when 0 then 'positive'::sentiment_type
    when 1 then 'neutral'::sentiment_type
    else 'negative'::sentiment_type
  end)
from app_ids;

-- Create materialized views
create materialized view resume_view_stats as
select 
    r.id as resume_id,
    r.job_title,
    r.company,
    r.status,
    count(t.id) as view_count,
    count(distinct t.ip_address) as unique_viewers,
    max(t.timestamp) as last_viewed,
    min(t.timestamp) as first_viewed,
    avg(t.view_duration) as avg_view_duration,
    array_agg(distinct t.country) as viewer_countries
from public.resumes r
left join public.tracking_logs t on t.resume_id = r.id
group by r.id, r.job_title, r.company, r.status;

create materialized view application_success_stats as
select
    at.resume_group,
    at.company_type,
    at.job_level,
    count(*) as total_applications,
    sum(case when at.response_received then 1 else 0 end)::float / count(*) as response_rate,
    avg(at.days_to_response) filter (where at.days_to_response is not null) as avg_response_time,
    sum(case when at.response_type = 'interview' then 1 else 0 end)::float / count(*) as interview_rate,
    sum(case when at.response_type = 'offer' then 1 else 0 end)::float / count(*) as offer_rate
from public.application_tracking at
group by at.resume_group, at.company_type, at.job_level;

create materialized view feedback_analysis_stats as
select
    at.resume_group,
    rf.sentiment,
    count(*) as feedback_count,
    array_agg(distinct rf.mentioned_keywords) as common_keywords,
    avg(length(rf.feedback_text)) as avg_feedback_length
from public.application_tracking at
join public.recruiter_feedback rf on rf.application_id = at.id
group by at.resume_group, rf.sentiment;

-- Refresh materialized views
refresh materialized view resume_view_stats;
refresh materialized view application_success_stats;
refresh materialized view feedback_analysis_stats;
