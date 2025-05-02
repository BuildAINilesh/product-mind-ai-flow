
import { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AnalysisHeader,
  AnalysisViewSkeleton,
  NotFoundCard,
  DocumentInformationCard,
  BusinessCaseCard,
  FunctionalRequirementsCard,
  ImplementationConsiderationsCard,
  AppendicesCard,
  DocumentMetadataCard,
  PendingAnalysisCard
} from './requirement-analysis';
import { AlertCircle } from "lucide-react"; // Import AlertCircle from lucide-react instead

interface RequirementAnalysis {
  id?: string;
  requirement_id: string;
  project_overview: string | null;
  problem_statement: string | null;
  proposed_solution: string | null;
  business_goals: string | null;
  target_audience: string | null;
  key_features: string | null;
  user_stories: string | null;
  competitive_landscape: string | null;
  constraints_assumptions: string | null;
  risks_mitigations: string | null;
  acceptance_criteria: string | null;
  appendices: string[] | null;
  analysis_confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  project_name: string;
  company_name: string | null;
  industry_type: string;
  project_idea: string | null;
  username: string | null;
  status: "Draft" | "Completed" | "Re_Draft";
  created_at: string;
  requirement_id?: string | null;
}

interface RequirementAnalysisViewProps {
  project: Project | null;
  analysis: RequirementAnalysis | null;
  loading?: boolean;
}

export const RequirementAnalysisView = ({ 
  project, 
  analysis, 
  loading = false 
}: RequirementAnalysisViewProps) => {
  console.log("RequirementAnalysisView rendered with:", { 
    project, 
    analysis, 
    loading,
    projectStatus: project?.status,
    hasAnalysisData: analysis !== null
  });

  // Debug what fields are available
  if (analysis) {
    console.log("Available analysis fields:", Object.keys(analysis).filter(key => analysis[key] !== null));
  }

  if (loading) {
    return <AnalysisViewSkeleton />;
  }

  if (!project) {
    return <NotFoundCard />;
  }

  // If there's no analysis data, show appropriate message
  const noAnalysisData = !analysis && project.status !== "Completed";
  
  // Determine if we're showing project with limited analysis data
  const hasLimitedAnalysisData = project.status === "Completed" && 
                             analysis && 
                             !analysis.problem_statement && 
                             !analysis.proposed_solution &&
                             !analysis.business_goals &&
                             !analysis.target_audience;

  if (noAnalysisData) {
    return (
      <div className="space-y-6 mb-12">
        <AnalysisHeader 
          project={project} 
          analysisConfidenceScore={null}
          hasLimitedAnalysisData={false}
        />
        <PendingAnalysisCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      <AnalysisHeader 
        project={project} 
        analysisConfidenceScore={analysis?.analysis_confidence_score}
        hasLimitedAnalysisData={hasLimitedAnalysisData}
      />

      <div className="space-y-8">
        <DocumentInformationCard 
          projectOverview={analysis?.project_overview}
          problemStatement={analysis?.problem_statement}
          proposedSolution={analysis?.proposed_solution}
        />

        <BusinessCaseCard 
          businessGoals={analysis?.business_goals}
          targetAudience={analysis?.target_audience}
          competitiveLandscape={analysis?.competitive_landscape}
        />

        <FunctionalRequirementsCard 
          keyFeatures={analysis?.key_features}
          userStories={analysis?.user_stories}
        />

        <ImplementationConsiderationsCard 
          constraintsAssumptions={analysis?.constraints_assumptions}
          risksMitigations={analysis?.risks_mitigations}
          acceptanceCriteria={analysis?.acceptance_criteria}
        />

        <AppendicesCard appendices={analysis?.appendices} />

        <DocumentMetadataCard 
          updatedAt={analysis?.updated_at}
          requirementId={analysis?.requirement_id}
        />
      </div>
    </div>
  );
};

export default RequirementAnalysisView;
