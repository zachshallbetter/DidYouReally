import { type Database } from '@/types/supabase';

export type TrackingLog = Database['public']['Tables']['tracking_logs']['Row'];
export type Json = Database['public']['Tables']['tracking_logs']['Row']['metadata']; 