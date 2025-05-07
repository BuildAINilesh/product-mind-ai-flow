
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequirementData, RequirementAnalysisData, MarketAnalysisData, ResearchSource } from "./types";

export const useFetchRequirementData = (
  requirementId: string | null,
  checkOngoingAnalysisProcess: () => void
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirement, setRequirement] = useState<RequirementData | null>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<RequirementAnalysisData | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysisData | null>(null);
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([]);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

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
      const isProcessing = localStorage.getItem(`marketAnalysis_status_${requirementId}`) === 'true';
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

  useEffect(() => {
    if (requirementId) {
      fetchRequirementData();
    }
  }, [requirementId]);

  return {
    loading,
    error,
    requirement,
    requirementAnalysis,
    marketAnalysis,
    researchSources,
    dataFetchAttempted,
    setMarketAnalysis,
    fetchRequirementData,
  };
};
