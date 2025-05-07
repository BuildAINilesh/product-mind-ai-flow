
import { Badge } from "@/components/ui/badge";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { RequirementData, MarketAnalysisData } from "@/hooks/useMarketAnalysis";

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
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {requirement?.req_id} - {requirement?.project_name}
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
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Generate Market Analysis
        </Button>
      )}
    </div>
  );
};

export default MarketAnalysisCardHeader;
