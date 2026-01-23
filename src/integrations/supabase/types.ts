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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          downvotes: number
          expires_at: string
          id: string
          sender_label: Database["public"]["Enums"]["sender_label"]
          upvotes: number
          user_id: string
          venue_chat_id: string
        }
        Insert: {
          content: string
          created_at?: string
          downvotes?: number
          expires_at?: string
          id?: string
          sender_label?: Database["public"]["Enums"]["sender_label"]
          upvotes?: number
          user_id: string
          venue_chat_id: string
        }
        Update: {
          content?: string
          created_at?: string
          downvotes?: number
          expires_at?: string
          id?: string
          sender_label?: Database["public"]["Enums"]["sender_label"]
          upvotes?: number
          user_id?: string
          venue_chat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_venue_chat_id_fkey"
            columns: ["venue_chat_id"]
            isOneToOne: false
            referencedRelation: "venue_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string
          gender: Database["public"]["Enums"]["gender_identity"]
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth: string
          gender: Database["public"]["Enums"]["gender_identity"]
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string
          gender?: Database["public"]["Enums"]["gender_identity"]
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      venue_chats: {
        Row: {
          category: string
          created_at: string
          id: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          venue_id: string
          venue_name: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          venue_id?: string
          venue_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      anonymous_messages: {
        Row: {
          content: string | null
          created_at: string | null
          downvotes: number | null
          expires_at: string | null
          id: string | null
          sender_label: Database["public"]["Enums"]["sender_label"] | null
          upvotes: number | null
          venue_chat_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          expires_at?: string | null
          id?: string | null
          sender_label?: Database["public"]["Enums"]["sender_label"] | null
          upvotes?: number | null
          venue_chat_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          downvotes?: number | null
          expires_at?: string | null
          id?: string | null
          sender_label?: Database["public"]["Enums"]["sender_label"] | null
          upvotes?: number | null
          venue_chat_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_venue_chat_id_fkey"
            columns: ["venue_chat_id"]
            isOneToOne: false
            referencedRelation: "venue_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          gender: Database["public"]["Enums"]["gender_identity"] | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          gender?: Database["public"]["Enums"]["gender_identity"] | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_messages: { Args: never; Returns: undefined }
      is_over_21: { Args: { dob: string }; Returns: boolean }
    }
    Enums: {
      gender_identity: "male" | "female" | "lgbtq"
      sender_label:
        | "someone_nearby"
        | "just_arrived"
        | "leaving_soon"
        | "regular"
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
      gender_identity: ["male", "female", "lgbtq"],
      sender_label: [
        "someone_nearby",
        "just_arrived",
        "leaving_soon",
        "regular",
      ],
    },
  },
} as const
