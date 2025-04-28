
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

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
  const [activeTab, setActiveTab] = useState("overview");
  
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
              <TabsTrigger value="business">Business Goals</TabsTrigger>
              <TabsTrigger value="audience">Target Users</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Project Overview
                  </CardTitle>
                  <CardDescription>A quick summary of the project idea and objective</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.project_overview)}
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Problem Statement
                    </CardTitle>
                    <CardDescription>The problem the product/feature is solving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderContent(analysis?.problem_statement)}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Proposed Solution
                    </CardTitle>
                    <CardDescription>How this product/feature will solve the problem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderContent(analysis?.proposed_solution)}
                  </CardContent>
                </Card>
              </div>

              {analysis?.analysis_confidence_score !== null && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Analysis Confidence Score</p>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                        {analysis?.analysis_confidence_score}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="problem">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Problem Statement
                  </CardTitle>
                  <CardDescription>Clearly state the problem the product/feature is solving</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.problem_statement)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="solution">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2" />
                    Proposed Solution
                  </CardTitle>
                  <CardDescription>Brief about how this product/feature will solve the problem</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.proposed_solution)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Business Goals & Success Metrics
                  </CardTitle>
                  <CardDescription>What business outcomes are expected? (Example: user growth, revenue, efficiency)</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.business_goals)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Target Audience / Users
                  </CardTitle>
                  <CardDescription>Who will use this product? Personas, segments</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.target_audience)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <List className="h-5 w-5 mr-2" />
                    Key Features & Requirements
                  </CardTitle>
                  <CardDescription>List major features or functionalities needed</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderContent(analysis?.key_features)}
                </CardContent>
              </Card>

              {analysis?.user_stories && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      User Stories
                    </CardTitle>
                    <CardDescription>High-level user journeys if applicable</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderContent(analysis?.user_stories)}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </Card>
      
      {analysis && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="competitive">
            <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <span>Competitive Landscape Summary</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2">
              <Card>
                <CardContent className="pt-6">
                  <CardDescription className="mb-2">Quick snapshot from MarketSense AI module: competitors, gaps identified</CardDescription>
                  {renderContent(analysis?.competitive_landscape)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="constraints">
            <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                <span>Constraints & Assumptions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2">
              <Card>
                <CardContent className="pt-6">
                  <CardDescription className="mb-2">Technical, operational, legal constraints; and any assumptions made</CardDescription>
                  {renderContent(analysis?.constraints_assumptions)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          {analysis?.risks_mitigations && (
            <AccordionItem value="risks">
              <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>Risks & Mitigations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2">
                <Card>
                  <CardContent className="pt-6">
                    <CardDescription className="mb-2">What risks exist? How can they be mitigated?</CardDescription>
                    {renderContent(analysis?.risks_mitigations)}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          )}
          
          <AccordionItem value="acceptance">
            <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 mr-2" />
                <span>Acceptance Criteria</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2">
              <Card>
                <CardContent className="pt-6">
                  <CardDescription className="mb-2">High-level conditions for "success" of this requirement</CardDescription>
                  {renderContent(analysis?.acceptance_criteria)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          {analysis?.appendices && analysis.appendices.length > 0 && (
            <AccordionItem value="appendices">
              <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-md">
                <div className="flex items-center">
                  <Paperclip className="h-5 w-5 mr-2" />
                  <span>Appendices</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2">
                <Card>
                  <CardContent className="pt-6">
                    <CardDescription className="mb-2">Links to uploaded docs, chat transcripts, emails, references etc.</CardDescription>
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
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
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
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};

export default RequirementAnalysisView;
