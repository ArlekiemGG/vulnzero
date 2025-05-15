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
      badges: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          rarity: string
          required_count: number | null
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: string
          name: string
          rarity: string
          required_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          rarity?: string
          required_count?: number | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string
          created_at: string
          duration_minutes: number
          id: string
          position: number
          section_id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content: string
          created_at?: string
          duration_minutes: number
          id?: string
          position: number
          section_id: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          position?: number
          section_id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          image_url: string
          instructor: string
          level: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          duration_minutes: number
          id?: string
          image_url: string
          instructor: string
          level: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          image_url?: string
          instructor?: string
          level?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ctf_registrations: {
        Row: {
          ctf_id: number
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          ctf_id: number
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          ctf_id?: number
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      machine_hints: {
        Row: {
          content: string
          created_at: string
          id: string
          level: number
          machine_id: string
          point_cost: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          level: number
          machine_id: string
          point_cost?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          level?: number
          machine_id?: string
          point_cost?: number
          title?: string
        }
        Relationships: []
      }
      machine_sessions: {
        Row: {
          connection_info: Json | null
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          machine_type_id: string
          password: string | null
          session_id: string
          started_at: string
          status: string
          terminated_at: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          connection_info?: Json | null
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          machine_type_id: string
          password?: string | null
          session_id: string
          started_at?: string
          status: string
          terminated_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          connection_info?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          machine_type_id?: string
          password?: string | null
          session_id?: string
          started_at?: string
          status?: string
          terminated_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machine_sessions_machine_type_id_fkey"
            columns: ["machine_type_id"]
            isOneToOne: false
            referencedRelation: "machine_types"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_sessions_history: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          machine_type_id: string
          session_id: string
          started_at: string
          status: string
          terminated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          machine_type_id: string
          session_id: string
          started_at: string
          status: string
          terminated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          machine_type_id?: string
          session_id?: string
          started_at?: string
          status?: string
          terminated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_sessions_history_machine_type_id_fkey"
            columns: ["machine_type_id"]
            isOneToOne: false
            referencedRelation: "machine_types"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_types: {
        Row: {
          categories: string[] | null
          created_at: string
          creator: string | null
          description: string
          difficulty: string
          id: string
          image_url: string | null
          max_time_minutes: number
          name: string
          os_type: string
          points: number
          requirements: string[] | null
          skills: string[] | null
          updated_at: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          creator?: string | null
          description: string
          difficulty: string
          id?: string
          image_url?: string | null
          max_time_minutes?: number
          name: string
          os_type: string
          points?: number
          requirements?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          creator?: string | null
          description?: string
          difficulty?: string
          id?: string
          image_url?: string | null
          max_time_minutes?: number
          name?: string
          os_type?: string
          points?: number
          requirements?: string[] | null
          skills?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          completed_challenges: number | null
          created_at: string | null
          id: string
          level: number | null
          points: number | null
          rank: number | null
          role: string | null
          solved_machines: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          completed_challenges?: number | null
          created_at?: string | null
          id: string
          level?: number | null
          points?: number | null
          rank?: number | null
          role?: string | null
          solved_machines?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          completed_challenges?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          points?: number | null
          rank?: number | null
          role?: string | null
          solved_machines?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          created_at: string
          id: string
          points: number
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badge_progress: {
        Row: {
          badge_id: string
          created_at: string
          current_progress: number
          earned: boolean
          earned_at: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string
          current_progress?: number
          earned?: boolean
          earned_at?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string
          current_progress?: number
          earned?: boolean
          earned_at?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          id: string
          last_lesson_id: string | null
          progress_percentage: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          id?: string
          last_lesson_id?: string | null
          progress_percentage?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          id?: string
          last_lesson_id?: string | null
          progress_percentage?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_course_progress_last_lesson_id_fkey"
            columns: ["last_lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hints: {
        Row: {
          hint_level: number
          id: string
          machine_id: string
          points_spent: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          hint_level: number
          id?: string
          machine_id: string
          points_spent: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          hint_level?: number
          id?: string
          machine_id?: string
          points_spent?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_machine_progress: {
        Row: {
          completed_at: string | null
          completed_tasks: number[] | null
          flags: string[] | null
          id: string
          last_activity_at: string
          machine_id: string
          progress: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_tasks?: number[] | null
          flags?: string[] | null
          id?: string
          last_activity_at?: string
          machine_id: string
          progress?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_tasks?: number[] | null
          flags?: string[] | null
          id?: string
          last_activity_at?: string
          machine_id?: string
          progress?: number
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: { row_id: string; value: number }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_points?: number
        }
        Returns: string
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
    Enums: {},
  },
} as const
