
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MarketAnalysisHeaderProps {
  showBackButton?: boolean;
  projectName?: string;
  requirementId?: string;
}

export const MarketAnalysisHeader = ({
  showBackButton = true,
  projectName,
  requirementId,
}: MarketAnalysisHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            onClick={() => navigate("/dashboard/market-sense")}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Market Analyses
          </Button>
        )}
        {projectName && requirementId && (
          <div>
            <h1 className="text-2xl font-bold">
              {projectName} <span className="text-muted-foreground">({requirementId})</span>
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysisHeader;
