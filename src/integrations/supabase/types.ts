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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          contact_name: string
          created_at: string
          description: string
          id: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_name: string
          created_at?: string
          description: string
          id?: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_name?: string
          created_at?: string
          description?: string
          id?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_translations: {
        Row: {
          created_at: string
          id: string
          language: string
          section_key: string
          translation_key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          section_key: string
          translation_key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          section_key?: string
          translation_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      directory_websites: {
        Row: {
          avg_position: number | null
          category_id: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          description: string | null
          domain: string
          id: string
          image_path: string | null
          is_active: boolean
          keyword_count: number | null
          phone_number: string | null
          phone_prefix: string | null
          position_change: number | null
          reciprocal_link: string | null
          title: string | null
          top_keyword: string | null
          top_keyword_position: number | null
          updated_at: string
          website_id: string | null
        }
        Insert: {
          avg_position?: number | null
          category_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          keyword_count?: number | null
          phone_number?: string | null
          phone_prefix?: string | null
          position_change?: number | null
          reciprocal_link?: string | null
          title?: string | null
          top_keyword?: string | null
          top_keyword_position?: number | null
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          avg_position?: number | null
          category_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          keyword_count?: number | null
          phone_number?: string | null
          phone_prefix?: string | null
          position_change?: number | null
          reciprocal_link?: string | null
          title?: string | null
          top_keyword?: string | null
          top_keyword_position?: number | null
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directory_websites_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_websites_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_directory_websites_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          click_x: number | null
          click_y: number | null
          client_timestamp: string
          element_classes: string | null
          element_id: string | null
          element_tag: string | null
          event_type: string
          id: string
          ip_address: string | null
          received_at: string
          screen_resolution: string | null
          session_id: string
          url: string
          user_agent: string | null
          website_id: string | null
        }
        Insert: {
          click_x?: number | null
          click_y?: number | null
          client_timestamp: string
          element_classes?: string | null
          element_id?: string | null
          element_tag?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          received_at?: string
          screen_resolution?: string | null
          session_id: string
          url: string
          user_agent?: string | null
          website_id?: string | null
        }
        Update: {
          click_x?: number | null
          click_y?: number | null
          client_timestamp?: string
          element_classes?: string | null
          element_id?: string | null
          element_tag?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          received_at?: string
          screen_resolution?: string | null
          session_id?: string
          url?: string
          user_agent?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing: {
        Row: {
          active: boolean
          created_at: string
          description_en: string | null
          description_fr: string | null
          id: string
          price: number
          title: string
          title_fr: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          price: number
          title: string
          title_fr?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          id?: string
          price?: number
          title?: string
          title_fr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      ranking_requests: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          keyword: string
          priority: number
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
          website_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          keyword: string
          priority?: number
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
          website_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          keyword?: string
          priority?: number
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          website_id?: string
        }
        Relationships: []
      }
      ranking_snapshots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          keyword: string
          position: number | null
          search_engine: string
          snapshot_date: string
          title: string | null
          updated_at: string
          url: string | null
          website_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          keyword: string
          position?: number | null
          search_engine?: string
          snapshot_date?: string
          title?: string | null
          updated_at?: string
          url?: string | null
          website_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          keyword?: string
          position?: number | null
          search_engine?: string
          snapshot_date?: string
          title?: string | null
          updated_at?: string
          url?: string | null
          website_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_snapshots_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_log: {
        Row: {
          action: string
          granted_at: string
          granted_by: string | null
          granted_role: Database["public"]["Enums"]["app_role"]
          id: string
          user_id: string
        }
        Insert: {
          action?: string
          granted_at?: string
          granted_by?: string | null
          granted_role: Database["public"]["Enums"]["app_role"]
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          granted_at?: string
          granted_by?: string | null
          granted_role?: Database["public"]["Enums"]["app_role"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_keyword_preferences: {
        Row: {
          created_at: string
          difficulty_estimate: string | null
          id: string
          is_priority: boolean
          keyword: string
          notes: string | null
          updated_at: string
          user_id: string
          volume_estimate: string | null
          website_id: string
        }
        Insert: {
          created_at?: string
          difficulty_estimate?: string | null
          id?: string
          is_priority?: boolean
          keyword: string
          notes?: string | null
          updated_at?: string
          user_id: string
          volume_estimate?: string | null
          website_id: string
        }
        Update: {
          created_at?: string
          difficulty_estimate?: string | null
          id?: string
          is_priority?: boolean
          keyword?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          volume_estimate?: string | null
          website_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          theme_preference: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme_preference?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          theme_preference?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          is_active: boolean
          pricing_id: string
          started_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          pricing_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          pricing_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_pricing_id_fkey"
            columns: ["pricing_id"]
            isOneToOne: false
            referencedRelation: "pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      websites: {
        Row: {
          avg_position: number
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          description: string | null
          domain: string
          id: string
          image_path: string | null
          keyword_count: number
          keywords: string | null
          phone_number: string | null
          phone_prefix: string | null
          position_change: number
          pricing_id: string | null
          reciprocal_link: string | null
          title: string | null
          top_keyword: string | null
          top_keyword_position: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_position: number
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          image_path?: string | null
          keyword_count: number
          keywords?: string | null
          phone_number?: string | null
          phone_prefix?: string | null
          position_change: number
          pricing_id?: string | null
          reciprocal_link?: string | null
          title?: string | null
          top_keyword?: string | null
          top_keyword_position?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_position?: number
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          image_path?: string | null
          keyword_count?: number
          keywords?: string | null
          phone_number?: string | null
          phone_prefix?: string | null
          position_change?: number
          pricing_id?: string | null
          reciprocal_link?: string | null
          title?: string | null
          top_keyword?: string | null
          top_keyword_position?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "websites_pricing_id_fkey"
            columns: ["pricing_id"]
            isOneToOne: false
            referencedRelation: "pricing"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"]; user_id: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          details?: Json
          event_type: string
          ip_address?: unknown
          target_user_id?: string
          user_agent?: string
        }
        Returns: undefined
      }
      validate_domain: {
        Args: { domain_text: string }
        Returns: boolean
      }
      validate_email: {
        Args: { email_text: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
