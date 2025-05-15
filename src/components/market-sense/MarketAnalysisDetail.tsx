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
  ANALYSIS_STATUS_KEY,
  ANALYSIS_STEPS_KEY,
  ANALYSIS_CURRENT_STEP_KEY,
} from "@/hooks/useMarketAnalysis";
import MarketAnalysisProgress from "./MarketAnalysisProgress";
import MarketAnalysisContent from "./MarketAnalysisContent";
import MarketAnalysisCardHeader from "./MarketAnalysisCardHeader";
import MarketAnalysisAlert from "./MarketAnalysisAlert";
import ValidatorButton from "./ValidatorButton";
import { AICard } from "@/components/ui/ai-elements";
import type { ProcessStep } from "./MarketAnalysisProgress";
import { Button } from "@/components/ui/button";
import { Lightbulb, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { completeMarketSense } from "@/services/requirementFlowService";

interface MarketAnalysisDetailProps {
  requirement: RequirementData | null;
  requirementAnalysis: RequirementAnalysisData | null;
  marketAnalysis: MarketAnalysisData | null;
  researchSources: ResearchSource[];
  analysisInProgress: boolean;
  progressSteps: ProcessStep[];
  currentStep: number;
  onGenerateAnalysis: () => Promise<MarketAnalysisData | null>;
  resetAnalysisProgress: () => void;
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
  resetAnalysisProgress,
}: MarketAnalysisDetailProps) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [didAdvanceFlow, setDidAdvanceFlow] = useState(false);

  // Function to advance the flow to the validator stage
  const advanceToValidatorStage = async () => {
    if (!requirement?.id) return;

    try {
      console.log(
        "Advancing flow to validator stage for requirement:",
        requirement.id
      );
      const success = await completeMarketSense(requirement.id);

      if (success) {
        console.log("Successfully advanced to validator stage");
        toast.success(
          "Market analysis complete! You can now proceed to the AI Validator stage."
        );
        setDidAdvanceFlow(true);
      } else {
        console.error("Failed to advance to validator stage");
      }
    } catch (error) {
      console.error("Error advancing to validator stage:", error);
    }
  };

  // Effect to advance the flow when market analysis is complete
  useEffect(() => {
    if (
      requirement &&
      marketAnalysis?.market_trends &&
      !analysisInProgress &&
      !didAdvanceFlow
    ) {
      advanceToValidatorStage();
    }
  }, [
    requirement,
    marketAnalysis?.market_trends,
    analysisInProgress,
    didAdvanceFlow,
  ]);

  if (!requirement) {
    return null;
  }

  console.log("MarketAnalysisDetail render:", {
    analysisInProgress,
    hasMarketTrends: !!marketAnalysis?.market_trends,
    marketAnalysis,
  });

  // Function to handle the generate button click
  const handleGenerateClick = async () => {
    console.log("Generate button clicked, current state:", {
      analysisInProgress,
      requirementId: requirement?.id,
    });

    // Prevent double-clicks
    if (isButtonLoading) return;

    setIsButtonLoading(true);
    setDidAdvanceFlow(false); // Reset flow advancement state for new analysis

    try {
      // Always force clear localStorage data first to fix any stuck state
      if (requirement?.id) {
        console.log("Forcefully clearing localStorage data");
        localStorage.removeItem(ANALYSIS_STATUS_KEY + requirement.id);
        localStorage.removeItem(ANALYSIS_STEPS_KEY + requirement.id);
        localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirement.id);
      }

      // Then reset the analysis progress in the hook state
      console.log("Resetting analysis progress before starting new analysis");
      resetAnalysisProgress();

      // Finally start a new analysis
      toast.info("Starting market analysis...");

      // Wrap the function call to avoid TypeScript errors
      try {
        await Promise.resolve(onGenerateAnalysis());
      } catch (err) {
        console.error("Error in onGenerateAnalysis:", err);
      }
    } catch (error) {
      console.error("Error in handleGenerateClick:", error);
      toast.error("Error starting analysis. Please try again.");
      resetAnalysisProgress();
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (isButtonLoading) return "Starting Analysis...";
    if (analysisInProgress) return "Restart Market Analysis";
    return "Start Market Analysis Now";
  };

  // Create a wrapper for onGenerateAnalysis to match expected type in MarketAnalysisCardHeader
  const onGenerateAnalysisWrapper = async (): Promise<void> => {
    await onGenerateAnalysis();
  };

  return (
    <AICard className="backdrop-blur-md bg-white/60">
      <CardHeader className="pb-2">
        <MarketAnalysisCardHeader
          requirement={requirement}
          marketAnalysis={marketAnalysis}
          analysisInProgress={analysisInProgress}
          onGenerateAnalysis={onGenerateAnalysisWrapper}
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

        {/* Always show the generate button, regardless of analysis state */}
        <div className="mt-6 flex justify-center">
          {(!marketAnalysis?.market_trends || analysisInProgress) && (
            <Button
              onClick={handleGenerateClick}
              disabled={isButtonLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transform hover:scale-105 transition-all active:translate-y-0.5"
            >
              {isButtonLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {getButtonText()}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Add a footer with Validator button when market analysis is completed */}
      {marketAnalysis?.market_trends && (
        <CardFooter className="pt-6 border-t flex justify-start">
          <ValidatorButton requirement={requirement} />
        </CardFooter>
      )}
    </AICard>
  );
};

export default MarketAnalysisDetail;
