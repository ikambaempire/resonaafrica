export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          blurb: string | null
          created_at: string
          emoji: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          blurb?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          blurb?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled_at: string | null
          id: string
          is_read: boolean
          message: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          handled_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          handled_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      creator_integrations: {
        Row: {
          connected_at: string
          external_id: string | null
          handle: string | null
          id: string
          last_sync_at: string | null
          metadata: Json
          provider: string
          user_id: string
        }
        Insert: {
          connected_at?: string
          external_id?: string | null
          handle?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json
          provider: string
          user_id: string
        }
        Update: {
          connected_at?: string
          external_id?: string | null
          handle?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_entries: {
        Row: {
          category: string
          city: string | null
          contact_email: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_hidden: boolean
          logo_url: string | null
          name: string
          sort_order: number
          tags: string[] | null
          updated_at: string
          video_url: string | null
          website: string | null
        }
        Insert: {
          category: string
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_hidden?: boolean
          logo_url?: string | null
          name: string
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          website?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          contact_email?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_hidden?: boolean
          logo_url?: string | null
          name?: string
          sort_order?: number
          tags?: string[] | null
          updated_at?: string
          video_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      episode_plays: {
        Row: {
          anon_id: string | null
          created_at: string
          episode_id: string
          id: string
          listened_seconds: number
          podcast_id: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          episode_id: string
          id?: string
          listened_seconds?: number
          podcast_id: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          listened_seconds?: number
          podcast_id?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episode_plays_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_plays_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          ai_clips: Json | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          embed_provider: Database["public"]["Enums"]["embed_provider"] | null
          embed_url: string | null
          hosting: Database["public"]["Enums"]["hosting_type"]
          id: string
          is_premium: boolean
          media_kind: string | null
          media_url: string | null
          owner_id: string
          podcast_id: string
          published_at: string | null
          scheduled_at: string | null
          slug: string
          status: Database["public"]["Enums"]["episode_status"]
          title: string
          transcript: string | null
          updated_at: string
          youtube_video_id: string | null
          youtube_views: number
          youtube_views_synced_at: string | null
        }
        Insert: {
          ai_clips?: Json | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          embed_provider?: Database["public"]["Enums"]["embed_provider"] | null
          embed_url?: string | null
          hosting?: Database["public"]["Enums"]["hosting_type"]
          id?: string
          is_premium?: boolean
          media_kind?: string | null
          media_url?: string | null
          owner_id: string
          podcast_id: string
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["episode_status"]
          title: string
          transcript?: string | null
          updated_at?: string
          youtube_video_id?: string | null
          youtube_views?: number
          youtube_views_synced_at?: string | null
        }
        Update: {
          ai_clips?: Json | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          embed_provider?: Database["public"]["Enums"]["embed_provider"] | null
          embed_url?: string | null
          hosting?: Database["public"]["Enums"]["hosting_type"]
          id?: string
          is_premium?: boolean
          media_kind?: string | null
          media_url?: string | null
          owner_id?: string
          podcast_id?: string
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["episode_status"]
          title?: string
          transcript?: string | null
          updated_at?: string
          youtube_video_id?: string | null
          youtube_views?: number
          youtube_views_synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          unsubscribe_token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          unsubscribe_token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          unsubscribe_token?: string
        }
        Relationships: []
      }
      podcast_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          podcast_id: string
          unsubscribe_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          podcast_id: string
          unsubscribe_token?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          podcast_id?: string
          unsubscribe_token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_subscribers_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          explicit: boolean
          id: string
          is_featured: boolean
          is_published: boolean
          language: string | null
          owner_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          explicit?: boolean
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string | null
          owner_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          explicit?: boolean
          id?: string
          is_featured?: boolean
          is_published?: boolean
          language?: string | null
          owner_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          podcast_id: string
          price_id: string | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          podcast_id: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          podcast_id?: string
          price_id?: string | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_followers: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          profile_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_followers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: string | null
          company: string | null
          company_description: string | null
          company_slug: string | null
          cover_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_setup_complete: boolean
          profile_kind: string | null
          social_links: Json | null
          updated_at: string
          username: string | null
          website: string | null
          youtube_channel_id: string | null
          youtube_handle: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          cover_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_setup_complete?: boolean
          profile_kind?: string | null
          social_links?: Json | null
          updated_at?: string
          username?: string | null
          website?: string | null
          youtube_channel_id?: string | null
          youtube_handle?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          company?: string | null
          company_description?: string | null
          company_slug?: string | null
          cover_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_setup_complete?: boolean
          profile_kind?: string | null
          social_links?: Json | null
          updated_at?: string
          username?: string | null
          website?: string | null
          youtube_channel_id?: string | null
          youtube_handle?: string | null
        }
        Relationships: []
      }
      studio_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          start_time: string
          studio_id: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          studio_id: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          studio_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "studio_availability_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_bookings: {
        Row: {
          booker_email: string
          booker_name: string
          booker_user_id: string | null
          created_at: string
          currency: string
          end_at: string
          environment: string
          hours: number
          id: string
          notes: string | null
          owner_id: string
          paddle_transaction_id: string | null
          platform_fee_cents: number
          start_at: string
          status: string
          studio_id: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          booker_email: string
          booker_name: string
          booker_user_id?: string | null
          created_at?: string
          currency?: string
          end_at: string
          environment?: string
          hours: number
          id?: string
          notes?: string | null
          owner_id: string
          paddle_transaction_id?: string | null
          platform_fee_cents?: number
          start_at: string
          status?: string
          studio_id: string
          total_cents: number
          updated_at?: string
        }
        Update: {
          booker_email?: string
          booker_name?: string
          booker_user_id?: string | null
          created_at?: string
          currency?: string
          end_at?: string
          environment?: string
          hours?: number
          id?: string
          notes?: string | null
          owner_id?: string
          paddle_transaction_id?: string | null
          platform_fee_cents?: number
          start_at?: string
          status?: string
          studio_id?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_bookings_studio_id_fkey"
            columns: ["studio_id"]
            isOneToOne: false
            referencedRelation: "studios"
            referencedColumns: ["id"]
          },
        ]
      }
      studios: {
        Row: {
          amenities: string[]
          capacity: number
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          hourly_rate_cents: number
          id: string
          is_published: boolean
          name: string
          owner_id: string
          photos: string[]
          slug: string
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          capacity?: number
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          hourly_rate_cents?: number
          id?: string
          is_published?: boolean
          name: string
          owner_id: string
          photos?: string[]
          slug: string
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          capacity?: number
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          hourly_rate_cents?: number
          id?: string
          is_published?: boolean
          name?: string
          owner_id?: string
          photos?: string[]
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          environment: string
          episode_id: string | null
          id: string
          message: string | null
          paddle_transaction_id: string | null
          platform_fee_cents: number
          podcast_id: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          environment?: string
          episode_id?: string | null
          id?: string
          message?: string | null
          paddle_transaction_id?: string | null
          platform_fee_cents?: number
          podcast_id: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          environment?: string
          episode_id?: string | null
          id?: string
          message?: string | null
          paddle_transaction_id?: string | null
          platform_fee_cents?: number
          podcast_id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tips_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tips_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_later: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_later_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          category: string
          company: string
          created_at: string
          email: string
          full_name: string
          id: string
          profile_kind: string
          roles: string[]
          username: string
          website: string
        }[]
      }
      get_public_profile: {
        Args: { _username: string }
        Returns: {
          avatar_url: string
          bio: string
          category: string
          company: string
          cover_url: string
          episode_count: number
          follower_count: number
          full_name: string
          id: string
          podcast_count: number
          profile_kind: string
          social_links: Json
          username: string
          website: string
        }[]
      }
      get_top_podcasts: {
        Args: { _limit?: number }
        Returns: {
          category: string
          cover_url: string
          plays: number
          podcast_id: string
          resona_views: number
          slug: string
          title: string
          youtube_views: number
        }[]
      }
      grant_role_by_email: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: string
      }
      has_active_premium: {
        Args: { _podcast_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      podcast_public_stats: {
        Args: { _podcast_id: string }
        Returns: {
          day: string
          day_plays: number
          total_plays: number
          total_seconds: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "creator" | "studio_owner"
      email_template_type: "confirmation" | "reminder" | "followup"
      embed_provider: "youtube" | "spotify" | "apple" | "soundcloud" | "other"
      episode_status: "draft" | "scheduled" | "published"
      hosting_type: "native" | "embed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "viewer", "creator", "studio_owner"],
      email_template_type: ["confirmation", "reminder", "followup"],
      embed_provider: ["youtube", "spotify", "apple", "soundcloud", "other"],
      episode_status: ["draft", "scheduled", "published"],
      hosting_type: ["native", "embed"],
    },
  },
} as const
