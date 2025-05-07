
import { useState, useEffect } from "react";
import { useFetchAllMarketAnalyses } from "./useFetchAllMarketAnalyses";
import { useFetchRequirementData } from "./useFetchRequirementData";
import { useAnalysisProgress } from "./useAnalysisProgress";
import { useGenerateAnalysis } from "./useGenerateAnalysis";

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
  const {
    allMarketAnalyses,
  } = useFetchAllMarketAnalyses(requirementId);

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
    const newAnalysis = await runGenerateAnalysis();
    if (newAnalysis) {
      setMarketAnalysis(newAnalysis);
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
  };
};

export default useMarketAnalysis;
