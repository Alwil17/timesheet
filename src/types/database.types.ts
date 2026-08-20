// Auto-generated types matching the database schema.
// Re-run `supabase gen types typescript` to refresh after schema changes.

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          weekly_goal_hours: number | null
          monthly_goal_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          weekly_goal_hours?: number | null
          monthly_goal_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          weekly_goal_hours?: number | null
          monthly_goal_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          description: string | null
          is_internal: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_internal?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          is_internal?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'clients_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          client_id: string
          is_active: boolean
          hourly_rate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client_id: string
          is_active?: boolean
          hourly_rate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          client_id?: string
          is_active?: boolean
          hourly_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'projects_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
      time_entries: {
        Row: {
          id: string
          project_id: string
          user_id: string
          start_time: string
          end_time: string | null
          description: string | null
          is_billable: boolean
          duration_seconds: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          description?: string | null
          is_billable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          end_time?: string | null
          description?: string | null
          is_billable?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'time_entries_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
        }
        Update: {
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tags_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      time_entry_tags: {
        Row: {
          time_entry_id: string
          tag_id: string
        }
        Insert: {
          time_entry_id: string
          tag_id: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'time_entry_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'time_entry_tags_time_entry_id_fkey'
            columns: ['time_entry_id']
            isOneToOne: false
            referencedRelation: 'time_entries'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      auto_stop_stale_timers: {
        Args: { max_hours?: number }
        Returns: Database['public']['Tables']['time_entries']['Row'][]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ─── Convenience aliases ──────────────────────────────────────
export type User        = Database['public']['Tables']['users']['Row']
export type Client      = Database['public']['Tables']['clients']['Row']
export type Project     = Database['public']['Tables']['projects']['Row']
export type TimeEntry   = Database['public']['Tables']['time_entries']['Row']
export type Tag         = Database['public']['Tables']['tags']['Row']
export type TimeEntryTag = Database['public']['Tables']['time_entry_tags']['Row']

// Extended types with relations
export type ProjectWithClient = Project & { client?: Client }
export type TimeEntryWithProject = TimeEntry & {
  project?: ProjectWithClient
}
