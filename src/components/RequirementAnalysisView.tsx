import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  FileText,
  CheckSquare,
  Users,
  BarChart3,
  AlertTriangle,
  BrainCircuit,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// Define interface for the project data
interface Project {
  id: string;
  project_name: string;
  company_name?: string;
  industry_type?: string;
  status: string;
  req_id: string;
}

// Define interface for the analysis data
interface Analysis {
  project_overview?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  business_goals?: string | null;
  target_audience?: string | null;
  key_features?: string | null;
  competitive_landscape?: string | null;
  constraints_assumptions?: string | null;
  risks_mitigations?: string | null;
  acceptance_criteria?: string | null;
  user_stories?: string | null;
  analysis_confidence_score?: number;
}

// Define prop types for the component
type RequirementAnalysisViewProps = {
  project: Project;
  analysis: Analysis | null;
  loading: boolean;
  onRefresh: () => void;
};

const RequirementAnalysisView = ({
  project,
  analysis,
  loading,
  onRefresh,
}: RequirementAnalysisViewProps) => {
  // Helper function to check if a section has content
  const hasContent = (section: string | null | undefined) => {
    return section && section.trim().length > 0;
  };

  // Function to render a section with a title and content
  const renderSection = (
    title: string,
    content: string | null | undefined,
    icon: React.ReactNode
  ) => {
    if (!hasContent(content)) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-primary/10">{icon}</div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="text-muted-foreground whitespace-pre-line pl-9">
          {content}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Requirement Not Found</CardTitle>
          <CardDescription>
            This requirement doesn't exist or you don't have access to it.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{project.project_name}</CardTitle>
              <Badge
                variant={project.status === "Completed" ? "default" : "outline"}
              >
                {project.status === "Completed" ? "Completed" : "Draft"}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {project.company_name && `${project.company_name} • `}
              {project.industry_type} • ID: {project.req_id}
            </CardDescription>
          </div>

          {project.status === "Completed" && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            ></motion.div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {project.status === "Draft" || project.status === "Re_Draft" ? (
          <div className="py-12 text-center">
            <div className="inline-flex p-4 rounded-full bg-blue-50 dark:bg-blue-950 mb-4">
              <BrainCircuit className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              This requirement hasn't been analyzed yet. Click the "Analyze"
              button to generate the AI-powered analysis.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
              onClick={onRefresh}
            >
              <BrainCircuit className="h-5 w-5 mr-2" />
              Start Analysis
            </Button>
          </div>
        ) : analysis ? (
          <div className="space-y-8">
            {/* Overview Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold pb-2 border-b flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Project Overview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSection(
                  "Project Summary",
                  analysis.project_overview,
                  <FileText className="h-4 w-4 text-blue-600" />
                )}
                {renderSection(
                  "Problem Statement",
                  analysis.problem_statement,
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                {renderSection(
                  "Proposed Solution",
                  analysis.proposed_solution,
                  <CheckSquare className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>

            {/* Requirements Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold pb-2 border-b flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Requirements
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSection(
                  "Key Features",
                  analysis.key_features,
                  <FileText className="h-4 w-4 text-blue-600" />
                )}
                {renderSection(
                  "Business Goals",
                  analysis.business_goals,
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                )}
                {renderSection(
                  "Target Audience",
                  analysis.target_audience,
                  <Users className="h-4 w-4 text-indigo-600" />
                )}
                {renderSection(
                  "Acceptance Criteria",
                  analysis.acceptance_criteria,
                  <CheckSquare className="h-4 w-4 text-green-600" />
                )}
                {renderSection(
                  "User Stories",
                  analysis.user_stories,
                  <Users className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>

            {/* Market Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold pb-2 border-b flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Market Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSection(
                  "Competitive Landscape",
                  analysis.competitive_landscape,
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                )}
                {renderSection(
                  "Constraints & Assumptions",
                  analysis.constraints_assumptions,
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
              </div>
            </div>

            {/* Development Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold pb-2 border-b flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                Development Considerations
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSection(
                  "Risks & Mitigations",
                  analysis.risks_mitigations,
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            {/* Confidence Score */}
            {analysis.analysis_confidence_score && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-5 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">AI Confidence Score</span>
                  </div>
                  <span className="bg-primary text-white px-3 py-1 rounded-full font-medium">
                    {analysis.analysis_confidence_score}%
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="py-8">
            <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="p-4 rounded-full bg-amber-50 dark:bg-amber-950 mb-4">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Analysis Needs to Be Generated
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-2">
                  Since you've made changes to your requirement, you need to run
                  the analysis again to see the updated overview.
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Go back to the requirement page and click the "Analyze" button
                  to generate fresh insights based on your updated content.
                </p>
              </div>

              <div className="border-t pt-5 mt-4">
                <div className="flex items-center px-4 py-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-blue-700 dark:text-blue-300 text-sm">
                  <BrainCircuit className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>
                    The AI will analyze your updated requirement and generate a
                    comprehensive overview with features, goals, target
                    audience, and other key insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequirementAnalysisView;
