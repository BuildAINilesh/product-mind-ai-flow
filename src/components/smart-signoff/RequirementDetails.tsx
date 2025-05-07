
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, FileText, Clock, AlertCircle } from "lucide-react";
import { StakeholderList } from "./StakeholderList";
import { CommentsSection } from "./CommentsSection";
import { BRDRequirement } from "@/types/smart-signoff";

interface RequirementDetailsProps {
  requirement: BRDRequirement;
  onApprove: (requirementId: string) => Promise<void>;
  onReject: (requirementId: string) => Promise<void>;
  onViewBRD: (requirementId: string) => void;
}

export const RequirementDetails = ({
  requirement,
  onApprove,
  onReject,
  onViewBRD,
}: RequirementDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>{requirement.title}</CardTitle>
              <Badge variant={
                requirement.status === "signed_off" ? "success" :
                requirement.status === "rejected" ? "destructive" :
                requirement.status === "ready" ? "outline" : "secondary"
              }>
                {requirement.status.charAt(0).toUpperCase() + requirement.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              {requirement.req_id}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => onViewBRD(requirement.id)}
            >
              <FileText className="h-4 w-4" />
              View BRD
            </Button>

            {requirement.status === "ready" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onReject(requirement.id)}
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => onApprove(requirement.id)}
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground">
            {requirement.description}
          </p>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Quality Score</h3>
            <span className="text-sm font-medium">
              {requirement.qualityScore}/100
            </span>
          </div>
          <Progress 
            value={requirement.qualityScore} 
            className="h-2"
            indicatorClassName={`${
              requirement.qualityScore >= 90 ? "bg-green-500" :
              requirement.qualityScore >= 70 ? "bg-yellow-500" :
              "bg-red-500"
            }`}
          />
          
          {requirement.status === "draft" && (
            <div className="mt-2 flex items-center gap-1 text-xs bg-amber-50 text-amber-700 p-2 rounded border border-amber-200">
              <AlertCircle className="h-3 w-3" />
              <span>BRD is in draft state. Consider finalizing before submitting for approval.</span>
            </div>
          )}
        </div>
        
        <StakeholderList stakeholders={requirement.stakeholders} />
        
        <CommentsSection comments={requirement.comments} />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {requirement.lastUpdated}
          </div>
          {requirement.status === "signed_off" && (
            <div className="flex items-center">
              <Check className="h-3 w-3 mr-1 text-green-500" />
              Approved
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
