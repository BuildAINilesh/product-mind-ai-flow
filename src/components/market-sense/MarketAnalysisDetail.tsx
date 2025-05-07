
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  RequirementData,
  RequirementAnalysisData,
  MarketAnalysisData,
  ResearchSource,
} from "@/hooks/useMarketAnalysis";
import MarketAnalysisProgress from "./MarketAnalysisProgress";
import MarketAnalysisContent from "./MarketAnalysisContent";
import MarketAnalysisCardHeader from "./MarketAnalysisCardHeader";
import MarketAnalysisAlert from "./MarketAnalysisAlert";
import ValidatorButton from "./ValidatorButton";
import type { ProcessStep } from "./MarketAnalysisProgress";

interface MarketAnalysisDetailProps {
  requirement: RequirementData | null;
  requirementAnalysis: RequirementAnalysisData | null;
  marketAnalysis: MarketAnalysisData | null;
  researchSources: ResearchSource[];
  analysisInProgress: boolean;
  progressSteps: ProcessStep[];
  currentStep: number;
  onGenerateAnalysis: () => Promise<void>;
}

export const MarketAnalysisDetail = ({
  requirement,
  requirementAnalysis,
  marketAnalysis,
  researchSources,
  analysisInProgress,
  progressSteps,
  currentStep,
  onGenerateAnalysis,
}: MarketAnalysisDetailProps) => {
  if (!requirement) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <MarketAnalysisCardHeader 
          requirement={requirement}
          marketAnalysis={marketAnalysis}
          analysisInProgress={analysisInProgress}
          onGenerateAnalysis={onGenerateAnalysis}
          requirementAnalysis={requirementAnalysis}
        />
      </CardHeader>

      <CardContent>
        {/* Progress UI when analysis is in progress */}
        {analysisInProgress && (
          <MarketAnalysisProgress
            progressSteps={progressSteps}
            currentStep={currentStep}
          />
        )}

        {/* Display market analysis if available */}
        {marketAnalysis?.market_trends && (
          <MarketAnalysisContent
            marketAnalysis={marketAnalysis}
            researchSources={researchSources}
          />
        )}

        {/* Display a message if no analysis and we're not in progress */}
        {!marketAnalysis?.market_trends && !analysisInProgress && (
          <MarketAnalysisAlert />
        )}
      </CardContent>

      {/* Add a footer with Validator button when market analysis is completed */}
      {marketAnalysis?.market_trends && (
        <CardFooter className="pt-6 border-t flex justify-start">
          <ValidatorButton requirement={requirement} />
        </CardFooter>
      )}
    </Card>
  );
};

export default MarketAnalysisDetail;
