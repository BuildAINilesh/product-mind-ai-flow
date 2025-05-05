import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  Sparkles, 
  Layers, 
  Search,
  Building,
  Briefcase,
  User,
  BarChart3,
  LineChart,
  CheckCircle2,
  AlertTriangle,
  Network,
  Activity,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StructuredDocument {
  problem: string;
  solution: string;
  whyThis?: string; // Might be why_this depending on AI response format
  why_this?: string;
  researchFromClient?: string; // Might be research_from_client depending on AI response format
  research_from_client?: string;
  featuresAndDetails?: string; // Might be features_and_details depending on AI response format
  features_and_details?: string;
  aiSuggestion?: string; // Might be ai_suggestion depending on AI response format
  ai_suggestion?: string;
  [key: string]: any; // To accommodate any other fields
}

interface MarketAnalysis {
  market_trends?: string;
  demand_insights?: string;
  top_competitors?: string;
  market_gap_opportunity?: string;
  swot_analysis?: string;
  industry_benchmarks?: string;
  confidence_score?: number;
  target_audience?: string;
  strategic_recommendations?: string;
  research_sources?: string;
  status?: string;
}

interface ProjectData {
  id: string;
  project_name: string;
  company_name: string;
  industry_type: string;
  username: string;
  project_idea: string | null;
  structured_document: StructuredDocument | null;
  market_analysis?: MarketAnalysis | null;
  [key: string]: any; // For any other fields
}

interface ProjectStructuredViewProps {
  project: ProjectData | null;
  loading?: boolean;
}

