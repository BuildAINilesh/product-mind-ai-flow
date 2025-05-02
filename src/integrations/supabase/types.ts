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
      firecrawl_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          requirement_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          requirement_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          requirement_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "firecrawl_queries_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      market_analysis: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          demand_insights: string | null
          id: string
          industry_benchmarks: string | null
          market_gap_opportunity: string | null
          market_trends: string | null
          requirement_id: string | null
          status: Database["public"]["Enums"]["requirement_status_enum"] | null
          swot_analysis: string | null
          top_competitors: string | null
          updated_at: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          demand_insights?: string | null
          id?: string
          industry_benchmarks?: string | null
          market_gap_opportunity?: string | null
          market_trends?: string | null
          requirement_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status_enum"] | null
          swot_analysis?: string | null
          top_competitors?: string | null
          updated_at?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          demand_insights?: string | null
          id?: string
          industry_benchmarks?: string | null
          market_gap_opportunity?: string | null
          market_trends?: string | null
          requirement_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status_enum"] | null
          swot_analysis?: string | null
          top_competitors?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_analysis_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: true
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      market_research_sources: {
        Row: {
          created_at: string
          id: string
          query_id: string
          requirement_id: string
          snippet: string | null
          status:
            | Database["public"]["Enums"]["market_research_source_status"]
            | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          query_id: string
          requirement_id: string
          snippet?: string | null
          status?:
            | Database["public"]["Enums"]["market_research_source_status"]
            | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          query_id?: string
          requirement_id?: string
          snippet?: string | null
          status?:
            | Database["public"]["Enums"]["market_research_source_status"]
            | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_research_sources_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "firecrawl_queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_research_sources_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      requirement_analysis: {
        Row: {
          acceptance_criteria: string | null
          analysis_confidence_score: number | null
          appendices: string[] | null
          business_goals: string | null
          competitive_landscape: string | null
          constraints_assumptions: string | null
          created_at: string
          id: string
          key_features: string | null
          problem_statement: string | null
          project_overview: string | null
          proposed_solution: string | null
          requirement_id: string
          risks_mitigations: string | null
          target_audience: string | null
          updated_at: string
          user_stories: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          analysis_confidence_score?: number | null
          appendices?: string[] | null
          business_goals?: string | null
          competitive_landscape?: string | null
          constraints_assumptions?: string | null
          created_at?: string
          id?: string
          key_features?: string | null
          problem_statement?: string | null
          project_overview?: string | null
          proposed_solution?: string | null
          requirement_id: string
          risks_mitigations?: string | null
          target_audience?: string | null
          updated_at?: string
          user_stories?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          analysis_confidence_score?: number | null
          appendices?: string[] | null
          business_goals?: string | null
          competitive_landscape?: string | null
          constraints_assumptions?: string | null
          created_at?: string
          id?: string
          key_features?: string | null
          problem_statement?: string | null
          project_overview?: string | null
          proposed_solution?: string | null
          requirement_id?: string
          risks_mitigations?: string | null
          target_audience?: string | null
          updated_at?: string
          user_stories?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_analysis_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: true
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          company_name: string | null
          created_at: string | null
          document_summary: string | null
          file_urls: string[] | null
          id: string
          industry_type: Database["public"]["Enums"]["industry_enum"]
          input_methods_used: string[] | null
          project_idea: string | null
          project_name: string
          req_id: string | null
          status: Database["public"]["Enums"]["requirement_status_enum"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          document_summary?: string | null
          file_urls?: string[] | null
          id?: string
          industry_type: Database["public"]["Enums"]["industry_enum"]
          input_methods_used?: string[] | null
          project_idea?: string | null
          project_name: string
          req_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          document_summary?: string | null
          file_urls?: string[] | null
          id?: string
          industry_type?: Database["public"]["Enums"]["industry_enum"]
          input_methods_used?: string[] | null
          project_idea?: string | null
          project_name?: string
          req_id?: string | null
          status?: Database["public"]["Enums"]["requirement_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scraped_research_data: {
        Row: {
          created_at: string
          id: string
          raw_content: string
          requirement_id: string
          source_id: string
          status: Database["public"]["Enums"]["scraped_data_status"] | null
          summary: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          raw_content: string
          requirement_id: string
          source_id: string
          status?: Database["public"]["Enums"]["scraped_data_status"] | null
          summary?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          raw_content?: string
          requirement_id?: string
          source_id?: string
          status?: Database["public"]["Enums"]["scraped_data_status"] | null
          summary?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scraped_research_data_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scraped_research_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "market_research_sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      firecrawl_query_status: "pending" | "searched" | "error"
      industry_enum:
        | "technology"
        | "healthcare"
        | "finance"
        | "education"
        | "retail"
        | "manufacturing"
        | "logistics"
        | "entertainment"
        | "energy"
        | "automotive"
        | "HR"
        | "other"
      market_research_source_status: "pending_scrape" | "scraped" | "error"
      requirement_status_enum: "Draft" | "Completed" | "Re_Draft"
      scraped_data_status: "pending_summary" | "summarized" | "error"
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
      firecrawl_query_status: ["pending", "searched", "error"],
      industry_enum: [
        "technology",
        "healthcare",
        "finance",
        "education",
        "retail",
        "manufacturing",
        "logistics",
        "entertainment",
        "energy",
        "automotive",
        "HR",
        "other",
      ],
      market_research_source_status: ["pending_scrape", "scraped", "error"],
      requirement_status_enum: ["Draft", "Completed", "Re_Draft"],
      scraped_data_status: ["pending_summary", "summarized", "error"],
    },
  },
} as const
