export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          job_title: string
          company: string
          tracking_url: string
          job_listing_url: string | null
          status: 'active' | 'archived' | 'deleted'
          version: number
          created_at: string
          updated_at: string
          archived_at: string | null
          original_content: string | null
          metadata: Json
          layout_preferences: Json
          tags: string[]
          company_type: string | null
          job_level: string | null
          application_status: 'draft' | 'sent' | 'interviewing' | 'rejected' | 'accepted' | null
          last_accessed_at: string | null
          last_modified_by: string | null
          view_count: number
          unique_locations: number
          avg_view_duration: number
        }
        Insert: {
          id?: string
          job_title: string
          company: string
          tracking_url: string
          job_listing_url?: string | null
          status?: 'active' | 'archived' | 'deleted'
          version?: number
          created_at?: string
          updated_at?: string
          archived_at?: string | null
          original_content?: string | null
          metadata?: Json
          layout_preferences?: Json
          tags?: string[]
          company_type?: string | null
          job_level?: string | null
          application_status?: 'draft' | 'sent' | 'interviewing' | 'rejected' | 'accepted' | null
          last_accessed_at?: string | null
          last_modified_by?: string | null
          view_count?: number
          unique_locations?: number
          avg_view_duration?: number
        }
        Update: {
          id?: string
          job_title?: string
          company?: string
          tracking_url?: string
          job_listing_url?: string | null
          status?: 'active' | 'archived' | 'deleted'
          version?: number
          created_at?: string
          updated_at?: string
          archived_at?: string | null
          original_content?: string | null
          metadata?: Json
          layout_preferences?: Json
          tags?: string[]
          company_type?: string | null
          job_level?: string | null
          application_status?: 'draft' | 'sent' | 'interviewing' | 'rejected' | 'accepted' | null
          last_accessed_at?: string | null
          last_modified_by?: string | null
          view_count?: number
          unique_locations?: number
          avg_view_duration?: number
        }
      }
      tracking_logs: {
        Row: {
          id: string
          resume_id: string
          ip_address: string
          user_agent: string
          timestamp: string
          country: string | null
          city: string | null
          view_duration: number | null
          metadata: Json
          is_bot: boolean
          device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
          browser: string | null
          os: string | null
          referrer: string | null
          retention_expires_at: string
          engagement_metrics: Json
        }
        Insert: {
          id?: string
          resume_id: string
          ip_address: string
          user_agent: string
          timestamp?: string
          country?: string | null
          city?: string | null
          view_duration?: number | null
          metadata?: Json
          is_bot?: boolean
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown'
          browser?: string | null
          os?: string | null
          referrer?: string | null
          retention_expires_at?: string
          engagement_metrics?: Json
        }
        Update: {
          id?: string
          resume_id?: string
          ip_address?: string
          user_agent?: string
          timestamp?: string
          country?: string | null
          city?: string | null
          view_duration?: number | null
          metadata?: Json
          is_bot?: boolean
          device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown'
          browser?: string | null
          os?: string | null
          referrer?: string | null
          retention_expires_at?: string
          engagement_metrics?: Json
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          email_notifications: boolean
          retention_period: number
          dashboard_layout: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_notifications?: boolean
          retention_period?: number
          dashboard_layout?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          email_notifications?: boolean
          retention_period?: number
          dashboard_layout?: Json
          created_at?: string
          updated_at?: string
        }
      }
      application_tracking: {
        Row: {
          id: string
          resume_id: string
          company_name: string
          position: string
          application_date: string
          status: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn'
          last_interaction: string | null
          next_steps: string | null
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          company_name: string
          position: string
          application_date?: string
          status?: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn'
          last_interaction?: string | null
          next_steps?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          company_name?: string
          position?: string
          application_date?: string
          status?: 'applied' | 'screening' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn'
          last_interaction?: string | null
          next_steps?: string | null
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 