export const ProjectStructuredView = ({ project, loading = false }: ProjectStructuredViewProps) => {
  const [structuredDoc, setStructuredDoc] = useState<StructuredDocument | null>(null);

  useEffect(() => {
    if (project?.structured_document) {
      setStructuredDoc(project.structured_document);
    }
  }, [project]);

  const getDocValue = (key: string) => {
    if (!structuredDoc) return "";
    
    return structuredDoc[key] || 
           structuredDoc[key.replace(/([A-Z])/g, '_$1').toLowerCase()] ||
           "";
  };

  // Helper function to format content with bullets
  const formatSection = (content: string | undefined) => {
    if (!content) return "Not available";
    
    // Check if content contains bullet points
    if (content.includes("•") || content.includes("-")) {
      // Convert string with bullet points to an array of points
      return (
        <ul className="list-disc pl-5 space-y-1">
          {content.split(/[•\-]\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map((item, index) => (
              <li key={index}>{item}</li>
            ))}
        </ul>
      );
    }
    
    // If no bullet points, just return the text with paragraphs
    return content.split("\n").map((paragraph, index) => (
      paragraph ? <p key={index} className="mb-2">{paragraph}</p> : null
    ));
  };

  if (loading) {
    return <StructuredViewSkeleton />;
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Project Name</CardDescription>
            <CardTitle className="text-lg">{project.project_name}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Company</CardDescription>
            <CardTitle className="text-lg flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {project.company_name}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Industry</CardDescription>
            <CardTitle className="text-lg flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              {project.industry_type}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <User className="h-5 w-5 mr-2" /> 
            Project Owner: {project.username}
          </CardTitle>
        </CardHeader>
      </Card>
      
      {/* Overview Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BookOpen className="h-5 w-5 mr-2" />
            Project Overview
          </CardTitle>
          <CardDescription>A summary of key project information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground whitespace-pre-line">
            {project.project_idea || "No project idea provided."}
          </div>
          
          {structuredDoc ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Problem Statement
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getDocValue('problem') || "Not available"}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Proposed Solution
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getDocValue('solution') || "Not available"}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center py-4">
              <p className="text-muted-foreground">AI analysis in progress or not available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Problem Statement */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Problem Statement
            </CardTitle>
            <CardDescription>The problem this project aims to solve</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {getDocValue('problem') || "Not available"}
          </div>
        </CardContent>
      </Card>
      
      {/* Proposed Solution */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Proposed Solution
            </CardTitle>
            <CardDescription>How this project tackles the problem</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {getDocValue('solution') || "Not available"}
          </div>
        </CardContent>
      </Card>
      
      {/* Why This Solution */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Why This Solution?
            </CardTitle>
            <CardDescription>Reasoning behind the proposed approach</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {getDocValue('whyThis') || "Not available"}
          </div>
        </CardContent>
      </Card>
      
      {/* Research */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Research from Client
            </CardTitle>
            <CardDescription>Background research informing this project</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {getDocValue('researchFromClient') || "Not available"}
          </div>
        </CardContent>
      </Card>
      
      {/* Features and Details */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Features and Details
            </CardTitle>
            <CardDescription>Key functionalities and specifications</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {getDocValue('featuresAndDetails') || "Not available"}
          </div>
          
          {structuredDoc && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                AI Suggestions
              </h3>
              <div className="whitespace-pre-line bg-muted p-4 rounded-md">
                {getDocValue('aiSuggestion') || "No AI suggestions available"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Market Analysis Section */}
      {project.market_analysis && (
        <>
          <div className="border-t pt-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              Market Analysis
              {project.market_analysis.status && (
                <Badge variant="outline" className="ml-2">
                  {project.market_analysis.status}
                </Badge>
              )}
            </h2>
            {project.market_analysis.confidence_score && (
              <div className="mb-4 text-sm text-muted-foreground">
                Analysis confidence score: {project.market_analysis.confidence_score}%
              </div>
            )}
          </div>
          
          {/* Market Trends */}
          <Card className="border-l-4 border-l-sky-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Market Trends
                </CardTitle>
                <CardDescription>Current trends in the {project.industry_type} market</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.market_trends)}
              </div>
            </CardContent>
          </Card>
          
          {/* Target Audience */}
          {project.market_analysis.target_audience && (
            <Card className="border-l-4 border-l-violet-500">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    Target Audience
                  </CardTitle>
                  <CardDescription>Analysis of the target market and customer segments</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {formatSection(project.market_analysis.target_audience)}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Demand Insights */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Demand Insights
                </CardTitle>
                <CardDescription>Analysis of potential demand and customer needs</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.demand_insights)}
              </div>
            </CardContent>
          </Card>
          
          {/* Top Competitors */}
          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Competitors
                </CardTitle>
                <CardDescription>Key players and their strengths in this market</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.top_competitors)}
              </div>
            </CardContent>
          </Card>
          
          {/* Strategic Recommendations */}
          {project.market_analysis.strategic_recommendations && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Strategic Recommendations
                  </CardTitle>
                  <CardDescription>Suggested strategic approaches based on market analysis</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line">
                  {formatSection(project.market_analysis.strategic_recommendations)}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Market Gap & Opportunity */}
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Market Gap & Opportunity
                </CardTitle>
                <CardDescription>The specific gap this project addresses</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.market_gap_opportunity)}
              </div>
            </CardContent>
          </Card>
          
          {/* SWOT Analysis */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  SWOT Analysis
                </CardTitle>
                <CardDescription>Strengths, Weaknesses, Opportunities, and Threats</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.swot_analysis)}
              </div>
            </CardContent>
          </Card>
          
          {/* Industry Benchmarks */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Industry Benchmarks
                </CardTitle>
                <CardDescription>Key performance indicators for this industry</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {formatSection(project.market_analysis.industry_benchmarks)}
              </div>
            </CardContent>
          </Card>
          
          {/* Research Sources Section */}
          {project.market_analysis.research_sources && (
            <Card className="border-l-4 border-l-gray-500">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Research Sources
                  </CardTitle>
                  <CardDescription>Sources used for market research analysis</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="sources">
                    <AccordionTrigger className="text-md font-medium">
                      View Research Sources
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {project.market_analysis.research_sources.split(/[\n\r]/)
                          .filter(source => source.trim().length > 0)
                          .map((source, index) => {
                            // Extract URL if present in the source text
                            const urlMatch = source.match(/https?:\/\/[^\s]+/);
                            const url = urlMatch ? urlMatch[0] : "";
                            
                            // Clean up the source text to get just the title
                            let title = source.replace(/https?:\/\/[^\s]+/, "").trim();
                            // Remove list markers if any
                            title = title.replace(/^[•\-\d.]+\s*/, "");
                            
                            return (
                              <div key={index} className="flex items-start py-1">
                                <ExternalLink className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                                {url ? (
                                  <a 
                                    href={url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {title || url}
                                  </a>
                                ) : (
                                  <span>{title || source}</span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

const StructuredViewSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-40 mt-1" />
            </CardHeader>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
      </Card>
      
      <div>
        <Skeleton className="h-10 w-full mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectStructuredView;
