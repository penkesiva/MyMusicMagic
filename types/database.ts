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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_portfolio_settings: {
        Row: {
          id: string
          user_id: string
          portfolio_title: string
          portfolio_description: string | null
          theme_color: string
          custom_domain: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          portfolio_title?: string
          portfolio_description?: string | null
          theme_color?: string
          custom_domain?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          portfolio_title?: string
          portfolio_description?: string | null
          theme_color?: string
          custom_domain?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          industry: string
          style: string
          preview_image_url: string | null
          theme_colors: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          industry: string
          style: string
          preview_image_url?: string | null
          theme_colors?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          industry?: string
          style?: string
          preview_image_url?: string | null
          theme_colors?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      user_portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          template_id: string | null
          is_published: boolean
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          template_id?: string | null
          is_published?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          template_id?: string | null
          is_published?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
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
          use_same_text: boolean
          footer_text: string | null
          homepage_title: string
          homepage_description: string
          homepage_hero_url: string
          about_artist_title: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          about_text: string
          photo_url: string
          user_id: string
          use_same_text?: boolean
          footer_text?: string | null
          homepage_title?: string
          homepage_description?: string
          homepage_hero_url?: string
          about_artist_title?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          about_text?: string
          photo_url?: string
          user_id?: string
          use_same_text?: boolean
          footer_text?: string | null
          homepage_title?: string
          homepage_description?: string
          homepage_hero_url?: string
          about_artist_title?: string
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
      gallery: {
        Row: {
          id: string
          title: string
          image_url: string
          video_url: string | null
          media_type: string
          description: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          video_url?: string | null
          media_type?: string
          description?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          video_url?: string | null
          media_type?: string
          description?: string | null
          date?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          email: string
          message: string
          created_at: string
          is_read: boolean
        }
        Insert: {
          id?: string
          email: string
          message: string
          created_at?: string
          is_read?: boolean
        }
        Update: {
          id?: string
          email?: string
          message?: string
          created_at?: string
          is_read?: boolean
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