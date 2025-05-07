
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRDRequirement } from "@/types/smart-signoff";

interface AISignoffStatsProps {
  requirements: BRDRequirement[];
}

export const AISignoffStats = ({ requirements }: AISignoffStatsProps) => {
  // Calculate stats
  const totalRequirements = requirements.length;
  const pendingApproval = requirements.filter(req => req.status === "ready").length;
  const approved = requirements.filter(req => req.status === "signed_off").length;
  const rejected = requirements.filter(req => req.status === "rejected").length;
  const draftRequirements = requirements.filter(req => req.status === "draft").length;
  
  // Calculate average quality score
  const avgQualityScore = requirements.length > 0
    ? Math.round(
        requirements.reduce((acc, req) => acc + req.qualityScore, 0) / requirements.length
      )
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequirements}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingApproval}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Approval Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalRequirements > 0 
              ? Math.round((approved / (approved + rejected)) * 100) || 0
              : 0}%
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Quality Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgQualityScore}%</div>
        </CardContent>
      </Card>
    </div>
  );
};
