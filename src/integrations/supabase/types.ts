export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_output: {
        Row: {
          context: string | null
          created_at: string
          id: string
          performance: string | null
          risk_category: string | null
          screening_criterion: string | null
          sr_no: string | null
          threshold: string | null
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          performance?: string | null
          risk_category?: string | null
          screening_criterion?: string | null
          sr_no?: string | null
          threshold?: string | null
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          performance?: string | null
          risk_category?: string | null
          screening_criterion?: string | null
          sr_no?: string | null
          threshold?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      assessment_documents: {
        Row: {
          assessment_id: string
          content_type: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          session_id: string | null
          title: string | null
          updated_at: string
          uploaded_at: string
          url: string | null
        }
        Insert: {
          assessment_id: string
          content_type?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          session_id?: string | null
          title?: string | null
          updated_at?: string
          uploaded_at?: string
          url?: string | null
        }
        Update: {
          assessment_id?: string
          content_type?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          session_id?: string | null
          title?: string | null
          updated_at?: string
          uploaded_at?: string
          url?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          created_at: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          chat_id: string
          conversation: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          chat_id: string
          conversation?: string
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          conversation?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      final_results: {
        Row: {
          assessment_outcome: string | null
          chat_model: string | null
          context: string | null
          created_at: string
          embedding_model: string | null
          id: number
          page_number: string | null
          performance: string | null
          referenced_document: string | null
          risk_category: string | null
          screening_criteria: string | null
          session_id: string | null
          sr_no: string | null
          threshold: string | null
        }
        Insert: {
          assessment_outcome?: string | null
          chat_model?: string | null
          context?: string | null
          created_at?: string
          embedding_model?: string | null
          id?: number
          page_number?: string | null
          performance?: string | null
          referenced_document?: string | null
          risk_category?: string | null
          screening_criteria?: string | null
          session_id?: string | null
          sr_no?: string | null
          threshold?: string | null
        }
        Update: {
          assessment_outcome?: string | null
          chat_model?: string | null
          context?: string | null
          created_at?: string
          embedding_model?: string | null
          id?: number
          page_number?: string | null
          performance?: string | null
          referenced_document?: string | null
          risk_category?: string | null
          screening_criteria?: string | null
          session_id?: string | null
          sr_no?: string | null
          threshold?: string | null
        }
        Relationships: []
      }
      test_results: {
        Row: {
          chat_model: string | null
          client: string | null
          context: string | null
          created_at: string
          embedding_model: string | null
          id: number
          kpi: string | null
          response: string | null
          session_id: string | null
          source: string | null
        }
        Insert: {
          chat_model?: string | null
          client?: string | null
          context?: string | null
          created_at?: string
          embedding_model?: string | null
          id?: number
          kpi?: string | null
          response?: string | null
          session_id?: string | null
          source?: string | null
        }
        Update: {
          chat_model?: string | null
          client?: string | null
          context?: string | null
          created_at?: string
          embedding_model?: string | null
          id?: number
          kpi?: string | null
          response?: string | null
          session_id?: string | null
          source?: string | null
        }
        Relationships: []
      }
      user_remarks: {
        Row: {
          created_at: string
          id: string
          session_id: string
          updated_at: string
          uploaded_document_name: string | null
          user_comment: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          updated_at?: string
          uploaded_document_name?: string | null
          user_comment: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
          uploaded_document_name?: string | null
          user_comment?: string
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clear_test_results: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_final_results: {
        Args: { session_id_param: string }
        Returns: {
          id: number
          sr_no: string
          risk_category: string
          screening_criteria: string
          threshold: string
          performance: string
          assessment_outcome: string
          session_id: string
          referenced_document: string
          page_number: string
          context: string
          chat_model: string
          embedding_model: string
          created_at: string
        }[]
      }
      upsert_chatbot_conversation: {
        Args: { p_session_id: string; p_chat_id: string; p_new_message: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
