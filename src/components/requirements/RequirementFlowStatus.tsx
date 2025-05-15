import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, ChevronRight, Loader2, Lock } from "lucide-react";

import {
  getRequirementFlowStatus,
  FlowStage,
  getFlowStageDescription,
  getFlowStatusMessage,
} from "@/services/requirementFlowService";

type RequirementFlowStatusProps = {
  requirementId: string;
  onStageSelect?: (stage: FlowStage) => void;
};

/**
 * Component to display the current flow status of a requirement
 */
export function RequirementFlowStatus({
  requirementId,
  onStageSelect,
}: RequirementFlowStatusProps) {
  // Query to fetch the flow status
  const {
    data: flowStatus,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["requirement-flow-status", requirementId],
    queryFn: async () => getRequirementFlowStatus(requirementId),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Stages in order
  const stages: FlowStage[] = [
    "requirement_capture",
    "analysis",
    "market_sense",
    "validator",
    "case_generator",
    "brd",
  ];

  // Calculate progress percentage (which stage out of total stages)
  const calculateProgress = (): number => {
    if (!flowStatus) return 0;

    const currentStageIndex = stages.indexOf(flowStatus.current_stage);
    if (currentStageIndex === -1) return 0;

    // Base progress is how far along the stages we are
    let progress = (currentStageIndex / (stages.length - 1)) * 100;

    // Add a bit more progress based on status within the current stage
    const stageProgress = getStageProgress(flowStatus.current_stage);
    progress += (stageProgress / 100) * (100 / (stages.length - 1));

    return Math.min(Math.round(progress), 100);
  };

  // Get progress within a stage based on the status
  const getStageProgress = (stage: FlowStage): number => {
    if (!flowStatus) return 0;

    switch (stage) {
      case "requirement_capture":
        return flowStatus.requirement_capture_status === "complete" ? 100 : 50;
      case "analysis":
        return flowStatus.analysis_status === "complete" ? 100 : 50;
      case "market_sense":
        return flowStatus.market_sense_status === "market_complete" ? 100 : 50;
      case "validator":
        return flowStatus.validator_status === "validation_complete" ? 100 : 50;
      case "case_generator":
        return flowStatus.case_generator_status === "case_complete" ? 100 : 50;
      case "brd":
        if (flowStatus.brd_status === "signed_off") return 100;
        if (flowStatus.brd_status === "ready") return 75;
        if (flowStatus.brd_status === "draft") return 50;
        return 25;
      default:
        return 0;
    }
  };

  // Determine if a stage is the current one
  const isCurrentStage = (stage: FlowStage): boolean => {
    return flowStatus?.current_stage === stage;
  };

  // Determine if a stage is complete
  const isStageComplete = (stage: FlowStage): boolean => {
    if (!flowStatus) return false;

    switch (stage) {
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
      case "brd":
        return flowStatus.brd_status === "signed_off";
      default:
        return false;
    }
  };

  // Determine if a stage is accessible
  const isStageAccessible = (stage: FlowStage): boolean => {
    if (!flowStatus) return false;

    const currentStageIndex = stages.indexOf(flowStatus.current_stage);
    const stageIndex = stages.indexOf(stage);

    // Current or previous stages are always accessible
    if (stageIndex <= currentStageIndex) return true;

    // Next stage is accessible if current stage is complete
    if (stageIndex === currentStageIndex + 1) {
      return isStageComplete(flowStatus.current_stage);
    }

    // Future stages beyond next are locked
    return false;
  };

  // Get icon for the stage
  const getStageIcon = (stage: FlowStage) => {
    if (isStageComplete(stage)) {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (isCurrentStage(stage)) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }

    if (isStageAccessible(stage)) {
      return <ChevronRight className="h-4 w-4 text-blue-500" />;
    }

    return <Lock className="h-4 w-4 text-gray-400" />;
  };

  // Get color class for the stage
  const getStageColorClass = (stage: FlowStage): string => {
    if (isStageComplete(stage)) {
      return "text-green-600 border-green-400 hover:bg-green-50";
    }

    if (isCurrentStage(stage)) {
      return "text-blue-600 border-blue-400 bg-blue-50 hover:bg-blue-100";
    }

    if (isStageAccessible(stage)) {
      return "text-gray-800 border-gray-200 hover:bg-gray-100";
    }

    return "text-gray-400 border-gray-200 opacity-60 cursor-not-allowed";
  };

  // Handle stage button click
  const handleStageClick = (stage: FlowStage) => {
    if (!isStageAccessible(stage)) return;
    if (onStageSelect) onStageSelect(stage);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2">Loading flow status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !flowStatus) {
    return (
      <Card className="mb-6 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading flow status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Product Requirement Flow</CardTitle>
        <CardDescription>{getFlowStatusMessage(flowStatus)}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={calculateProgress()} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Start</span>
            <span>In Progress</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Stage buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {stages.map((stage) => (
            <Button
              key={stage}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${getStageColorClass(stage)}`}
              disabled={!isStageAccessible(stage)}
              onClick={() => handleStageClick(stage)}
            >
              {getStageIcon(stage)}
              <span>{getFlowStageDescription(stage)}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
