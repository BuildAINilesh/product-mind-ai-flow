import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import {
  RequirementData,
  MarketAnalysisData,
  RequirementAnalysisData,
} from "@/hooks/useMarketAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";

interface MarketAnalysisCardHeaderProps {
  requirement: RequirementData;
  marketAnalysis: MarketAnalysisData | null;
  analysisInProgress: boolean;
  onGenerateAnalysis: () => Promise<void>;
  requirementAnalysis: RequirementAnalysisData | null;
}

export const MarketAnalysisCardHeader = ({
  requirement,
  marketAnalysis,
  analysisInProgress,
  onGenerateAnalysis,
  requirementAnalysis,
}: MarketAnalysisCardHeaderProps) => {
  const isMobile = useIsMobile();

  // Get status badge based on the status
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-yellow-500" />
          <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
            Draft
          </Badge>
        </div>
      );
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle2 size={12} className="text-green-500" />
          <Badge variant="success" className="px-2 py-0.5 text-xs font-medium">
            Completed
          </Badge>
        </div>
      );
    } else if (normalizedStatus === "analyzing") {
      return (
        <div className="flex items-center gap-1">
          <AlertTriangle size={12} className="text-blue-500" />
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-xs font-medium"
          >
            Analyzing
          </Badge>
        </div>
      );
    } else if (normalizedStatus === "draft") {
      return (
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-yellow-500" />
          <Badge variant="warning" className="px-2 py-0.5 text-xs font-medium">
            Draft
          </Badge>
        </div>
      );
    } else {
      return (
        <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
          {status}
        </Badge>
      );
    }
  };

  return (
    <div className="flex justify-between items-start flex-wrap gap-3">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 flex-wrap">
          <span className="truncate">
            {requirement?.req_id} - {requirement?.project_name}
          </span>
          {marketAnalysis?.status && getStatusBadge(marketAnalysis.status)}
        </CardTitle>
        <CardDescription>
          Industry: {requirement?.industry_type}
        </CardDescription>
      </div>

      {!marketAnalysis?.market_trends && !analysisInProgress && (
        <Button
          onClick={onGenerateAnalysis}
          disabled={!requirementAnalysis}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          size={isMobile ? "sm" : "default"}
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          {isMobile ? "Generate" : "Generate Market Analysis"}
        </Button>
      )}
    </div>
  );
};

export default MarketAnalysisCardHeader;
