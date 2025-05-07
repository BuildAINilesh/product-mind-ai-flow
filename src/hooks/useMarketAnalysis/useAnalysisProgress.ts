
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessStep } from "@/components/market-sense/MarketAnalysisProgress";
import { ANALYSIS_STATUS_KEY, ANALYSIS_STEPS_KEY, ANALYSIS_CURRENT_STEP_KEY } from "./types";

export const useAnalysisProgress = (requirementId: string | null, marketAnalysis: any) => {
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProcessStep[]>([
    { name: "Generating search queries", status: "pending" },
    { name: "Searching the web", status: "pending", current: 0, total: 5 },
    { name: "Scraping content", status: "pending", current: 0, total: 9 },
    { name: "Summarizing research", status: "pending", current: 0, total: 9 },
    { name: "Creating market analysis", status: "pending" }
  ]);

  // Check ongoing analysis process
  const checkOngoingAnalysisProcess = () => {
    if (!requirementId) return;
    
    try {
      // Retrieve saved process data from localStorage
      const currentStepSaved = localStorage.getItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      const stepsSaved = localStorage.getItem(ANALYSIS_STEPS_KEY + requirementId);
      
      if (currentStepSaved && stepsSaved) {
        // Parse the saved data
        const parsedCurrentStep = parseInt(currentStepSaved);
        const parsedSteps = JSON.parse(stepsSaved);
        
        // Update the state with the saved data
        setCurrentStep(parsedCurrentStep);
        setProgressSteps(parsedSteps);
        setAnalysisInProgress(true);
        
        // Check if the analysis has been completed in the database
        checkMarketAnalysisStatus();
      }
    } catch (error) {
      console.error("Error checking ongoing analysis:", error);
    }
  };

  // Check market analysis status
  const checkMarketAnalysisStatus = async () => {
    if (!requirementId) return;
    
    try {
      const { data, error } = await supabase
        .from('market_analysis')
        .select('status')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking market analysis status:", error);
        return;
      }
      
      if (data && data.status === 'Completed') {
        console.log("Market analysis has been completed, updating UI");
        // Reset in-progress status
        localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
        localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
        localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
        
        // Update steps to show all completed
        setProgressSteps(steps => steps.map(step => ({ ...step, status: "completed" })));
        setCurrentStep(progressSteps.length);
        
        // Wait a bit and then reset the UI
        setTimeout(() => {
          setAnalysisInProgress(false);
          window.location.reload();
        }, 3000);
      }
    } catch (e) {
      console.error("Error checking market analysis:", e);
    }
  };

  // Update step status
  const updateStepStatus = (stepIndex: number, status: "pending" | "processing" | "completed" | "failed", current = null, total = null) => {
    setProgressSteps(prevSteps => {
      const updatedSteps = prevSteps.map((step, index) => {
        if (index === stepIndex) {
          const updatedStep = { ...step, status };
          if (current !== null) updatedStep.current = current;
          if (total !== null) updatedStep.total = total;
          return updatedStep;
        }
        return step;
      });
      
      // Save to localStorage for persistence
      if (requirementId) {
        localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(updatedSteps));
      }
      
      return updatedSteps;
    });
  };

  useEffect(() => {
    if (!requirementId) return;
    
    // Only poll if analysis is in progress
    if (!analysisInProgress) return;
    
    const checkAnalysisCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('market_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking market analysis:", error);
          return;
        }
        
        if (data && data.market_trends && data.status === 'Completed') {
          console.log("Market analysis has been completed, updating UI");
          
          // Reset in-progress status
          localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
          localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
          localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
          
          // Update steps to show all completed
          setProgressSteps(steps => steps.map(step => ({ ...step, status: "completed" })));
          setCurrentStep(progressSteps.length);
          
          // Wait a bit and then reset the UI
          setTimeout(() => {
            setAnalysisInProgress(false);
            // Refresh the page to show the completed analysis
            if (!marketAnalysis?.market_trends) {
              window.location.reload();
            }
          }, 3000);
        }
      } catch (e) {
        console.error("Error polling for market analysis completion:", e);
      }
    };
    
    // Poll every 10 seconds
    const interval = setInterval(checkAnalysisCompletion, 10000);
    
    return () => clearInterval(interval);
  }, [requirementId, analysisInProgress, progressSteps.length, marketAnalysis?.market_trends]);

  return {
    analysisInProgress,
    currentStep,
    progressSteps,
    setProgressSteps,
    setCurrentStep,
    setAnalysisInProgress,
    updateStepStatus,
    checkOngoingAnalysisProcess,
    checkMarketAnalysisStatus
  };
};
