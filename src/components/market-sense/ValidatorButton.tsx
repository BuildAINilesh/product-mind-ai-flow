import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RequirementData } from "@/hooks/useMarketAnalysis";

interface ValidatorButtonProps {
  requirement: RequirementData;
}

export const ValidatorButton = ({ requirement }: ValidatorButtonProps) => {
  const navigate = useNavigate();
  const [isCreatingValidation, setIsCreatingValidation] = useState(false);

  const handleValidatorClick = async (e: React.MouseEvent) => {
    // Prevent event propagation to ensure the click is captured
    e.stopPropagation();
    e.preventDefault();

    if (!requirement.id) {
      console.error("Missing requirement ID", requirement);
      toast.error("Requirement ID is missing");
      return;
    }

    console.log("Validator button clicked for requirement:", {
      id: requirement.id,
      req_id: requirement.req_id,
      project_name: requirement.project_name,
    });

    setIsCreatingValidation(true);

    try {
      // First check if a validation record already exists for this requirement
      const { data: existingValidation, error: fetchError } = await supabase
        .from("requirement_validation")
        .select("id, status")
        .eq("requirement_id", requirement.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("Error checking for existing validation:", fetchError);
        toast.error("Failed to check for existing validation");
        setIsCreatingValidation(false);
        return;
      }

      let validationId;
      const timestamp = new Date().toISOString();

      if (existingValidation) {
        // Use the existing validation record
        console.log("Using existing validation record:", existingValidation.id);
        validationId = existingValidation.id;

        // Update the existing record if needed
        if (existingValidation.status !== "Draft") {
          const { error: updateError } = await supabase
            .from("requirement_validation")
            .update({
              status: "Draft",
              updated_at: timestamp,
            })
            .eq("id", validationId);

          if (updateError) {
            console.error("Error updating validation record:", updateError);
            toast.error("Failed to update validation record");
            setIsCreatingValidation(false);
            return;
          }
        }
      } else {
        // Create a new validation record
        console.log(
          "Creating new validation record for requirement:",
          requirement.id
        );
        const { data, error } = await supabase
          .from("requirement_validation")
          .insert([
            {
              requirement_id: requirement.id,
              status: "Draft",
              readiness_score: null,
              validation_verdict: null,
              created_at: timestamp,
              updated_at: timestamp,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error creating validation:", error);
          toast.error("Failed to create validation record");
          setIsCreatingValidation(false);
          return;
        }

        validationId = data.id;
        console.log("Created validation record with ID:", validationId);
        toast.success("Created validation record");
      }

      // Navigate to validator page using the req_id (e.g., REQ-25-03) instead of internal UUID
      const navigateUrl = `/dashboard/validator?requirementId=${encodeURIComponent(
        requirement.req_id || requirement.id
      )}`;

      console.log(`Navigating to: ${navigateUrl}`);
      setIsCreatingValidation(false);
      navigate(navigateUrl);
    } catch (error) {
      console.error("Error in validation process:", error);
      toast.error("Failed to create validation record");
      setIsCreatingValidation(false);
    }
  };

  return (
    <Button
      onClick={handleValidatorClick}
      disabled={isCreatingValidation}
      variant="validator"
      className="flex items-center gap-2 cursor-pointer relative z-10 hover:scale-105 transition-transform active:translate-y-0.5"
      type="button"
      tabIndex={0}
    >
      {isCreatingValidation ? (
        <>
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Creating Validation...
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4" />
          AI Validator
        </>
      )}
    </Button>
  );
};

export default ValidatorButton;
