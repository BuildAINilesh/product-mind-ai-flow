import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  FlowStage,
  FlowStatus,
  getRequirementFlowStatus,
  completeRequirementCapture,
  completeAnalysis,
  completeMarketSense,
  completeValidator,
  completeCaseGenerator,
  completeBRD,
  canProceedToStage,
} from "@/services/requirementFlowService";

/**
 * Hook to handle requirement flow navigation and status updates
 */
export function useRequirementFlow(requirementId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState<FlowStage | null>(null);

  // Query the current flow status
  const {
    data: flowStatus,
    isLoading: isLoadingFlow,
    error: flowError,
    refetch: refetchFlowStatus,
  } = useQuery({
    queryKey: ["requirement-flow-status", requirementId],
    queryFn: async () => getRequirementFlowStatus(requirementId),
    enabled: !!requirementId,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Set current view to match flow status when loaded
  useEffect(() => {
    if (flowStatus && !currentView) {
      setCurrentView(flowStatus.current_stage);
    }
  }, [flowStatus, currentView]);

  // Navigate to a different stage in the flow
  const navigateToStage = async (targetStage: FlowStage) => {
    if (!flowStatus) return false;

    // Force a refetch to make sure we have the latest data
    await refetchFlowStatus();

    // Check if we can proceed to this stage
    const canProceed = await canProceedToStage(requirementId, targetStage);

    if (!canProceed) {
      toast({
        title: "Cannot Navigate",
        description: "You must complete the current stage before proceeding",
        variant: "destructive",
      });
      return false;
    }

    // Update the current view
    setCurrentView(targetStage);

    // For market_sense stage, create a market_analysis record if it doesn't exist
    if (targetStage === "market_sense") {
      try {
        // First check if a record already exists
        const { data: existingRecord } = await supabase
          .from("market_analysis")
          .select("id")
          .eq("requirement_id", requirementId)
          .maybeSingle();

        // If no record exists, create one
        if (!existingRecord) {
          console.log(
            "Creating new market_analysis record for requirement:",
            requirementId
          );
          const { error: insertError } = await supabase
            .from("market_analysis")
            .insert({
              requirement_id: requirementId,
              status: "Draft",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error(
              "Error creating market_analysis record:",
              insertError
            );
            // Continue anyway, the MarketSense component will handle the absence
          } else {
            console.log("Created market_analysis record successfully");
          }
        }

        // Also update the flow tracking
        const { error: flowError } = await supabase
          .from("requirement_flow_tracking")
          .update({
            current_stage: "market_sense",
            market_sense_status: "in_progress",
            updated_at: new Date().toISOString(),
          })
          .eq("requirement_id", requirementId);

        if (flowError) {
          console.error(
            "Error updating flow tracking for market_sense:",
            flowError
          );
        }
      } catch (err) {
        console.error("Exception preparing for market_sense:", err);
        // Continue anyway, we'll still try to navigate
      }
    }

    // Based on the stage, navigate to the appropriate URL
    switch (targetStage) {
      case "requirement_capture":
        navigate(`/dashboard/requirements/${requirementId}`);
        break;
      case "analysis":
        navigate(`/dashboard/requirements/${requirementId}?tab=analysis`);
        break;
      case "market_sense":
        // Update to use the query parameter format instead of path-based navigation
        navigate(`/dashboard/market-sense?requirementId=${requirementId}`);
        break;
      case "validator":
        navigate(`/dashboard/validator?requirementId=${requirementId}`);
        break;
      case "case_generator":
        navigate(`/dashboard/ai-cases?requirementId=${requirementId}`);
        break;
      case "brd":
        navigate(`/dashboard/signoff?requirementId=${requirementId}`);
        break;
    }

    return true;
  };

  // Complete the current stage and move to the next one
  const completeCurrentStage = async () => {
    if (!flowStatus || !currentView) return false;

    let success = false;

    switch (currentView) {
      case "requirement_capture":
        success = await completeRequirementCapture(requirementId);
        break;
      case "analysis":
        success = await completeAnalysis(requirementId);
        break;
      case "market_sense":
        success = await completeMarketSense(requirementId);
        break;
      case "validator":
        success = await completeValidator(requirementId);
        break;
      case "case_generator":
        success = await completeCaseGenerator(requirementId);
        break;
      case "brd":
        success = await completeBRD(requirementId);
        break;
    }

    if (success) {
      // Invalidate the query to refetch the flow status
      queryClient.invalidateQueries({
        queryKey: ["requirement-flow-status", requirementId],
      });

      // Force an immediate refetch
      await refetchFlowStatus();

      // Show success message
      toast({
        title: "Stage Completed",
        description: "Moving to the next stage in the flow",
      });

      // Determine the next stage
      const stages: FlowStage[] = [
        "requirement_capture",
        "analysis",
        "market_sense",
        "validator",
        "case_generator",
        "brd",
      ];
      const currentIndex = stages.indexOf(currentView);

      // If not the last stage, navigate to the next one
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        await navigateToStage(nextStage);
      }
    }

    return success;
  };

  // Check if a specific stage is the currently active one
  const isActiveStage = (stage: FlowStage): boolean => {
    return currentView === stage;
  };

  return {
    flowStatus,
    isLoadingFlow,
    flowError,
    currentView,
    navigateToStage,
    completeCurrentStage,
    isActiveStage,
    refetchFlowStatus,
  };
}
