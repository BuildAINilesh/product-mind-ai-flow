import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ANALYSIS_STATUS_KEY, ANALYSIS_STEPS_KEY, ANALYSIS_CURRENT_STEP_KEY } from "./types";

export const useGenerateAnalysis = (
  requirementId: string | null,
  requirement: any, 
  requirementAnalysis: any,
  updateStepStatus: any,
  setCurrentStep: any,
  setAnalysisInProgress: any,
  progressSteps: any
) => {
  
  // Summarize additional content
  const summarizeAdditionalContent = async (reqId: string, processedCount: number, totalCount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: reqId }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || "Failed to summarize additional content");
      
      // Update progress
      if (data.remaining && data.remaining > 0) {
        const newProcessedCount = totalCount - data.remaining;
        updateStepStatus(3, "processing", newProcessedCount, totalCount);
        
        // Continue recursively if there's still more to summarize
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(reqId, newProcessedCount, totalCount);
      } else {
        // All done
        updateStepStatus(3, "processing", totalCount, totalCount);
      }
      
      return data;
    } catch (error) {
      console.error('Error summarizing additional content:', error);
      throw error;
    }
  };

  // Generate analysis
  const generateAnalysis = async () => {
    if (!requirementId) {
      toast.error("No requirement selected for analysis");
      return;
    }
    
    try {
      // Reset progress state and show progress UI
      updateStepStatus(0, "pending");
      updateStepStatus(1, "pending");
      updateStepStatus(2, "pending");
      updateStepStatus(3, "pending");
      updateStepStatus(4, "pending");
      setCurrentStep(0);
      setAnalysisInProgress(true);
      
      // Set localStorage flags to indicate analysis is in progress
      localStorage.setItem(ANALYSIS_STATUS_KEY + requirementId, 'true');
      localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(progressSteps));
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '0');
      
      // Step 1: Generate search queries
      updateStepStatus(0, "processing");
      const { data: queriesData, error: queriesError } = await supabase.functions.invoke('generate-market-queries', {
        body: { 
          requirementId: requirementId,
          industryType: requirement?.industry_type,
          problemStatement: requirementAnalysis?.problem_statement || null,
          proposedSolution: requirementAnalysis?.proposed_solution || null,
          keyFeatures: requirementAnalysis?.key_features || null
        }
      });
      
      if (queriesError) throw queriesError;
      if (!queriesData.success) throw new Error(queriesData.message || "Failed to generate search queries");
      
      // Get the total number of queries - Updated to use the correct table name
      const { data: queriesCount, error: countError } = await supabase
        .from("firecrawl_queries")
        .select("id", { count: "exact" })
        .eq("requirement_id", requirementId);
        
      const totalQueries = queriesCount?.length || 5;
      updateStepStatus(1, "pending", 0, totalQueries); // Update the total for search queries
      
      updateStepStatus(0, "completed");
      setCurrentStep(1);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '1');
      
      // Step 2: Process search queries
      updateStepStatus(1, "processing");
      const { data: processData, error: processError } = await supabase.functions.invoke('process-market-queries', {
        body: { requirementId: requirementId }
      });
      
      if (processError) throw processError;
      if (!processData.success) throw new Error(processData.message || "Failed to process search queries");
      
      // Get count of market research sources
      const { data: sourcesCount, error: sourcesError } = await supabase
        .from("market_research_sources")
        .select("id", { count: "exact" })
        .eq("requirement_id", requirementId);
        
      const totalSources = sourcesCount?.length || 9;
      updateStepStatus(2, "pending", 0, totalSources); // Update the total for scraping
      updateStepStatus(3, "pending", 0, totalSources); // Update the total for summarizing
      
      updateStepStatus(1, "completed", totalQueries, totalQueries);
      setCurrentStep(2);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '2');
      
      // Step 3: Scrape research sources
      updateStepStatus(2, "processing");
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-research-urls', {
        body: { requirementId: requirementId }
      });
      
      if (scrapeError) throw scrapeError;
      if (!scrapeData.success) throw new Error(scrapeData.message || "Failed to scrape research sources");
      
      updateStepStatus(2, "completed", totalSources, totalSources);
      setCurrentStep(3);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '3');
      
      // Step 4: Summarize research content
      updateStepStatus(3, "processing");
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: requirementId }
      });
      
      if (summaryError) throw summaryError;
      if (!summaryData.success) throw new Error(summaryData.message || "Failed to summarize research content");
      
      // Check if there's more content to summarize
      if (summaryData.remaining && summaryData.remaining > 0) {
        // Continue summarizing if needed - update progress
        const processedCount = totalSources - summaryData.remaining;
        updateStepStatus(3, "processing", processedCount, totalSources);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(requirementId, processedCount, totalSources);
      }
      
      updateStepStatus(3, "completed", totalSources, totalSources);
      setCurrentStep(4);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '4');
      
      // Step 5: Generate market analysis
      updateStepStatus(4, "processing");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-market', {
        body: { requirementId: requirementId }
      });
      
      if (analysisError) throw analysisError;
      updateStepStatus(4, "completed");
      
      // Refresh the market analysis data
      const { data: updatedMarketData } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .maybeSingle();
      
      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      
      // Reset analysis in progress state after a short delay
      setTimeout(() => {
        setAnalysisInProgress(false);
      }, 2000);
      
      return updatedMarketData;
    } catch (error: any) {
      console.error('Error in market analysis process:', error);
      // Mark current step as failed
      updateStepStatus(currentStep, "failed");
      
      toast.error(error.message || "Failed to complete market analysis");
      
      // Keep localStorage flags so user can see the failed state
      return null;
    }
  };

  return { generateAnalysis };
};
