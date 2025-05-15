import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMarketAnalysis } from "@/hooks/useMarketAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";
import MarketAnalysisHeader from "@/components/market-sense/MarketAnalysisHeader";
import MarketAnalysisList from "@/components/market-sense/MarketAnalysisList";
import MarketAnalysisDetail from "@/components/market-sense/MarketAnalysisDetail";
import MarketAnalysisStats from "@/components/market-sense/MarketAnalysisStats";
import ErrorDisplay from "@/components/market-sense/ErrorDisplay";
import NotFoundDisplay from "@/components/market-sense/NotFoundDisplay";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AICard, AIGradientText } from "@/components/ui/ai-elements";
import {
  ANALYSIS_STATUS_KEY,
  ANALYSIS_STEPS_KEY,
  ANALYSIS_CURRENT_STEP_KEY,
} from "@/hooks/useMarketAnalysis";

const MarketSense = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // Get requirementId from URL params
  const requirementId = searchParams.get("requirementId");

  console.log("Current requirementId:", requirementId);

  const {
    requirement,
    requirementAnalysis,
    marketAnalysis,
    researchSources,
    allMarketAnalyses,
    loading,
    error,
    dataFetchAttempted,
    analysisInProgress,
    currentStep,
    progressSteps,
    generateAnalysis,
    resetAnalysisProgress,
    setAnalysisInProgress,
  } = useMarketAnalysis(requirementId);

  // Function to force reset the analysis state (for emergency use)
  const forceResetAnalysis = async () => {
    if (!requirementId) return;

    try {
      // Clear localStorage
      localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);

      // Reset UI state
      setAnalysisInProgress(false);

      // Reset database state if needed
      await supabase
        .from("requirement_flow_tracking")
        .update({
          market_sense_status: "not_started",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      // Reload the page to get a fresh state
      window.location.reload();

      toast.success("Analysis state has been reset");
    } catch (error) {
      console.error("Error forcing reset:", error);
      toast.error("Could not reset analysis state");
    }
  };

  // Pass the enhanced generateAnalysis function that handles errors
  const handleGenerateAnalysis = async () => {
    try {
      // First reset any existing progress
      resetAnalysisProgress();

      // Then generate the analysis
      return await generateAnalysis();
    } catch (error) {
      console.error("Error in generateAnalysis:", error);
      // Force reset if there's an error
      await forceResetAnalysis();
      return null;
    }
  };

  // If we're loading and no data fetch has been attempted yet, show a loading indicator
  if (loading && !dataFetchAttempted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">
            <AIGradientText>Market Sense</AIGradientText>
          </h1>
        </div>
        <Separator className="my-4" />
        <Card className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-center text-muted-foreground">Loading data...</p>
        </Card>
      </div>
    );
  }

  // If there's an error and we have a requirementId, show the error
  if (error && requirementId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">
            <AIGradientText>Market Sense</AIGradientText>
          </h1>
        </div>
        <Separator className="my-4" />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={forceResetAnalysis}>
          Reset Analysis State
        </Button>
      </div>
    );
  }

  // If no requirementId is provided, show a list of all market analyses
  if (!requirementId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">
            <AIGradientText>Market Sense</AIGradientText>
          </h1>
          <Button
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            onClick={() => (window.location.href = "/dashboard/requirements")}
          >
            New Analysis
          </Button>
        </div>

        <Separator className="my-4" />

        <MarketAnalysisStats analyses={allMarketAnalyses} loading={loading} />

        <div className="bg-white/80 rounded-3xl shadow-2xl p-6 md:p-10 animate-fadeIn">
          <MarketAnalysisList
            loading={loading}
            analyses={allMarketAnalyses}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
    );
  }

  // Single requirement view (when requirementId is provided and requirement exists)
  // Make sure requirement exists before trying to access its properties
  if (!requirement && dataFetchAttempted) {
    return <NotFoundDisplay requirementId={requirementId} />;
  }

  // Main view for a specific requirement with its market analysis
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">
          <AIGradientText>Market Sense</AIGradientText>
          {requirement?.project_name && (
            <span className="ml-2 text-muted-foreground text-base">
              » {requirement.project_name}
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          {analysisInProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={forceResetAnalysis}
            >
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard/market-sense")}
          >
            Back to All
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Requirement info card */}
      <MarketAnalysisDetail
        requirement={requirement}
        requirementAnalysis={requirementAnalysis}
        marketAnalysis={marketAnalysis}
        researchSources={researchSources}
        analysisInProgress={analysisInProgress}
        progressSteps={progressSteps}
        currentStep={currentStep}
        onGenerateAnalysis={handleGenerateAnalysis}
        resetAnalysisProgress={resetAnalysisProgress}
      />
    </div>
  );
};

export default MarketSense;
