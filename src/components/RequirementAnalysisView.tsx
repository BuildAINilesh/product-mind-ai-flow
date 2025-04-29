
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  BarChart, 
  Users, 
  List,
  User, 
  Globe, 
  AlertTriangle, 
  CheckSquare, 
  Paperclip,
  Lock 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RequirementAnalysis {
  id: string;
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
  if (loading) {
    return <AnalysisViewSkeleton />;
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The requested project could not be loaded.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If there's no analysis data, show appropriate message
  const noAnalysisData = !analysis && project.status !== "Completed";
  
  // Function to render content with fallback for empty sections
  const renderContent = (content: string | null, fallback: string = "Not available yet") => {
    if (!content) return <p className="text-muted-foreground">{fallback}</p>;
    return <div className="whitespace-pre-line">{content}</div>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{project.project_name}</CardTitle>
          <CardDescription>
            {project.status === "Completed" ? (
              "AI-processed requirement document"
            ) : (
              "Requirement is currently pending analysis"
            )}
          </CardDescription>
        </CardHeader>
        
        {noAnalysisData ? (
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">Requirement Analysis Pending</h3>
              <p className="text-muted-foreground">
                This requirement needs to be analyzed first. Use the "Analyze" button to start the process.
              </p>
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-12">
            {/* Project Overview Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Project Overview</h2>
              </div>
              <p className="text-muted-foreground">A quick summary of the project idea and objective</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.project_overview)}
              </div>
            </section>

            {/* Problem Statement Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Problem Statement</h2>
              </div>
              <p className="text-muted-foreground">The problem the product/feature is solving</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.problem_statement)}
              </div>
            </section>

            {/* Proposed Solution Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Proposed Solution</h2>
              </div>
              <p className="text-muted-foreground">How this product/feature will solve the problem</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.proposed_solution)}
              </div>
            </section>

            {/* Business Goals Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Business Goals & Success Metrics</h2>
              </div>
              <p className="text-muted-foreground">What business outcomes are expected? (Example: user growth, revenue, efficiency)</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.business_goals)}
              </div>
            </section>

            {/* Target Audience Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Target Audience / Users</h2>
              </div>
              <p className="text-muted-foreground">Who will use this product? Personas, segments</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.target_audience)}
              </div>
            </section>

            {/* Key Features Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <List className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Key Features & Requirements</h2>
              </div>
              <p className="text-muted-foreground">List major features or functionalities needed</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.key_features)}
              </div>
            </section>

            {/* User Stories Section */}
            {analysis?.user_stories && (
              <section className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">User Stories</h2>
                </div>
                <p className="text-muted-foreground">High-level user journeys if applicable</p>
                <div className="bg-muted/30 p-4 rounded-md">
                  {renderContent(analysis?.user_stories)}
                </div>
              </section>
            )}

            {/* Competitive Landscape Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Competitive Landscape Summary</h2>
              </div>
              <p className="text-muted-foreground">Quick snapshot from MarketSense AI module: competitors, gaps identified</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.competitive_landscape)}
              </div>
            </section>

            {/* Constraints & Assumptions Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Constraints & Assumptions</h2>
              </div>
              <p className="text-muted-foreground">Technical, operational, legal constraints; and any assumptions made</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.constraints_assumptions)}
              </div>
            </section>

            {/* Risks & Mitigations Section */}
            {analysis?.risks_mitigations && (
              <section className="space-y-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">Risks & Mitigations</h2>
                </div>
                <p className="text-muted-foreground">What risks exist? How can they be mitigated?</p>
                <div className="bg-muted/30 p-4 rounded-md">
                  {renderContent(analysis?.risks_mitigations)}
                </div>
              </section>
            )}

            {/* Acceptance Criteria Section */}
            <section className="space-y-4">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                <h2 className="text-xl font-semibold">Acceptance Criteria</h2>
              </div>
              <p className="text-muted-foreground">High-level conditions for "success" of this requirement</p>
              <div className="bg-muted/30 p-4 rounded-md">
                {renderContent(analysis?.acceptance_criteria)}
              </div>
            </section>

            {/* Appendices Section */}
            {analysis?.appendices && analysis.appendices.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center">
                  <Paperclip className="h-5 w-5 mr-2" />
                  <h2 className="text-xl font-semibold">Appendices</h2>
                </div>
                <p className="text-muted-foreground">Links to uploaded docs, chat transcripts, emails, references etc.</p>
                <div className="bg-muted/30 p-4 rounded-md">
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.appendices.map((item, index) => (
                      <li key={index}>
                        <a 
                          href={item} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {item.split('/').pop()}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Analysis Confidence Score */}
            {analysis?.analysis_confidence_score !== null && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Analysis Confidence Score</h2>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {analysis?.analysis_confidence_score}%
                  </div>
                </div>
              </section>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

const AnalysisViewSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementAnalysisView;
