import {
  RequirementAnalysisData,
  MarketAnalysisData,
} from "@/hooks/useMarketAnalysis";

export interface ValidationData {
  id: string;
  requirement_id: string;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  readiness_score: number | null;
  validation_verdict: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

// Alias for backward compatibility
export type ValidationItem = ValidationData;

export interface ValidationHookState {
  validations: ValidationData[];
  loading: boolean;
  requirement: any;
  requirementAnalysis: RequirementAnalysisData | null;
  validationData: ValidationData | null;
  isRequirementLoading: boolean;
  isValidating: boolean;
  dataFetchAttempted: boolean;
  error: string | null;
}
