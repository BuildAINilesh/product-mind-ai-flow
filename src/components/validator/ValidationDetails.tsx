
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => navigate("/dashboard/market-sense")}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Market Sense
        </Button>
        {requirement && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-1" 
              onClick={() => console.log("Edit button clicked")}
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="validator"
              className="gap-1"
              onClick={validationData && validationData.status === "Completed" ? handleAICaseGenerator : handleValidate}
              disabled={isValidating}
            >
              <BrainCircuit className="h-4 w-4" />
              {isValidating
                ? "Validating..."
                : validationData && validationData.status === "Completed"
                ? "AI Case Generator"
                : "Analyze"}
            </Button>
          </div>
        )}
      </div>

      {isRequirementLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading requirement...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !requirement ? (
        <Alert variant="destructive" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Requirement Not Found</AlertTitle>
          <AlertDescription>
            The requested requirement could not be found. It might have been deleted or you may not have access to it.
          </AlertDescription>
        </Alert>
      ) : validationData && validationData.status === "Completed" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Summary and scores */}
          <div className="md:col-span-2">
            <ValidationResultSummary
              validationData={validationData}
              requirement={requirement}
            />
          </div>

          {/* Right column - Risks and Recommendations */}
          <div>
            <ValidationRisksRecommendations
              validationData={validationData}
              requirement={requirement}
            />
          </div>
        </div>
      ) : (
        <ValidationEmptyState
          handleValidate={handleValidate}
          isValidating={isValidating}
        />
      )}
    </div>
  );
};

export default ValidationDetails;
