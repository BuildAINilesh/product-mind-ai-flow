import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProcessStep } from "@/components/market-sense/MarketAnalysisProgress";

// Define constants for localStorage keys
const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";

export type RequirementData = {
  id: string;
  project_name: string;
  industry_type: string;
  req_id: string;
  company_name: string;
  [key: string]: any;
};

export type RequirementAnalysisData = {
  problem_statement?: string;
  proposed_solution?: string;
  key_features?: string;
  [key: string]: any;
};

export type MarketAnalysisData = {
  id: string;
  requirement_id: string;
  status?: string;
  market_trends?: string;
  target_audience?: string;
  demand_insights?: string;
  top_competitors?: string;
  market_gap_opportunity?: string;
  swot_analysis?: string;
  industry_benchmarks?: string;
  confidence_score?: number;
  research_sources?: string;
  created_at: string;
  [key: string]: any;
};

export type ResearchSource = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  requirement_id: string;
  snippet?: string | null;
  status?: string | null;
};

export const useMarketAnalysis = (requirementId: string | null) => {
  const [requirement, setRequirement] = useState<RequirementData | null>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<RequirementAnalysisData | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisData | null>(null);
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([]);
  const [allMarketAnalyses, setAllMarketAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  
  // Analysis progress tracking states
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProcessStep[]>([
    { name: "Generating search queries", status: "pending" },
    { name: "Searching the web", status: "pending", current: 0, total: 5 },
    { name: "Scraping content", status: "pending", current: 0, total: 9 },
    { name: "Summarizing research", status: "pending", current: 0, total: 9 },
    { name: "Creating market analysis", status: "pending" }
  ]);

  // Fetch all market analyses
  const fetchAllMarketAnalyses = async () => {
    if (requirementId) return; // Skip if we have a specific requirementId
    
    setLoading(true);
    setError(null);
    try {
      // Using an alternative approach with separate queries to get market analyses and requirement details
      const { data: marketData, error: marketError } = await supabase
        .from('market_analysis')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (marketError) throw marketError;

      // Get an array of requirement IDs from market_analysis table
      const requirementIds = marketData.map(item => item.requirement_id).filter(Boolean);
      
      // If we have requirement IDs, fetch the corresponding requirements
      if (requirementIds.length > 0) {
        const { data: requirementsData, error: reqError } = await supabase
          .from('requirements')
          .select('*')
          .in('id', requirementIds);
        
        if (reqError) throw reqError;
        
        // Map the requirements data to each market analysis entry
        const combinedData = marketData.map(marketItem => {
          const matchingRequirement = requirementsData.find(req => req.id === marketItem.requirement_id);
          return {
            ...marketItem,
            requirements: matchingRequirement || null
          };
        });
        
        console.log("Fetched and combined market analyses:", combinedData);
        setAllMarketAnalyses(combinedData.filter(item => item.requirements)); // Filter out any items without requirement data
      } else {
        setAllMarketAnalyses([]);
      }
      
      setDataFetchAttempted(true);
      
    } catch (error: any) {
      console.error("Error fetching market analyses:", error);
      setError("Failed to load market analyses. Please try again.");
      toast.error("Failed to load market analyses");
      setDataFetchAttempted(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific requirement data
  const fetchRequirementData = async () => {
    if (!requirementId) {
      console.log("No requirementId provided");
      return;
    }
    
    console.log("Fetching data for requirementId:", requirementId);
    setLoading(true);
    setError(null);
    try {
      // Check if there's an ongoing analysis process for this requirement
      const isProcessing = localStorage.getItem(ANALYSIS_STATUS_KEY + requirementId) === 'true';
      if (isProcessing) {
        console.log("Found ongoing analysis process");
        // Instead of redirecting, setup the UI to show progress
        checkOngoingAnalysisProcess();
      }
      
      // Fetch the requirement
      const { data: reqData, error: reqError } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', requirementId)
        .single();
        
      if (reqError) {
        console.error("Error fetching requirement:", reqError);
        throw reqError;
      }
      
      console.log("Requirement data:", reqData);
      setRequirement(reqData);
      
      // Fetch the requirement analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('requirement_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (analysisError && analysisError.code !== 'PGRST116') {
        console.error("Error fetching requirement analysis:", analysisError);
        throw analysisError;
      }
      
      console.log("Requirement analysis data:", analysisData);
      setRequirementAnalysis(analysisData || null);
      
      // Fetch market analysis if it exists
      const { data: marketData, error: marketError } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (marketError && marketError.code !== 'PGRST116') {
        console.error("Error fetching market analysis:", marketError);
        throw marketError;
      }
      
      console.log("Market analysis data:", marketData);
      setDataFetchAttempted(true);
      
      // If market analysis exists, set it
      if (marketData) {
        setMarketAnalysis(marketData);
        
        // Fetch research sources from market_research_sources table
        const { data: sourcesData, error: sourcesError } = await supabase
          .from('market_research_sources')
          .select('*')
          .eq('requirement_id', requirementId);
          
        if (sourcesError) {
          console.error("Error fetching research sources:", sourcesError);
        } else {
          console.log("Research sources data:", sourcesData);
          setResearchSources(sourcesData || []);
        }
      } else {
        // If market analysis doesn't exist, create a draft entry
        console.log("Creating new market analysis draft");
        const { data: newMarketData, error: createError } = await supabase
          .from('market_analysis')
          .insert({
            requirement_id: requirementId,
            status: 'Draft'
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating market analysis:", createError);
          throw createError;
        }
        
        console.log("Created new market analysis:", newMarketData);
        setMarketAnalysis(newMarketData);
        
        toast.success("New market analysis draft has been created");
      }
      
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError("Failed to load project data. The requirement might not exist.");
      toast.error("Failed to load project data. The requirement might not exist.");
      setDataFetchAttempted(true);
    } finally {
      setLoading(false);
    }
  };

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

  // Generate analysis
  const generateAnalysis = async () => {
    if (!requirementId) {
      toast.error("No requirement selected for analysis");
      return;
    }
    
    try {
      // Reset progress state and show progress UI
      setProgressSteps(prevSteps => prevSteps.map(step => ({ ...step, status: "pending" })));
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
      
      if (updatedMarketData) {
        setMarketAnalysis(updatedMarketData);
      }
      
      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      
      // Reset analysis in progress state after a short delay
      setTimeout(() => {
        setAnalysisInProgress(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error in market analysis process:', error);
      // Mark current step as failed
      updateStepStatus(currentStep, "failed");
      
      toast.error(error.message || "Failed to complete market analysis");
      
      // Keep localStorage flags so user can see the failed state
    }
  };

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

  useEffect(() => {
    if (requirementId) {
      fetchRequirementData();
    } else {
      fetchAllMarketAnalyses();
    }
  }, [requirementId]);

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
          setMarketAnalysis(data);
          
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
