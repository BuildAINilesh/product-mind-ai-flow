
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  RequirementData, 
  RequirementAnalysisData,
  MarketAnalysisData,
  ANALYSIS_STATUS_KEY,
  ANALYSIS_CURRENT_STEP_KEY,
  ANALYSIS_STEPS_KEY
} from "./types";
import { ProcessStep } from "@/components/market-sense/MarketAnalysisProgress";

export const useGenerateAnalysis = (
  requirementId: string | null,
  requirement: RequirementData | null,
  requirementAnalysis: RequirementAnalysisData | null,
  updateStepStatus: (index: number, status: "pending" | "processing" | "completed" | "failed", current?: number | null, total?: number | null) => void,
  setCurrentStep: (step: number) => void,
  setAnalysisInProgress: (inProgress: boolean) => void,
  progressSteps: ProcessStep[]
) => {
  const [generating, setGenerating] = useState(false);

  // Function to generate market analysis
  const generateAnalysis = async (): Promise<MarketAnalysisData | null> => {
    if (!requirementId || !requirement || !requirementAnalysis) {
      toast.error("Missing requirement data. Cannot generate analysis.");
      return null;
    }
    
    if (generating) {
      toast.error("Analysis generation already in progress. Please wait.");
      return null;
    }
    
    try {
      setGenerating(true);
      setAnalysisInProgress(true);
      
      // Save analysis in progress status to localStorage
      localStorage.setItem(ANALYSIS_STATUS_KEY + requirementId, 'true');
      localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(progressSteps));
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '0');
      
      console.log("Starting market analysis generation for:", requirementId);
      
      // STEP 1: Generate search queries
      setCurrentStep(0);
      updateStepStatus(0, "processing");
      
      const { data: queriesData, error: queriesError } = await supabase.functions.invoke('generate-market-queries', {
        body: {
          requirementId,
          projectName: requirement.project_name,
          industry: requirement.industry_type,
          problemStatement: requirementAnalysis.problem_statement,
          proposedSolution: requirementAnalysis.proposed_solution,
          keyFeatures: requirementAnalysis.key_features
        }
      });
      
      if (queriesError) {
        console.error("Error generating search queries:", queriesError);
        updateStepStatus(0, "failed");
        throw queriesError;
      }
      
      console.log("Search queries generated:", queriesData);
      updateStepStatus(0, "completed");
      
      // STEP 2: Process search queries to get URLs
      setCurrentStep(1);
      updateStepStatus(1, "processing");
      
      let current = 0;
      let urls: string[] = [];
      
      // Process each search query to get URLs
      for (const query of queriesData.queries) {
        current++;
        updateStepStatus(1, "processing", current, queriesData.queries.length);
        
        const { data: urlsData, error: urlsError } = await supabase.functions.invoke('process-market-queries', {
          body: {
            requirementId,
            query
          }
        });
        
        if (urlsError) {
          console.error("Error processing search query:", urlsError);
          continue;
        }
        
        if (urlsData && urlsData.urls) {
          urls = [...urls, ...urlsData.urls];
        }
      }
      
      if (urls.length === 0) {
        updateStepStatus(1, "failed");
        throw new Error("Failed to find any relevant URLs for research");
      }
      
      updateStepStatus(1, "completed");
      console.log("Found URLs for research:", urls);
      
      // STEP 3: Scrape content from URLs
      setCurrentStep(2);
      updateStepStatus(2, "processing");
      
      current = 0;
      let scrapedCount = 0;
      
      // Limit to first 9 URLs to avoid overloading
      const urlsToScrape = urls.slice(0, 9);
      
      for (const url of urlsToScrape) {
        current++;
        updateStepStatus(2, "processing", current, urlsToScrape.length);
        
        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-research-urls', {
          body: {
            requirementId,
            url
          }
        });
        
        if (scrapeError) {
          console.error("Error scraping URL:", scrapeError);
          continue;
        }
        
        if (scrapeData && scrapeData.success) {
          scrapedCount++;
        }
      }
      
      if (scrapedCount === 0) {
        updateStepStatus(2, "failed");
        throw new Error("Failed to scrape any content from URLs");
      }
      
      updateStepStatus(2, "completed");
      console.log("Scraped content from URLs");
      
      // STEP 4: Summarize research content
      setCurrentStep(3);
      updateStepStatus(3, "processing");
      
      const { data: sourcesData, error: sourcesError } = await supabase
        .from('market_research_sources')
        .select('id, status')
        .eq('requirement_id', requirementId)
        .eq('status', 'scraped');
        
      if (sourcesError) {
        console.error("Error getting research sources:", sourcesError);
        updateStepStatus(3, "failed");
        throw sourcesError;
      }
      
      current = 0;
      let summarizedCount = 0;
      
      for (const source of sourcesData) {
        current++;
        updateStepStatus(3, "processing", current, sourcesData.length);
        
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-research-content', {
          body: {
            sourceId: source.id
          }
        });
        
        if (summaryError) {
          console.error("Error summarizing content:", summaryError);
          continue;
        }
        
        if (summaryData && summaryData.success) {
          summarizedCount++;
        }
      }
      
      if (summarizedCount === 0 && sourcesData.length > 0) {
        updateStepStatus(3, "failed");
        throw new Error("Failed to summarize any research content");
      }
      
      updateStepStatus(3, "completed");
      console.log("Summarized research content");
      
      // STEP 5: Create market analysis
      setCurrentStep(4);
      updateStepStatus(4, "processing");
      
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-market', {
        body: {
          requirementId,
          projectName: requirement.project_name,
          industry: requirement.industry_type,
          problemStatement: requirementAnalysis.problem_statement,
          proposedSolution: requirementAnalysis.proposed_solution
        }
      });
      
      if (analysisError) {
        console.error("Error creating market analysis:", analysisError);
        updateStepStatus(4, "failed");
        throw analysisError;
      }
      
      console.log("Market analysis created:", analysisData);
      updateStepStatus(4, "completed");
      
      // Update steps in localStorage with completed state
      const completedSteps = progressSteps.map(step => ({ ...step, status: "completed" }));
      localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(completedSteps));
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '5'); 
      
      // Fetch and return the newly created market analysis
      const { data: marketAnalysis, error: fetchError } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching market analysis:", fetchError);
        throw fetchError;
      }
      
      return marketAnalysis;
      
    } catch (error: any) {
      console.error("Error generating market analysis:", error);
      toast.error("Failed to generate market analysis: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generateAnalysis };
};
