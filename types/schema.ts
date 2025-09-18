export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      charts: {
        Row: {
          diff: Database["public"]["Enums"]["chart_diff"];
          id: number;
          level: number | null;
          notes: number | null;
          play_mode: Database["public"]["Enums"]["play_mode"];
          song_id: number;
        };
        Insert: {
          diff: Database["public"]["Enums"]["chart_diff"];
          id?: number;
          level?: number | null;
          notes?: number | null;
          play_mode: Database["public"]["Enums"]["play_mode"];
          song_id: number;
        };
        Update: {
          diff?: Database["public"]["Enums"]["chart_diff"];
          id?: number;
          level?: number | null;
          notes?: number | null;
          play_mode?: Database["public"]["Enums"]["play_mode"];
          song_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "charts_song_id_fkey";
            columns: ["song_id"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["id"];
          },
        ];
      };
      option_votes: {
        Row: {
          chart_id: number;
          created_at: string;
          id: number;
          option_type: Database["public"]["Enums"]["option_type"];
        };
        Insert: {
          chart_id: number;
          created_at?: string;
          id?: number;
          option_type: Database["public"]["Enums"]["option_type"];
        };
        Update: {
          chart_id?: number;
          created_at?: string;
          id?: number;
          option_type?: Database["public"]["Enums"]["option_type"];
        };
        Relationships: [
          {
            foreignKeyName: "option_votes_chart_id_fkey";
            columns: ["chart_id"];
            isOneToOne: false;
            referencedRelation: "charts";
            referencedColumns: ["id"];
          },
        ];
      };
      songs: {
        Row: {
          bpm_max: number;
          bpm_min: number;
          created_at: string;
          id: number;
          textage_tag: string | null;
          title: string;
        };
        Insert: {
          bpm_max: number;
          bpm_min: number;
          created_at?: string;
          id?: number;
          textage_tag?: string | null;
          title: string;
        };
        Update: {
          bpm_max?: number;
          bpm_min?: number;
          created_at?: string;
          id?: number;
          textage_tag?: string | null;
          title?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      chart_option_vote_summary: {
        Row: {
          chart_id: number | null;
          option_type: Database["public"]["Enums"]["option_type"] | null;
          vote_count: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "option_votes_chart_id_fkey";
            columns: ["chart_id"];
            isOneToOne: false;
            referencedRelation: "charts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      chart_diff: "B" | "N" | "H" | "A" | "L";
      option_type: "REGULAR" | "MIRROR" | "RANDOM" | "R-RANDOM" | "S-RANDOM";
      play_mode: "SP" | "DP";
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      chart_diff: ["B", "N", "H", "A", "L"],
      option_type: ["REGULAR", "MIRROR", "RANDOM", "R-RANDOM", "S-RANDOM"],
      play_mode: ["SP", "DP"],
    },
  },
} as const;
