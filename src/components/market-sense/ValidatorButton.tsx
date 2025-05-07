
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

  const handleValidatorClick = async () => {
    if (!requirement.req_id) {
      toast.error("Requirement ID is missing");
      return;
    }

    setIsCreatingValidation(true);

    try {
      console.log(
        "Creating/checking validation for requirement:",
        requirement.id,
        "req_id:",
        requirement.req_id
      );

      // Always create a fresh validation record for this requirement
      // This ensures it always appears in the validator dashboard
      const timestamp = new Date().toISOString();

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

      const validationId = data.id;
      console.log("Created validation record with ID:", validationId);
      toast.success("Created validation record");

      // Navigate to validator page using the req_id (e.g., REQ-25-03) instead of internal UUID
      setIsCreatingValidation(false);
      console.log(
        `Navigating to validator with req_id: ${requirement.req_id}`
      );
      navigate(
        `/dashboard/validator?requirementId=${encodeURIComponent(
          requirement.req_id
        )}`
      );
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
      className="flex items-center gap-2"
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
