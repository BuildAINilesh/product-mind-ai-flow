
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

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

interface AnalysisHeaderProps {
  project: Project;
  analysisConfidenceScore: number | null;
  hasLimitedAnalysisData: boolean;
}

export const AnalysisHeader = ({
  project,
  analysisConfidenceScore,
  hasLimitedAnalysisData
}: AnalysisHeaderProps) => {
  return (
    <>
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

          {/* Project ID if available */}
          {project.requirement_id && (
            <div className="mb-6 p-3 bg-muted/30 rounded-md">
              <span className="font-medium mr-1">Requirement ID:</span>
              <Badge variant="outline" className="font-mono">
                {project.requirement_id}
              </Badge>
            </div>
          )}

          {analysisConfidenceScore !== null && (
            <div className="flex items-center mb-6 p-3 bg-muted/30 rounded-md">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium mr-1">Analysis Confidence Score:</span>
              <Badge variant="outline" className="ml-auto px-3 py-1 font-medium">
                {analysisConfidenceScore}%
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {hasLimitedAnalysisData && (
        <Alert>
          <Info className="h-5 w-5 text-blue-500" />
          <AlertDescription>
            This requirement has been marked as completed but is showing limited analysis details.
            You may need to run a full analysis to see all sections.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
