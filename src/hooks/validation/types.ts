
import { RequirementAnalysisData, MarketAnalysisData } from "@/hooks/useMarketAnalysis";

export interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  validation_verdict: string | null;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

export interface ValidationHookState {
  validations: ValidationItem[];
  loading: boolean;
  requirement: any;
  requirementAnalysis: RequirementAnalysisData | null;
  validationData: ValidationItem | null;
  isRequirementLoading: boolean;
  isValidating: boolean;
  dataFetchAttempted: boolean;
  error: string | null;
}
