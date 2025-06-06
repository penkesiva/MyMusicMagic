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
      tracks: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          duration: number
          audio_url: string
          thumbnail_url: string
          composer_notes: string | null
          lyrics: string | null
          release_date: string | null
          is_published: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          duration: number
          audio_url: string
          thumbnail_url: string
          composer_notes?: string | null
          lyrics?: string | null
          release_date?: string | null
          is_published?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          duration?: number
          audio_url?: string
          thumbnail_url?: string
          composer_notes?: string | null
          lyrics?: string | null
          release_date?: string | null
          is_published?: boolean
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
        }
      }
      artist_info: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          about_text: string
          photo_url: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          about_text: string
          photo_url: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          about_text?: string
          photo_url?: string
          user_id?: string
        }
      }
      artist_links: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          url: string
          artist_info_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          url: string
          artist_info_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          url?: string
          artist_info_id?: string
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
  }
} 