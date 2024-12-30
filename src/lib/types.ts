import { type Database } from '@/types/supabase';

export type TrackingLog = Database['public']['Tables']['tracking_logs']['Row'];
export type Resume = Database['public']['Tables']['resumes']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type ResumeEvent = Database['public']['Tables']['resume_events']['Row'];
export type Json = Database['public']['Tables']['tracking_logs']['Row']['metadata']; 