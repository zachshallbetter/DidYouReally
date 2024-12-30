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
          original_content: string | null
          metadata: Json
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
          original_content?: string | null
          metadata?: Json
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
          original_content?: string | null
          metadata?: Json
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
          retention_expires_at: string
        }
      }
      error_logs: {
        Row: {
          id: string
          endpoint: string
          error_message: string
          stack_trace: string | null
          timestamp: string
          severity: string
          resolved: boolean
          context: Json
          retention_expires_at: string
        }
        Insert: {
          id?: string
          endpoint: string
          error_message: string
          stack_trace?: string | null
          timestamp?: string
          severity?: string
          resolved?: boolean
          context?: Json
          retention_expires_at?: string
        }
        Update: {
          id?: string
          endpoint?: string
          error_message?: string
          stack_trace?: string | null
          timestamp?: string
          severity?: string
          resolved?: boolean
          context?: Json
          retention_expires_at?: string
        }
      }
      application_tracking: {
        Row: {
          id: string
          resume_group: string
          company_type: string
          job_level: string
          application_date: string
          response_received: boolean
          response_date: string | null
          response_type: string | null
          days_to_response: number | null
          metadata: Json
          notes: string | null
        }
        Insert: {
          id?: string
          resume_group: string
          company_type: string
          job_level: string
          application_date?: string
          response_received?: boolean
          response_date?: string | null
          response_type?: string | null
          days_to_response?: number | null
          metadata?: Json
          notes?: string | null
        }
        Update: {
          id?: string
          resume_group?: string
          company_type?: string
          job_level?: string
          application_date?: string
          response_received?: boolean
          response_date?: string | null
          response_type?: string | null
          days_to_response?: number | null
          metadata?: Json
          notes?: string | null
        }
      }
      recruiter_feedback: {
        Row: {
          id: string
          application_id: string
          feedback_type: string
          feedback_text: string
          mentioned_keywords: string[]
          sentiment: string
          created_at: string
          metadata: Json
          is_anonymous: boolean
        }
        Insert: {
          id?: string
          application_id: string
          feedback_type: string
          feedback_text: string
          mentioned_keywords: string[]
          sentiment: string
          created_at?: string
          metadata?: Json
          is_anonymous?: boolean
        }
        Update: {
          id?: string
          application_id?: string
          feedback_type?: string
          feedback_text?: string
          mentioned_keywords?: string[]
          sentiment?: string
          created_at?: string
          metadata?: Json
          is_anonymous?: boolean
        }
      }
    }
    Views: {
      resume_view_stats: {
        Row: {
          resume_id: string
          job_title: string
          company: string
          status: string
          view_count: number
          unique_viewers: number
          last_viewed: string | null
          first_viewed: string | null
          avg_view_duration: string | null
          viewer_countries: string[]
        }
      }
      application_success_stats: {
        Row: {
          resume_group: string
          company_type: string
          job_level: string
          total_applications: number
          response_rate: number
          avg_response_time: number | null
          interview_rate: number
          offer_rate: number
        }
      }
      feedback_analysis_stats: {
        Row: {
          resume_group: string
          sentiment: string
          feedback_count: number
          common_keywords: string[][]
          avg_feedback_length: number
        }
      }
    }
    Functions: {
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: unknown
      }
    }
    Enums: {
      resume_status: 'active' | 'archived' | 'deleted'
      company_type: 'startup' | 'smb' | 'enterprise' | 'agency' | 'other'
      job_level: 'entry' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive'
      response_type: 'screen' | 'interview' | 'offer' | 'rejection'
      feedback_type: 'interview_feedback' | 'screening_feedback' | 'general_feedback'
      sentiment_type: 'positive' | 'neutral' | 'negative'
    }
  }
} 