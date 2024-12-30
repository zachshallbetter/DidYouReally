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
      companies: {
        Row: {
          id: string
          name: string
          website: string | null
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          job_title: string
          company_id: string
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
          company_id: string
          tracking_url: string
          job_listing_url?: string | null
          status: 'active' | 'archived' | 'deleted'
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
          company_id?: string
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
          event_type: 'view' | 'send' | 'open' | 'click' | 'download' | null
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
          retention_expires_at: string
          engagement_metrics?: Json
          event_type?: 'view' | 'send' | 'open' | 'click' | 'download' | null
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
          event_type?: 'view' | 'send' | 'open' | 'click' | 'download' | null
        }
      }
      resume_events: {
        Row: {
          id: string
          resume_id: string
          event_type: 'view' | 'send' | 'open' | 'click' | 'download'
          occurred_at: string
          actor: string | null
          metadata: Json
          device_info: Json
          location_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          event_type: 'view' | 'send' | 'open' | 'click' | 'download'
          occurred_at?: string
          actor?: string | null
          metadata?: Json
          device_info?: Json
          location_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          event_type?: 'view' | 'send' | 'open' | 'click' | 'download'
          occurred_at?: string
          actor?: string | null
          metadata?: Json
          device_info?: Json
          location_info?: Json
          created_at?: string
          updated_at?: string
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
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

