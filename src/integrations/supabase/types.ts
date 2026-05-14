export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      certifications: {
        Row: {
          badge_url: string | null;
          category: string | null;
          certificate_url: string | null;
          created_at: string;
          credential_id: string | null;
          description: string | null;
          id: string;
          issuer: string;
          order_index: number;
          title: string;
          updated_at: string;
          verification_url: string | null;
          year: string;
        };
        Insert: {
          badge_url?: string | null;
          category?: string | null;
          certificate_url?: string | null;
          created_at?: string;
          credential_id?: string | null;
          description?: string | null;
          id?: string;
          issuer: string;
          order_index?: number;
          title: string;
          updated_at?: string;
          verification_url?: string | null;
          year: string;
        };
        Update: {
          badge_url?: string | null;
          category?: string | null;
          certificate_url?: string | null;
          created_at?: string;
          credential_id?: string | null;
          description?: string | null;
          id?: string;
          issuer?: string;
          order_index?: number;
          title?: string;
          updated_at?: string;
          verification_url?: string | null;
          year?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          read: boolean;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          read?: boolean;
          subject: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          read?: boolean;
          subject?: string;
        };
        Relationships: [];
      };
      education: {
        Row: {
          activities: string | null;
          created_at: string;
          degree: string | null;
          description: string | null;
          end_date: string | null;
          field_of_study: string | null;
          grade: string | null;
          id: string;
          institution: string;
          logo_url: string | null;
          major: string;
          order_index: number;
          period: string;
          start_date: string | null;
          updated_at: string;
        };
        Insert: {
          activities?: string | null;
          created_at?: string;
          degree?: string | null;
          description?: string | null;
          end_date?: string | null;
          field_of_study?: string | null;
          grade?: string | null;
          id?: string;
          institution: string;
          logo_url?: string | null;
          major: string;
          order_index?: number;
          period: string;
          start_date?: string | null;
          updated_at?: string;
        };
        Update: {
          activities?: string | null;
          created_at?: string;
          degree?: string | null;
          description?: string | null;
          end_date?: string | null;
          field_of_study?: string | null;
          grade?: string | null;
          id?: string;
          institution?: string;
          logo_url?: string | null;
          major?: string;
          order_index?: number;
          period?: string;
          start_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      experiences: {
        Row: {
          category: string | null;
          company: string;
          created_at: string;
          date_range: string;
          description: string | null;
          document_url: string | null;
          duration_months: number | null;
          employment_type: string | null;
          end_date: string | null;
          id: string;
          image_url: string | null;
          is_current: boolean;
          location: string | null;
          location_type: string | null;
          order_index: number;
          skills: string[];
          start_date: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          company: string;
          created_at?: string;
          date_range: string;
          description?: string | null;
          document_url?: string | null;
          duration_months?: number | null;
          employment_type?: string | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          location?: string | null;
          location_type?: string | null;
          order_index?: number;
          skills?: string[];
          start_date?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          company?: string;
          created_at?: string;
          date_range?: string;
          description?: string | null;
          document_url?: string | null;
          duration_months?: number | null;
          employment_type?: string | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          location?: string | null;
          location_type?: string | null;
          order_index?: number;
          skills?: string[];
          start_date?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gallery: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          file_type: string;
          file_url: string;
          id: string;
          title: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          file_type: string;
          file_url: string;
          id?: string;
          title: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          file_type?: string;
          file_url?: string;
          id?: string;
          title?: string;
        };
        Relationships: [];
      };
      profile_public: {
        Row: {
          about: string;
          availability: string;
          branding_name: string;
          cv_url: string | null;
          full_name: string;
          github_url: string | null;
          id: string;
          instagram_url: string | null;
          linkedin_url: string | null;
          location: string;
          profile_image_url: string | null;
          subtitle: string;
          tiktok_url: string | null;
          typing_texts: string[];
          updated_at: string;
        };
        Insert: {
          about: string;
          availability: string;
          branding_name: string;
          cv_url?: string | null;
          full_name: string;
          github_url?: string | null;
          id: string;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location: string;
          profile_image_url?: string | null;
          subtitle: string;
          tiktok_url?: string | null;
          typing_texts?: string[];
          updated_at?: string;
        };
        Update: {
          about?: string;
          availability?: string;
          branding_name?: string;
          cv_url?: string | null;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location?: string;
          profile_image_url?: string | null;
          subtitle?: string;
          tiktok_url?: string | null;
          typing_texts?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_settings: {
        Row: {
          about: string;
          availability: string;
          branding_name: string;
          cv_url: string | null;
          email: string;
          full_name: string;
          github_url: string | null;
          id: string;
          instagram_url: string | null;
          linkedin_url: string | null;
          location: string;
          profile_image_url: string | null;
          subtitle: string;
          tiktok_url: string | null;
          typing_texts: string[];
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          about?: string;
          availability?: string;
          branding_name?: string;
          cv_url?: string | null;
          email?: string;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location?: string;
          profile_image_url?: string | null;
          subtitle?: string;
          tiktok_url?: string | null;
          typing_texts?: string[];
          updated_at?: string;
          whatsapp?: string;
        };
        Update: {
          about?: string;
          availability?: string;
          branding_name?: string;
          cv_url?: string | null;
          email?: string;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location?: string;
          profile_image_url?: string | null;
          subtitle?: string;
          tiktok_url?: string | null;
          typing_texts?: string[];
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          category: string;
          created_at: string;
          demo_url: string | null;
          description: string | null;
          documentation_url: string | null;
          github_url: string | null;
          id: string;
          order_index: number;
          slug: string | null;
          status: string | null;
          tech_stack: string[];
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          year: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          demo_url?: string | null;
          description?: string | null;
          documentation_url?: string | null;
          github_url?: string | null;
          id?: string;
          order_index?: number;
          slug?: string | null;
          status?: string | null;
          tech_stack?: string[];
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          year: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          demo_url?: string | null;
          description?: string | null;
          documentation_url?: string | null;
          github_url?: string | null;
          id?: string;
          order_index?: number;
          slug?: string | null;
          status?: string | null;
          tech_stack?: string[];
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          year?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          level: number | null;
          name: string;
          order_index: number;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          level?: number | null;
          name: string;
          order_index?: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          level?: number | null;
          name?: string;
          order_index?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      volunteers: {
        Row: {
          category: string | null;
          cause: string | null;
          created_at: string;
          description: string | null;
          document_url: string | null;
          duration_months: number | null;
          end_date: string | null;
          id: string;
          image_url: string | null;
          is_current: boolean;
          name: string;
          order_index: number;
          organization: string | null;
          role: string;
          start_date: string | null;
          updated_at: string;
          year: string;
        };
        Insert: {
          category?: string | null;
          cause?: string | null;
          created_at?: string;
          description?: string | null;
          document_url?: string | null;
          duration_months?: number | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          name: string;
          order_index?: number;
          organization?: string | null;
          role: string;
          start_date?: string | null;
          updated_at?: string;
          year: string;
        };
        Update: {
          category?: string | null;
          cause?: string | null;
          created_at?: string;
          description?: string | null;
          document_url?: string | null;
          duration_months?: number | null;
          end_date?: string | null;
          id?: string;
          image_url?: string | null;
          is_current?: boolean;
          name?: string;
          order_index?: number;
          organization?: string | null;
          role?: string;
          start_date?: string | null;
          updated_at?: string;
          year?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_list_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          user_id: string;
          email: string;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
          last_sign_in_at: string | null;
        }[];
      };
      admin_remove_user_role: {
        Args: {
          _user_id: string;
        };
        Returns: undefined;
      };
      admin_set_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
