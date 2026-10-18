export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ReportType = 'lost' | 'found'
export type ReportStatus = 'active' | 'claim_in_progress' | 'resolved' | 'stored' | 'hidden'
export type UserRole = 'mahasiswa' | 'dosen' | 'staf_kebersihan' | 'satpam' | 'admin'
export type FlagReason = 'spam' | 'tidak_pantas' | 'data_pribadi' | 'lainnya'
export type FlagStatus = 'open' | 'reviewed' | 'dismissed'
export type AdminAction = 'hide_report' | 'restore_report' | 'delete_report' | 'deactivate_user' | 'activate_user'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          phone: string | null
          email_verified_at: string | null
          is_active: boolean
          avatar_url: string | null
          created_at: string
          password?: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: UserRole
          phone?: string | null
          email_verified_at?: string | null
          is_active?: boolean
          avatar_url?: string | null
          created_at?: string
          password?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          phone?: string | null
          email_verified_at?: string | null
          is_active?: boolean
          avatar_url?: string | null
          created_at?: string
          password?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          type: ReportType
          category_id: number
          location_id: number | null
          location_text: string | null
          event_at: string
          description: string
          title: string
          photo_url: string | null
          safe_location: string | null
          hidden_features: string | null
          contact: string | null
          status: ReportStatus
          resolved_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: ReportType
          category_id: number
          location_id?: number | null
          location_text?: string | null
          event_at: string
          description: string
          title: string
          photo_url?: string | null
          safe_location?: string | null
          hidden_features?: string | null
          contact?: string | null
          status?: ReportStatus
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: ReportType
          category_id?: number
          location_id?: number | null
          location_text?: string | null
          event_at?: string
          description?: string
          title?: string
          photo_url?: string | null
          safe_location?: string | null
          hidden_features?: string | null
          contact?: string | null
          status?: ReportStatus
          resolved_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      locations: {
        Row: {
          id: number
          campus: string
          building: string
          floor: string | null
          is_active: boolean
        }
        Insert: {
          id?: number
          campus: string
          building: string
          floor?: string | null
          is_active?: boolean
        }
        Update: {
          id?: number
          campus?: string
          building?: string
          floor?: string | null
          is_active?: boolean
        }
      }
      report_flags: {
        Row: {
          id: string
          report_id: string
          reporter_id: string
          reason: FlagReason
          note: string | null
          status: FlagStatus
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          reporter_id: string
          reason: FlagReason
          note?: string | null
          status?: FlagStatus
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          reporter_id?: string
          reason?: FlagReason
          note?: string | null
          status?: FlagStatus
          created_at?: string
        }
      }
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action: AdminAction
          target_report_id: string | null
          target_user_id: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: AdminAction
          target_report_id?: string | null
          target_user_id?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: AdminAction
          target_report_id?: string | null
          target_user_id?: string | null
          note?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export interface ReportWithRelations extends Tables<'reports'> {
  users?: Tables<'users'> | null
  categories?: Tables<'categories'> | null
  locations?: Tables<'locations'> | null
  flags_count?: number
}

export interface ReportFlagWithRelations extends Tables<'report_flags'> {
  reports?: Tables<'reports'> | null
  reporter?: Tables<'users'> | null
}

export interface AdminActionWithRelations extends Tables<'admin_actions'> {
  admin?: Tables<'users'> | null
  target_report?: Tables<'reports'> | null
  target_user?: Tables<'users'> | null
}
