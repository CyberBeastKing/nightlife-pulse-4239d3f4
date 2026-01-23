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
      message_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          message_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed: boolean
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          message_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          reviewed?: boolean
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          reviewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "anonymous_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
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
      user_chat_bans: {
        Row: {
          banned_at: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_strikes: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          status: Database["public"]["Enums"]["strike_status"]
          strike_number: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          status?: Database["public"]["Enums"]["strike_status"]
          strike_number: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          status?: Database["public"]["Enums"]["strike_status"]
          strike_number?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_strikes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "anonymous_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_strikes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_strike_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      is_over_21: { Args: { dob: string }; Returns: boolean }
      is_user_chat_banned: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      process_report_and_issue_strike: {
        Args: { issue_strike?: boolean; report_id: string }
        Returns: undefined
      }
    }
    Enums: {
      gender_identity: "male" | "female" | "lgbtq"
      report_reason:
        | "harassment"
        | "spam"
        | "inappropriate_content"
        | "threats"
        | "personal_info"
        | "other"
      sender_label:
        | "someone_nearby"
        | "just_arrived"
        | "leaving_soon"
        | "regular"
      strike_status: "warning" | "strike" | "ban"
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
      report_reason: [
        "harassment",
        "spam",
        "inappropriate_content",
        "threats",
        "personal_info",
        "other",
      ],
      sender_label: [
        "someone_nearby",
        "just_arrived",
        "leaving_soon",
        "regular",
      ],
      strike_status: ["warning", "strike", "ban"],
    },
  },
} as const
