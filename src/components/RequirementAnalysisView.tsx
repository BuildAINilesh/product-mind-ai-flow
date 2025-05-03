import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
  Lock,
  CalendarClock,
  Shield
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  // Modified to only show fallback when content is null or undefined, not for empty strings
  const renderContent = (content: string | null, fallback: string = "Not available yet") => {
    if (content === null || content === undefined) {
      return <p className="text-muted-foreground">{fallback}</p>;
    }
    return <div className="whitespace-pre-line">{content}</div>;
  };
  
  // Function to render section headers with consistent styling
  const renderSectionHeader = (icon: React.ReactNode, title: string, description?: string) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground ml-7">{description}</p>}
    </div>
  );

  return (
    <div className="space-y-6 mb-12">
      <Card className="border-b-4 border-b-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-baseline">
            <div>
              <CardDescription>Business Requirements Document</CardDescription>
              <CardTitle className="text-2xl">{project.project_name}</CardTitle>
            </div>
            <Badge variant={project.status === "Completed" ? "default" : "outline"}>
              {project.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <p>{project.industry_type}</p>
            </div>
            {project.company_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p>{project.company_name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p>{new Date(project.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {analysis?.analysis_confidence_score !== null && (
            <div className="flex items-center mb-6 p-3 bg-muted/30 rounded-md">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium mr-1">Analysis Confidence Score:</span>
              <Badge variant="outline" className="ml-auto px-3 py-1 font-medium">
                {analysis?.analysis_confidence_score}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {noAnalysisData ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground/60 mb-4" />
              <h3 className="text-lg font-medium mb-2">Requirement Analysis Pending</h3>
              <p className="text-muted-foreground">
                This requirement needs to be analyzed first. Use the "Analyze" button to start the process.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Document Information */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Document Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Project Overview Section */}
                <section>
                  {renderSectionHeader(
                    <BookOpen className="h-5 w-5 text-primary" />,
                    "Project Overview",
                    "A quick summary of the project idea and objective"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.project_overview)}
                  </div>
                </section>

                {/* Problem Statement Section */}
                <section>
                  {renderSectionHeader(
                    <Target className="h-5 w-5 text-primary" />,
                    "Problem Statement",
                    "The problem the product/feature is solving"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.problem_statement)}
                  </div>
                </section>

                {/* Proposed Solution Section */}
                <section>
                  {renderSectionHeader(
                    <Lightbulb className="h-5 w-5 text-primary" />,
                    "Proposed Solution",
                    "How this product/feature will solve the problem"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.proposed_solution)}
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Business Case */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Business Case</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Business Goals Section */}
                <section>
                  {renderSectionHeader(
                    <BarChart className="h-5 w-5 text-primary" />,
                    "Business Goals & Success Metrics",
                    "What business outcomes are expected? (Example: user growth, revenue, efficiency)"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.business_goals)}
                  </div>
                </section>

                {/* Target Audience Section */}
                <section>
                  {renderSectionHeader(
                    <Users className="h-5 w-5 text-primary" />,
                    "Target Audience / Users",
                    "Who will use this product? Personas, segments"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.target_audience)}
                  </div>
                </section>

                {/* Competitive Landscape Section */}
                <section>
                  {renderSectionHeader(
                    <Globe className="h-5 w-5 text-primary" />,
                    "Competitive Landscape Summary",
                    "Quick snapshot from MarketSense AI module: competitors, gaps identified"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.competitive_landscape)}
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Functional Requirements */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Functional Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Features Section */}
                <section>
                  {renderSectionHeader(
                    <List className="h-5 w-5 text-primary" />,
                    "Key Features & Requirements",
                    "List major features or functionalities needed"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.key_features)}
                  </div>
                </section>

                {/* User Stories Section */}
                {analysis?.user_stories && (
                  <section>
                    {renderSectionHeader(
                      <User className="h-5 w-5 text-primary" />,
                      "User Stories",
                      "High-level user journeys if applicable"
                    )}
                    <div className="bg-muted/30 p-4 rounded-md">
                      {renderContent(analysis?.user_stories)}
                    </div>
                  </section>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Implementation Considerations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Implementation Considerations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Constraints & Assumptions Section */}
                <section>
                  {renderSectionHeader(
                    <Lock className="h-5 w-5 text-primary" />,
                    "Constraints & Assumptions",
                    "Technical, operational, legal constraints; and any assumptions made"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.constraints_assumptions)}
                  </div>
                </section>

                {/* Risks & Mitigations Section */}
                {analysis?.risks_mitigations && (
                  <section>
                    {renderSectionHeader(
                      <AlertTriangle className="h-5 w-5 text-primary" />,
                      "Risks & Mitigations",
                      "What risks exist? How can they be mitigated?"
                    )}
                    <div className="bg-muted/30 p-4 rounded-md">
                      {renderContent(analysis?.risks_mitigations)}
                    </div>
                  </section>
                )}

                {/* Acceptance Criteria Section */}
                <section>
                  {renderSectionHeader(
                    <CheckSquare className="h-5 w-5 text-primary" />,
                    "Acceptance Criteria",
                    "High-level conditions for 'success' of this requirement"
                  )}
                  <div className="bg-muted/30 p-4 rounded-md">
                    {renderContent(analysis?.acceptance_criteria)}
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Appendices Section */}
          {analysis?.appendices && analysis.appendices.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Appendices</CardTitle>
              </CardHeader>
              <CardContent>
                <section>
                  {renderSectionHeader(
                    <Paperclip className="h-5 w-5 text-primary" />,
                    "Referenced Documents",
                    "Links to uploaded docs, chat transcripts, emails, references etc."
                  )}
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
              </CardContent>
            </Card>
          )}

          {/* Document Metadata */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-1" />
                  Last updated: {analysis?.updated_at && new Date(analysis.updated_at).toLocaleString()}
                </div>
                <div>
                  Document ID: <span className="font-mono">{analysis?.requirement_id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
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
