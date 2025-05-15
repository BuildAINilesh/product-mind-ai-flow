import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  EditIcon,
  BrainCircuit,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ValidationResultSummary from "./ValidationResultSummary";
import ValidationRisksRecommendations from "./ValidationRisksRecommendations";
import ValidationEmptyState from "./ValidationEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FlowStage,
  completeValidator,
  getRequirementFlowStatus,
} from "@/services/requirementFlowService";
import { useEffect, useState } from "react";

// Define types for requirement and validation data
interface RequirementType {
  id: string;
  req_id?: string;
  project_name?: string;
  user_id: string;
}

interface ValidationDataType {
  id: string;
  requirement_id: string;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  readiness_score: number | null;
  validation_verdict: string | null;
  status: string | null;
}

interface ValidationDetailsProps {
  requirementId: string | null;
  requirement: RequirementType | null;
  validationData: ValidationDataType | null;
  isRequirementLoading: boolean;
  isValidating: boolean;
  error?: string | null;
  handleValidate: () => void;
}

const ValidationDetails = ({
  requirementId,
  requirement,
  validationData,
  isRequirementLoading,
  isValidating,
  error,
  handleValidate,
}: ValidationDetailsProps) => {
  const navigate = useNavigate();
  const [verifyingData, setVerifyingData] = useState(false);

  // Verify validation data matches the current requirement
  useEffect(() => {
    if (requirement && validationData && !isValidating) {
      setVerifyingData(true);

      // Verify this validation data belongs to the current requirement
      if (validationData.requirement_id !== requirement.id) {
        console.error(`[ERROR] Validation data mismatch! 
          Validation requirement_id: ${validationData.requirement_id}, 
          Current requirement: ${requirement.id}`);
        setVerifyingData(false);
        return;
      }

      setVerifyingData(false);
    }
  }, [requirement, validationData, isValidating]);

  if (!requirementId) {
    return null;
  }

  const handleAICaseGenerator = async () => {
    if (!requirement || !requirement.id) {
      toast.error("Requirement ID is missing");
      return;
    }

    try {
      // Check if a case generator record already exists
      const { data: existingData, error: checkError } = await supabase
        .from("case_generator")
        .select("id")
        .eq("requirement_id", requirement.id)
        .maybeSingle();

      // If no record exists, create one
      if (!existingData && !checkError) {
        const { data, error: insertError } = await supabase
          .from("case_generator")
          .insert([
            {
              requirement_id: requirement.id,
              user_stories_status: "Draft",
              use_cases_status: "Draft",
              test_cases_status: "Draft",
            },
          ])
          .select();

        if (insertError) {
          console.error(
            "Error creating AI Case Generator record:",
            insertError
          );
          toast.error("Failed to create AI Case Generator record");
          return;
        }

        console.log("Created AI Case Generator record:", data);
        toast.success("AI Case Generator record created");
      } else if (checkError) {
        console.error("Error checking for existing record:", checkError);
      } else {
        console.log("AI Case Generator record already exists");
      }

      // Navigate to the AI Case Generator page for this requirement
      navigate(
        `/dashboard/ai-cases?requirementId=${encodeURIComponent(requirementId)}`
      );
    } catch (error) {
      console.error("Error in AI Case Generator process:", error);
      toast.error("Failed to create AI Case Generator record");
    }
  };

  // Handler for stage navigation
  const handleStageSelect = (stage: FlowStage) => {
    switch (stage) {
      case "requirement_capture":
        navigate(`/dashboard/requirements/${requirement?.id}`);
        break;
      case "analysis":
        navigate(`/dashboard/requirements/${requirement?.id}?tab=analysis`);
        break;
      case "market_sense":
        navigate(
          `/dashboard/market-sense?requirementId=${
            requirement?.req_id || requirement?.id
          }`
        );
        break;
      case "validator":
        // Already on this page, so no need to navigate
        break;
      case "case_generator":
        navigate(
          `/dashboard/ai-cases?requirementId=${
            requirement?.req_id || requirement?.id
          }`
        );
        break;
      case "brd":
        navigate(
          `/dashboard/signoff?requirementId=${
            requirement?.req_id || requirement?.id
          }`
        );
        break;
    }
  };

  // Show loading state when loading requirement or validating
  if (isRequirementLoading || isValidating || verifyingData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="text-center">
          {isRequirementLoading
            ? "Loading requirement..."
            : verifyingData
            ? "Verifying validation data..."
            : "Running AI validation..."}
        </p>
        {isValidating && (
          <p className="text-sm text-muted-foreground max-w-md text-center">
            The AI is analyzing your requirement and market data. This may take
            up to 30 seconds...
          </p>
        )}
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show not found message if requirement is missing
  if (!requirement) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Requirement Not Found</AlertTitle>
        <AlertDescription>
          The requested requirement could not be found. It might have been
          deleted or you may not have access to it.
        </AlertDescription>
      </Alert>
    );
  }

  // Only show validation results when we have completed validation data with correct status
  const shouldShowResults =
    validationData &&
    validationData.status === "Completed" &&
    validationData.requirement_id === requirement.id;

  if (shouldShowResults) {
    // 2x2 grid layout for 4 sections
    return (
      <div className="w-full max-w-6xl mx-auto mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Box 1: Validation Summary */}
          <div className="min-h-[260px]">
            <ValidationResultSummary
              validationData={validationData}
              requirement={requirement}
              summaryOnly
            />
          </div>
          {/* Box 2: Strengths */}
          <div className="min-h-[260px]">
            <ValidationResultSummary
              validationData={validationData}
              requirement={requirement}
              strengthsOnly
            />
          </div>
          {/* Box 3: Risks */}
          <div className="min-h-[260px]">
            <ValidationRisksRecommendations
              validationData={validationData}
              requirement={requirement}
              risksOnly
            />
          </div>
          {/* Box 4: Recommendations */}
          <div className="min-h-[260px]">
            <ValidationRisksRecommendations
              validationData={validationData}
              requirement={requirement}
              recommendationsOnly
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {/* Next Stage Button */}
          <Button
            onClick={handleAICaseGenerator}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-md hover:from-indigo-600 hover:to-blue-600 transition-all"
          >
            <BrainCircuit className="mr-2 h-5 w-5" />
            Proceed to AI Case Generator
          </Button>
        </div>
      </div>
    );
  }

  // Default: show empty state with analyze button
  return (
    <ValidationEmptyState
      handleValidate={handleValidate}
      isValidating={isValidating}
    />
  );
};

export default ValidationDetails;
