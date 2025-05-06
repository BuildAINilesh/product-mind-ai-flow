
import { AIGradientText } from "@/components/ui/ai-elements";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ValidationDashboardHeaderProps {
  showBackButton?: boolean;
  requirementId?: string | null;
  projectName?: string;
}

const ValidationDashboardHeader = ({
  showBackButton = true,
  requirementId,
  projectName,
}: ValidationDashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold">
            AI <AIGradientText>Validator</AIGradientText>
          </h2>
          {projectName ? (
            <p className="text-muted-foreground mt-1">
              {projectName} <span className="text-xs">({requirementId})</span>
            </p>
          ) : (
            <p className="text-muted-foreground mt-1">
              AI-powered validation for your product requirements
            </p>
          )}
        </div>

        {showBackButton && (
          <Button 
            onClick={() => navigate("/dashboard/market-sense")}
            variant="outline"
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Market Sense
          </Button>
        )}
      </div>
    </div>
  );
};

export default ValidationDashboardHeader;
