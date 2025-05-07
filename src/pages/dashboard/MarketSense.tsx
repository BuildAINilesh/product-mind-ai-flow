
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMarketAnalysis } from "@/hooks/useMarketAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";
import MarketAnalysisHeader from "@/components/market-sense/MarketAnalysisHeader";
import MarketAnalysisList from "@/components/market-sense/MarketAnalysisList";
import MarketAnalysisDetail from "@/components/market-sense/MarketAnalysisDetail";
import ErrorDisplay from "@/components/market-sense/ErrorDisplay";
import NotFoundDisplay from "@/components/market-sense/NotFoundDisplay";

const MarketSense = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  // Get requirementId from URL params
  const requirementId = searchParams.get('requirementId');
  
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
  } = useMarketAnalysis(requirementId);

  // If we're loading and no data fetch has been attempted yet, show a loading indicator
  if (loading && !dataFetchAttempted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="ml-2">Loading data...</p>
      </div>
    );
  }
  
  // If there's an error and we have a requirementId, show the error
  if (error && requirementId) {
    return <ErrorDisplay message={error} />;
  }
  
  // If no requirementId is provided, show a list of all market analyses
  if (!requirementId) {
    return (
      <div className="space-y-4 md:space-y-6">
        <MarketAnalysisHeader showBackButton={false} />
        <MarketAnalysisList 
          loading={loading} 
          analyses={allMarketAnalyses}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
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
    <div className="space-y-4 md:space-y-6">
      <MarketAnalysisHeader 
        projectName={requirement?.project_name} 
        requirementId={requirementId}
      />
      
      {/* Requirement info card */}
      <MarketAnalysisDetail
        requirement={requirement}
        requirementAnalysis={requirementAnalysis}
        marketAnalysis={marketAnalysis}
        researchSources={researchSources}
        analysisInProgress={analysisInProgress}
        progressSteps={progressSteps}
        currentStep={currentStep}
        onGenerateAnalysis={generateAnalysis}
      />
    </div>
  );
};

export default MarketSense;
