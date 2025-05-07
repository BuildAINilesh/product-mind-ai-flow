
import { ProcessStep } from "@/components/market-sense/MarketAnalysisProgress";

// Define constants for localStorage keys
export const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
export const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
export const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";

export type RequirementData = {
  id: string;
  project_name: string;
  industry_type: string;
  req_id: string;
  company_name: string;
  [key: string]: any;
};

export type RequirementAnalysisData = {
  problem_statement?: string;
  proposed_solution?: string;
  key_features?: string;
  [key: string]: any;
};

export type MarketAnalysisData = {
  id: string;
  requirement_id: string;
  status?: string;
  market_trends?: string;
  target_audience?: string;
  demand_insights?: string;
  top_competitors?: string;
  market_gap_opportunity?: string;
  swot_analysis?: string;
  industry_benchmarks?: string;
  confidence_score?: number;
  research_sources?: string;
  created_at: string;
  [key: string]: any;
};

export type ResearchSource = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  requirement_id: string;
  snippet?: string | null;
  status?: string | null;
};

export type MarketAnalysisState = {
  requirement: RequirementData | null;
  requirementAnalysis: RequirementAnalysisData | null;
  marketAnalysis: MarketAnalysisData | null;
  researchSources: ResearchSource[];
  allMarketAnalyses: any[];
  loading: boolean;
  error: string | null;
  dataFetchAttempted: boolean;
  analysisInProgress: boolean;
  currentStep: number;
  progressSteps: ProcessStep[];
};
