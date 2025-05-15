import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export type FlowStage =
  | "requirement_capture"
  | "analysis"
  | "market_sense"
  | "validator"
  | "case_generator"
  | "brd";

export type FlowStatus =
  Database["public"]["Tables"]["requirement_flow_tracking"]["Row"];

/**
 * Fetches the current flow status for a requirement
 */
export async function getRequirementFlowStatus(
  requirementId: string
): Promise<FlowStatus | null> {
  try {
    const { data, error } = await supabase
      .from("requirement_flow_tracking")
      .select("*")
      .eq("requirement_id", requirementId)
      .single();

    if (error) {
      console.error("Error fetching requirement flow status:", error);
      return null;
    }

    return data as FlowStatus;
  } catch (err) {
    console.error("Exception fetching requirement flow status:", err);
    return null;
  }
}

/**
 * Checks if a requirement can proceed to the next stage
 */
export async function canProceedToStage(
  requirementId: string,
  targetStage: FlowStage
): Promise<boolean> {
  const flowStatus = await getRequirementFlowStatus(requirementId);
  if (!flowStatus) return false;

  const stageOrder: FlowStage[] = [
    "requirement_capture",
    "analysis",
    "market_sense",
    "validator",
    "case_generator",
    "brd",
  ];

  const currentStageIndex = stageOrder.indexOf(
    flowStatus.current_stage as FlowStage
  );
  const targetStageIndex = stageOrder.indexOf(targetStage);

  // Check if trying to skip stages
  if (targetStageIndex > currentStageIndex + 1) {
    return false;
  }

  // Check if current stage is complete
  if (targetStageIndex > currentStageIndex) {
    switch (flowStatus.current_stage) {
      case "requirement_capture":
        return flowStatus.requirement_capture_status === "complete";
      case "analysis":
        return flowStatus.analysis_status === "complete";
      case "market_sense":
        return flowStatus.market_sense_status === "market_complete";
      case "validator":
        return flowStatus.validator_status === "validation_complete";
      case "case_generator":
        return flowStatus.case_generator_status === "case_complete";
      default:
        return false;
    }
  }

  // If moving to the current stage or a previous stage, it's allowed
  return true;
}

/**
 * Completes the requirement capture stage and moves to analysis
 */
