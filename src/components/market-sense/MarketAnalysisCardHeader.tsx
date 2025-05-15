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

  // Debug information
  console.log("MarketAnalysisCardHeader render:", {
    hasMarketTrends: !!marketAnalysis?.market_trends,
    analysisInProgress,
    hasRequirementAnalysis: !!requirementAnalysis,
  });

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

      {/* Always show the button unless analysis is in progress or already completed */}
      {(!marketAnalysis?.market_trends ||
        marketAnalysis.market_trends === "") &&
        !analysisInProgress && (
          <Button
            onClick={onGenerateAnalysis}
            disabled={false}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 z-10"
            size={isMobile ? "sm" : "default"}
            title={
              !requirementAnalysis
                ? "Warning: Requirement analysis data is missing, but you can still generate market analysis"
                : "Generate market analysis for this requirement"
            }
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            {isMobile ? "Generate" : "Generate Market Analysis"}
          </Button>
        )}

      {/* Show fallback button if other conditions are blocking the main button */}
      {((marketAnalysis?.market_trends &&
        marketAnalysis.market_trends !== "") ||
        analysisInProgress === true) && (
        <div className="text-sm text-gray-500 italic">
          {analysisInProgress
            ? "Analysis in progress..."
            : "Analysis already exists. To regenerate, reset the market analysis first."}
        </div>
      )}
    </div>
  );
};

export default MarketAnalysisCardHeader;
