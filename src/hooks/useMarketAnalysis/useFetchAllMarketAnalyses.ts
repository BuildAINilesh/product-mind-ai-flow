
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MarketAnalysisState } from "./types";

export const useFetchAllMarketAnalyses = (requirementId: string | null) => {
  const [state, setState] = useState<Pick<MarketAnalysisState, 'allMarketAnalyses' | 'loading' | 'error' | 'dataFetchAttempted'>>({
    allMarketAnalyses: [],
    loading: false,
    error: null,
    dataFetchAttempted: false
  });

  const fetchAllMarketAnalyses = async () => {
    if (requirementId) return; // Skip if we have a specific requirementId
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
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
        setState(prev => ({ 
          ...prev, 
          allMarketAnalyses: combinedData.filter(item => item.requirements),
          dataFetchAttempted: true
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          allMarketAnalyses: [],
          dataFetchAttempted: true
        }));
      }
      
    } catch (error: any) {
      console.error("Error fetching market analyses:", error);
      setState(prev => ({ 
        ...prev, 
        error: "Failed to load market analyses. Please try again.",
        dataFetchAttempted: true
      }));
      toast.error("Failed to load market analyses");
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchAllMarketAnalyses();
  }, [requirementId]);

  return {
    ...state,
    fetchAllMarketAnalyses
  };
};
