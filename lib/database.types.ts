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
      achievements: {
        Row: {
          created_at: string
          date: string | null
          description_md: string
          id: string
          published: boolean
          sort_order: number
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description_md?: string
          id?: string
          published?: boolean
          sort_order?: number
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description_md?: string
          id?: string
          published?: boolean
          sort_order?: number
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          id: string
          issue_date: string | null
          issuer: string
          name: string
          published: boolean
          sort_order: number
          verified: boolean
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer: string
          name: string
          published?: boolean
          sort_order?: number
          verified?: boolean
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string
          name?: string
          published?: boolean
          sort_order?: number
          verified?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_hash: string | null
          message: string
          name: string
          status: string
          subject: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_hash?: string | null
          message: string
          name: string
          status?: string
          subject?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_hash?: string | null
          message?: string
          name?: string
          status?: string
          subject?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          degree: string
          end_date: string | null
          field: string
          grade: string
          highlights: string[]
          id: string
          institution: string
          published: boolean
          sort_order: number
          start_date: string
        }
        Insert: {
          created_at?: string
          degree: string
          end_date?: string | null
          field?: string
          grade?: string
          highlights?: string[]
          id?: string
          institution: string
          published?: boolean
          sort_order?: number
          start_date: string
        }
        Update: {
          created_at?: string
          degree?: string
          end_date?: string | null
          field?: string
          grade?: string
          highlights?: string[]
          id?: string
          institution?: string
          published?: boolean
          sort_order?: number
          start_date?: string
        }
        Relationships: []
      }
      experience: {
        Row: {
          created_at: string
          employment_type: string
          end_date: string | null
          highlights: string[]
          id: string
          location: string
          org_url: string | null
          organization: string
          published: boolean
          role: string
          sort_order: number
          start_date: string
          summary_md: string
          tech: string[]
        }
        Insert: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          highlights?: string[]
          id?: string
          location?: string
          org_url?: string | null
          organization: string
          published?: boolean
          role: string
          sort_order?: number
          start_date: string
          summary_md?: string
          tech?: string[]
        }
        Update: {
          created_at?: string
          employment_type?: string
          end_date?: string | null
          highlights?: string[]
          id?: string
          location?: string
          org_url?: string | null
          organization?: string
          published?: boolean
          role?: string
          sort_order?: number
          start_date?: string
          summary_md?: string
          tech?: string[]
        }
        Relationships: []
      }
      profile: {
        Row: {
          avatar_path: string | null
          bio_md: string
          email: string
          full_name: string
          headline: string
          id: string
          location: string
          phone: string
          resume_active_id: string | null
          tagline: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio_md?: string
          email?: string
          full_name: string
          headline?: string
          id?: string
          location?: string
          phone?: string
          resume_active_id?: string | null
          tagline?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio_md?: string
          email?: string
          full_name?: string
          headline?: string
          id?: string
          location?: string
          phone?: string
          resume_active_id?: string | null
          tagline?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_resume_active_fk"
            columns: ["resume_active_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      project_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      project_screenshots: {
        Row: {
          alt: string
          id: string
          project_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt?: string
          id?: string
          project_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt?: string
          id?: string
          project_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_screenshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          architecture_md: string
          category_id: string | null
          challenges_md: string
          cover_image_path: string | null
          created_at: string
          description_md: string
          featured: boolean
          finished_on: string | null
          id: string
          learnings_md: string
          live_url: string | null
          published: boolean
          recruiter_highlight: string | null
          repo_url: string | null
          slug: string
          sort_order: number
          started_on: string | null
          status: string
          summary: string
          tech_stack: string[]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          architecture_md?: string
          category_id?: string | null
          challenges_md?: string
          cover_image_path?: string | null
          created_at?: string
          description_md?: string
          featured?: boolean
          finished_on?: string | null
          id?: string
          learnings_md?: string
          live_url?: string | null
          published?: boolean
          recruiter_highlight?: string | null
          repo_url?: string | null
          slug: string
          sort_order?: number
          started_on?: string | null
          status?: string
          summary?: string
          tech_stack?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          architecture_md?: string
          category_id?: string | null
          challenges_md?: string
          cover_image_path?: string | null
          created_at?: string
          description_md?: string
          featured?: boolean
          finished_on?: string | null
          id?: string
          learnings_md?: string
          live_url?: string | null
          published?: boolean
          recruiter_highlight?: string | null
          repo_url?: string | null
          slug?: string
          sort_order?: number
          started_on?: string | null
          status?: string
          summary?: string
          tech_stack?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          notes: string
          parent_id: string | null
          parse_error: string | null
          parse_status: string
          parsed: Json | null
          role_id: string | null
          storage_path: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string
          parent_id?: string | null
          parse_error?: string | null
          parse_status?: string
          parsed?: Json | null
          role_id?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string
          parent_id?: string | null
          parse_error?: string | null
          parse_status?: string
          parsed?: Json | null
          role_id?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resumes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resumes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_content_overrides: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          override: Json
          role_id: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          override?: Json
          role_id: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          override?: Json
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_content_overrides_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          hero_headline: string
          hero_tagline: string
          id: string
          is_active: boolean
          is_default: boolean
          keyword_boosts: Json
          name: string
          published: boolean
          skill_weights: Json
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          hero_headline?: string
          hero_tagline?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          keyword_boosts?: Json
          name: string
          published?: boolean
          skill_weights?: Json
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          hero_headline?: string
          hero_tagline?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          keyword_boosts?: Json
          name?: string
          published?: boolean
          skill_weights?: Json
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      sections: {
        Row: {
          body_md: string
          id: string
          meta: Json
          published: boolean
          slug: string
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          id?: string
          meta?: Json
          published?: boolean
          slug: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          id?: string
          meta?: Json
          published?: boolean
          slug?: string
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      skill_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      skills: {
        Row: {
          category_id: string | null
          created_at: string
          featured: boolean
          icon: string
          id: string
          level: number
          name: string
          published: boolean
          sort_order: number
          years: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          featured?: boolean
          icon?: string
          id?: string
          level?: number
          name: string
          published?: boolean
          sort_order?: number
          years?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          featured?: boolean
          icon?: string
          id?: string
          level?: number
          name?: string
          published?: boolean
          sort_order?: number
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "skill_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_links: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          platform: string
          published: boolean
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          platform: string
          published?: boolean
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          platform?: string
          published?: boolean
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      sync_suggestions: {
        Row: {
          action: string
          confidence: number | null
          created_at: string
          current_value: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          rationale: string
          resolved_at: string | null
          resolved_by: string | null
          resume_id: string
          status: string
          suggested_value: Json
        }
        Insert: {
          action: string
          confidence?: number | null
          created_at?: string
          current_value?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          rationale?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resume_id: string
          status?: string
          suggested_value: Json
        }
        Update: {
          action?: string
          confidence?: number | null
          created_at?: string
          current_value?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          rationale?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resume_id?: string
          status?: string
          suggested_value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sync_suggestions_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      submit_contact_message: {
        Args: {
          p_name: string
          p_email: string
          p_subject: string
          p_message: string
          p_ip_hash: string
          p_user_agent: string
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
