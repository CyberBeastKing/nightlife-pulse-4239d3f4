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
      check_ins: {
        Row: {
          checked_in_at: string
          confidence_score: number | null
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          is_automatic: boolean
          latitude: number
          location_accuracy: number | null
          longitude: number
          user_id: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          checked_in_at?: string
          confidence_score?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_automatic?: boolean
          latitude: number
          location_accuracy?: number | null
          longitude: number
          user_id: string
          venue_id: string
          venue_name: string
        }
        Update: {
          checked_in_at?: string
          confidence_score?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          is_automatic?: boolean
          latitude?: number
          location_accuracy?: number | null
          longitude?: number
          user_id?: string
          venue_id?: string
          venue_name?: string
        }
        Relationships: []
      }
      correction_votes: {
        Row: {
          correction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          correction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          correction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "correction_votes_correction_id_fkey"
            columns: ["correction_id"]
            isOneToOne: false
            referencedRelation: "venue_corrections"
            referencedColumns: ["id"]
          },
        ]
      }
      location_sharing: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invite_token: string | null
          recipient_id: string | null
          sharer_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_token?: string | null
          recipient_id?: string | null
          sharer_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_token?: string | null
          recipient_id?: string | null
          sharer_id?: string
          status?: string
        }
        Relationships: []
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
      user_contributions: {
        Row: {
          contribution_points: number
          corrections_approved: number
          corrections_submitted: number
          first_contribution_at: string | null
          photos_approved: number
          photos_submitted: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution_points?: number
          corrections_approved?: number
          corrections_submitted?: number
          first_contribution_at?: string | null
          photos_approved?: number
          photos_submitted?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution_points?: number
          corrections_approved?: number
          corrections_submitted?: number
          first_contribution_at?: string | null
          photos_approved?: number
          photos_submitted?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_checkin_enabled: boolean
          block_place_suggestions: boolean
          contribute_location: boolean
          created_at: string
          hide_from_join_prompts: boolean
          id: string
          mute_venue_chats: boolean
          push_notifications: boolean
          updated_at: string
          user_id: string
          vibe_preference: number
        }
        Insert: {
          auto_checkin_enabled?: boolean
          block_place_suggestions?: boolean
          contribute_location?: boolean
          created_at?: string
          hide_from_join_prompts?: boolean
          id?: string
          mute_venue_chats?: boolean
          push_notifications?: boolean
          updated_at?: string
          user_id: string
          vibe_preference?: number
        }
        Update: {
          auto_checkin_enabled?: boolean
          block_place_suggestions?: boolean
          contribute_location?: boolean
          created_at?: string
          hide_from_join_prompts?: boolean
          id?: string
          mute_venue_chats?: boolean
          push_notifications?: boolean
          updated_at?: string
          user_id?: string
          vibe_preference?: number
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
      venue_corrections: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          correction_type: string
          created_at: string
          id: string
          matching_correction_hash: string
          new_latitude: number | null
          new_longitude: number | null
          new_value: string | null
          notes: string | null
          old_value: string | null
          status: string
          user_id: string
          venue_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          correction_type: string
          created_at?: string
          id?: string
          matching_correction_hash: string
          new_latitude?: number | null
          new_longitude?: number | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          status?: string
          user_id: string
          venue_id: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          correction_type?: string
          created_at?: string
          id?: string
          matching_correction_hash?: string
          new_latitude?: number | null
          new_longitude?: number | null
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          status?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: []
      }
      venue_photo_submissions: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
          venue_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
          venue_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
          venue_id?: string
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
      calculate_distance_meters: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      can_submit_correction: { Args: { p_user_id: string }; Returns: boolean }
      cleanup_expired_messages: { Args: never; Returns: undefined }
      get_user_strike_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      has_recent_checkin: {
        Args: { cooldown_minutes?: number; target_user_id: string }
        Returns: boolean
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
      undo_checkin: { Args: { p_checkin_id: string }; Returns: Json }
      validate_and_create_checkin: {
        Args: {
          p_is_automatic?: boolean
          p_location_accuracy?: number
          p_user_lat: number
          p_user_lon: number
          p_venue_id: string
          p_venue_lat: number
          p_venue_lon: number
          p_venue_name: string
        }
        Returns: Json
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
