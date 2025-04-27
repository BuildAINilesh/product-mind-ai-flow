
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  Sparkles, 
  Layers, 
  Search,
  Building,
  Briefcase,
  User
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

interface ProjectData {
  id: string;
  project_name: string;
  company_name: string;
  industry_type: string;
  username: string;
  project_idea: string | null;
  structured_document: StructuredDocument | null;
  [key: string]: any; // For any other fields
}

interface ProjectStructuredViewProps {
  project: ProjectData | null;
  loading?: boolean;
}

export const ProjectStructuredView = ({ project, loading = false }: ProjectStructuredViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [structuredDoc, setStructuredDoc] = useState<StructuredDocument | null>(null);

  useEffect(() => {
    if (project?.structured_document) {
      setStructuredDoc(project.structured_document);
    }
  }, [project]);

  // Helper to get value regardless of key format (camelCase or snake_case)
  const getDocValue = (key: string) => {
    if (!structuredDoc) return "";
    
    // Try both camelCase and snake_case variants
    return structuredDoc[key] || 
           structuredDoc[key.replace(/([A-Z])/g, '_$1').toLowerCase()] ||
           "";
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="problem">Problem</TabsTrigger>
          <TabsTrigger value="solution">Solution</TabsTrigger>
          <TabsTrigger value="why">Why This?</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Project Overview
              </CardTitle>
              <CardDescription>
                A summary of key project information
              </CardDescription>
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
        </TabsContent>

        <TabsContent value="problem" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {getDocValue('problem') || "Not available"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solution" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Proposed Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {getDocValue('solution') || "Not available"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="why" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Why This Solution?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {getDocValue('whyThis') || "Not available"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Research from Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {getDocValue('researchFromClient') || "Not available"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Features and Details
              </CardTitle>
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
        </TabsContent>
      </Tabs>
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
