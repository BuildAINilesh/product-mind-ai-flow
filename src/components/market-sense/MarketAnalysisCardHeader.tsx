
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { RequirementData, MarketAnalysisData } from "@/hooks/useMarketAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";

interface MarketAnalysisCardHeaderProps {
  requirement: RequirementData;
  marketAnalysis: MarketAnalysisData | null;
  analysisInProgress: boolean;
  onGenerateAnalysis: () => Promise<void>;
  requirementAnalysis: any;
}

export const MarketAnalysisCardHeader = ({
  requirement,
  marketAnalysis,
  analysisInProgress,
  onGenerateAnalysis,
  requirementAnalysis,
}: MarketAnalysisCardHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex justify-between items-start flex-wrap gap-3">
      <div className="flex-1 min-w-0">
        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2 flex-wrap">
          <span className="truncate">{requirement?.req_id} - {requirement?.project_name}</span>
          {marketAnalysis?.status && (
            <Badge
              variant={
                marketAnalysis.status === "Completed" ? "default" : "outline"
              }
            >
              {marketAnalysis.status}
            </Badge>
          )}
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
