import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, EditIcon, BrainCircuit, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ValidationResultSummary from "./ValidationResultSummary";
import ValidationRisksRecommendations from "./ValidationRisksRecommendations";
import ValidationEmptyState from "./ValidationEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValidationDetailsProps {
  requirementId: string | null;
  requirement: any;
  validationData: any;
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
            }
          ])
          .select();

        if (insertError) {
          console.error("Error creating AI Case Generator record:", insertError);
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
      // Now we should just navigate without any auto-starting flag
      navigate(`/dashboard/ai-cases?requirementId=${encodeURIComponent(requirementId)}`);
    } catch (error) {
      console.error("Error in AI Case Generator process:", error);
      toast.error("Failed to create AI Case Generator record");
    }
  };

  if (isRequirementLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="ml-2">Loading requirement...</p>
      </div>
    );
  }
  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!requirement) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Requirement Not Found</AlertTitle>
        <AlertDescription>
          The requested requirement could not be found. It might have been deleted or you may not have access to it.
        </AlertDescription>
      </Alert>
    );
  }
  if (validationData && validationData.status === "Completed") {
    // 2x2 grid layout for 4 sections
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto mt-6">
        {/* Box 1: Validation Summary */}
        <div className="min-h-[260px]">
          <ValidationResultSummary validationData={validationData} requirement={requirement} summaryOnly />
        </div>
        {/* Box 2: Strengths */}
        <div className="min-h-[260px]">
          <ValidationResultSummary validationData={validationData} requirement={requirement} strengthsOnly />
        </div>
        {/* Box 3: Risks */}
        <div className="min-h-[260px]">
          <ValidationRisksRecommendations validationData={validationData} requirement={requirement} risksOnly />
        </div>
        {/* Box 4: Recommendations */}
        <div className="min-h-[260px]">
          <ValidationRisksRecommendations validationData={validationData} requirement={requirement} recommendationsOnly />
        </div>
      </div>
    );
  }
  return (
    <ValidationEmptyState
      handleValidate={handleValidate}
      isValidating={isValidating}
    />
  );
};

export default ValidationDetails;
