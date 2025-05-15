import { useState, useEffect } from "react";
import { useFetchAllMarketAnalyses } from "./useFetchAllMarketAnalyses";
import { useFetchRequirementData } from "./useFetchRequirementData";
import { useAnalysisProgress } from "./useAnalysisProgress";
import { useGenerateAnalysis } from "./useGenerateAnalysis";
import { toast } from "sonner";

export * from "./types";

export const useMarketAnalysis = (requirementId: string | null) => {
  // Get analysis progress state and methods
  const {
    analysisInProgress,
    currentStep,
    progressSteps,
    setProgressSteps,
    setCurrentStep,
    setAnalysisInProgress,
    updateStepStatus,
    checkOngoingAnalysisProcess,
    resetAnalysisProgress,
  } = useAnalysisProgress(requirementId, null);

  // Get requirement data
  const {
    loading,
    error,
    requirement,
    requirementAnalysis,
    marketAnalysis,
    researchSources,
    dataFetchAttempted,
    setMarketAnalysis,
    fetchRequirementData,
  } = useFetchRequirementData(requirementId, checkOngoingAnalysisProcess);

  // Get market analyses for overview
  const { allMarketAnalyses } = useFetchAllMarketAnalyses(requirementId);

  // Initialize the generate analysis function
  const { generateAnalysis: runGenerateAnalysis } = useGenerateAnalysis(
    requirementId,
    requirement,
    requirementAnalysis,
    updateStepStatus,
    setCurrentStep,
    setAnalysisInProgress,
    progressSteps
  );

  // Wrapper for generate analysis to update the UI with new data
  const generateAnalysis = async () => {
    console.log("generateAnalysis called in useMarketAnalysis hook");

    // Make sure we have a requirementId
    if (!requirementId) {
      console.error("No requirementId provided to generateAnalysis");
      toast.error("Missing requirement ID. Cannot generate analysis.");
      return;
    }

    try {
      console.log("Calling runGenerateAnalysis...");
      const newAnalysis = await runGenerateAnalysis();
      console.log("runGenerateAnalysis returned:", newAnalysis);

      if (newAnalysis) {
        setMarketAnalysis(newAnalysis);
      }

      return newAnalysis;
    } catch (error) {
      console.error("Error in generateAnalysis wrapper:", error);
      toast.error("Failed to generate market analysis. Please try again.");
      return null;
    }
  };

  return {
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
    setProgressSteps,
    setCurrentStep,
    setAnalysisInProgress,
    generateAnalysis,
    updateStepStatus,
    resetAnalysisProgress,
  };
};

export default useMarketAnalysis;
