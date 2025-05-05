
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RequirementCardProps {
  requirement: any;
  requirementAnalysis: any;
  isLoading: boolean;
  isValidating: boolean;
  validationData: any;
  onValidate: () => void;
}

const RequirementCard = ({ 
  requirement, 
  requirementAnalysis, 
  isLoading,
  isValidating, 
  validationData, 
  onValidate 
}: RequirementCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-2/3" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-28 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
        </CardTitle>
        <CardDescription>
          Review the requirement and analysis for validation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {requirement && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
              <h3 className="font-medium text-lg mb-2">{requirement.project_name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Badge variant="outline">ID: {requirement.req_id}</Badge>
                <Badge variant="outline">{requirement.industry_type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {requirement.project_idea || requirement.document_summary || "No description available"}
              </p>
            </div>
            
            <Button 
              className="w-full"
              variant="validator"
              disabled={isValidating || !requirementAnalysis} 
              onClick={onValidate}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Validating...
                </>
              ) : validationData?.status === "Completed" ? (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Re-validate Requirement
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Validate Requirement
                </>
              )}
            </Button>
            
            {!requirementAnalysis && (
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                <AlertTriangle className="h-4 w-4 mx-auto mb-2 text-amber-500" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This requirement needs to be analyzed first before validation can be performed.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequirementCard;