export async function completeRequirementCapture(
  requirementId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("complete_requirement_capture", {
      req_id: requirementId,
    });

    if (error) {
      console.error("Error completing requirement capture:", error);
      toast({
        title: "Error",
        description: "Failed to mark requirement capture as complete",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception completing requirement capture:", err);
    return false;
  }
}

/**
 * Completes the analysis stage and moves to market sense
 */
export async function completeAnalysis(
  requirementId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("complete_analysis", {
      req_id: requirementId,
    });

    if (error) {
      console.error("Error completing analysis:", error);
      toast({
        title: "Error",
        description: "Failed to mark analysis as complete",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception completing analysis:", err);
    return false;
  }
}

/**
 * Completes the market sense stage and moves to validator
 */
export async function completeMarketSense(
  requirementId: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("complete_market_sense", {
      req_id: requirementId,
    });

    if (error) {
      console.error("Error completing market sense:", error);
      toast({
        title: "Error",
        description: "Failed to mark market sense as complete",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception completing market sense:", err);
    return false;
  }
}

/**
 * Completes the validator stage and moves to case generator
 */
export async function completeValidator(
  requirementId: string
): Promise<boolean> {
  try {
    // First try the standard approach using the SQL function
    const { error: rpcError } = await supabase.rpc("complete_validator", {
      req_id: requirementId,
    });

    // If the RPC fails, fall back to direct update
    if (rpcError) {
      console.warn(
        "RPC approach failed, falling back to direct update:",
        rpcError
      );

      // Direct update approach - doesn't check for current_stage
      const { error: updateError } = await supabase
        .from("requirement_flow_tracking")
        .update({
          validator_status: "validation_complete",
          current_stage: "case_generator",
          case_generator_status: "case_draft",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      if (updateError) {
        console.error(
          "Error completing validator (direct update):",
          updateError
        );
        toast({
          title: "Error",
          description: "Failed to mark validator as complete",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    return true;
  } catch (err) {
    console.error("Exception completing validator:", err);
    return false;
  }
}

/**
 * Completes the case generator stage and moves to BRD
 */
export async function completeCaseGenerator(
  requirementId: string
): Promise<boolean> {
  try {
    // First try the standard approach using the SQL function
    const { error: rpcError } = await supabase.rpc("complete_case_generator", {
      req_id: requirementId,
    });

    // If the RPC fails, fall back to direct update
    if (rpcError) {
      console.warn(
        "RPC approach failed for case generator, falling back to direct update:",
        rpcError
      );

      // Direct update approach - update only specific fields to avoid auto-advancing
      const { error: updateError } = await supabase
        .from("requirement_flow_tracking")
        .update({
          case_generator_status: "case_complete",
          // Explicitly NOT setting current_stage to "brd" here to avoid auto-advancing
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      if (updateError) {
        console.error(
          "Error completing case generator (direct update):",
          updateError
        );
        toast({
          title: "Error",
          description: "Failed to mark case generator as complete",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    return true;
  } catch (err) {
    console.error("Exception completing case generator:", err);
    return false;
  }
}

/**
 * Completes the BRD stage (signed off)
 */
export async function completeBRD(requirementId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("complete_brd", {
      req_id: requirementId,
    });

    if (error) {
      console.error("Error completing BRD:", error);
      toast({
        title: "Error",
        description: "Failed to mark BRD as signed off",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error("Exception completing BRD:", err);
    return false;
  }
}

/**
 * Returns a user-friendly description of the current flow stage
 */
export function getFlowStageDescription(stage: FlowStage): string {
  switch (stage) {
    case "requirement_capture":
      return "Requirement Capture";
    case "analysis":
      return "AI Requirement Analysis";
    case "market_sense":
      return "MarketSenseAI";
    case "validator":
      return "AI Validator";
    case "case_generator":
      return "AI Case Generator";
    case "brd":
      return "SmartSignoff AI";
    default:
      return "Unknown Stage";
  }
}

/**
 * Returns a user-friendly status message for the current flow state
 */
export function getFlowStatusMessage(flowStatus: FlowStatus): string {
  if (!flowStatus) return "Unknown status";

  switch (flowStatus.current_stage as FlowStage) {
    case "requirement_capture":
      return flowStatus.requirement_capture_status === "draft"
        ? "Draft requirement - Please complete and submit your requirement"
        : "Requirement complete - Ready for AI analysis";

    case "analysis":
      return flowStatus.analysis_status === "draft"
        ? "AI analysis in progress - Structuring your requirement"
        : "Analysis complete - Ready for market research";

    case "market_sense":
      return flowStatus.market_sense_status === "market_draft"
        ? "Market research in progress - Gathering insights"
        : "Market research complete - Ready for validation";

    case "validator":
      return flowStatus.validator_status === "validation_draft"
        ? "Validation in progress - Evaluating market readiness"
        : "Validation complete - Ready for case generation";

    case "case_generator":
      return flowStatus.case_generator_status === "case_draft"
        ? "Case generation in progress - Creating user stories and test cases"
        : "Case generation complete - Ready for BRD creation";

    case "brd":
      if (flowStatus.brd_status === "draft") {
        return "BRD creation in progress";
      } else if (flowStatus.brd_status === "ready") {
        return "BRD ready for review and signoff";
      } else if (flowStatus.brd_status === "signed_off") {
        return "BRD signed off - Process complete";
      } else if (flowStatus.brd_status === "rejected") {
        return "BRD rejected - Please review feedback";
      } else {
        return "Unknown BRD status";
      }

    default:
      return "Unknown stage";
  }
}
