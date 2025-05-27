export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          id: string
          is_active: boolean
          pricing_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          pricing_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          pricing_id?: string
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
        Args: { user_id: string; role: Database["public"]["Enums"]["app_role"] }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
