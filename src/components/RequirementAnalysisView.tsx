
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader, RefreshCcw } from "lucide-react";

// Define prop types for the component
type RequirementAnalysisViewProps = {
  project: any;
  analysis: any;
  loading: boolean;
  onRefresh: () => void;
};

const RequirementAnalysisView = ({ project, analysis, loading, onRefresh }: RequirementAnalysisViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Helper function to check if a section has content
  const hasContent = (section: string | null | undefined) => {
    return section && section.trim().length > 0;
  };

  // Function to render a section with a title and content
  const renderSection = (title: string, content: string | null | undefined) => {
    if (!hasContent(content)) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className="text-muted-foreground whitespace-pre-line">{content}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Requirement Not Found</CardTitle>
          <CardDescription>This requirement doesn't exist or you don't have access to it.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl">{project.project_name}</CardTitle>
          <CardDescription className="mt-1">
            {project.company_name && `${project.company_name} • `}
            {project.industry_type} • ID: {project.req_id}
          </CardDescription>
        </div>
        
        {project.status === "Completed" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {project.status === "Draft" || project.status === "Re_Draft" ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">
              This requirement hasn't been analyzed yet. 
              Click the "Analyze" button to generate the analysis.
            </p>
          </div>
        ) : analysis ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="development">Development</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {renderSection("Project Overview", analysis.project_overview)}
              {renderSection("Problem Statement", analysis.problem_statement)}
              {renderSection("Proposed Solution", analysis.proposed_solution)}
              
              {analysis.analysis_confidence_score && (
                <div className="mt-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Confidence Score</span>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                      {analysis.analysis_confidence_score}%
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-4">
              {renderSection("Key Features", analysis.key_features)}
              {renderSection("Business Goals", analysis.business_goals)}
              {renderSection("Target Audience", analysis.target_audience)}
              {renderSection("Acceptance Criteria", analysis.acceptance_criteria)}
              {renderSection("User Stories", analysis.user_stories)}
            </TabsContent>
            
            {/* Market Tab */}
            <TabsContent value="market" className="space-y-4">
              {renderSection("Competitive Landscape", analysis.competitive_landscape)}
              {renderSection("Constraints & Assumptions", analysis.constraints_assumptions)}
            </TabsContent>
            
            {/* Development Tab */}
            <TabsContent value="development" className="space-y-4">
              {renderSection("Risks & Mitigations", analysis.risks_mitigations)}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Analysis data could not be loaded. Please try refreshing.
            </p>
            {onRefresh && (
              <Button 
                variant="outline" 
                onClick={onRefresh} 
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Analysis
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequirementAnalysisView;
