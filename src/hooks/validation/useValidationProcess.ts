
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useValidationProcess = (
  setValidationData: (data: any) => void,
  fetchValidations: () => Promise<void>
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (requirement: any) => {
    if (!requirement) {
      toast.error("Requirement data is missing");
      return;
    }

    setIsValidating(true);

    try {
      toast.info("Starting AI validation process...", { duration: 2000 });
      console.log("Starting validation for requirement:", requirement);
      
      // Use req_id when available, fall back to internal UUID
      const idForValidation = requirement.req_id || requirement.id;
      console.log("Using ID for validation:", idForValidation);

      // Call the AI validator edge function
      const { data, error } = await supabase.functions.invoke("ai-validator", {
        body: { requirementId: idForValidation },
      });

      if (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.message || "Validation process failed");
      }

      console.log("Validation completed, received data:", data);

      // Update the local state with the validation results
      if (data.record && data.record[0]) {
        // Ensure the status is set to "Completed"
        const validationRecord = {
          ...data.record[0],
          status: "Completed",
        };
        setValidationData(validationRecord);

        // Also update the status in the database
        const { error: updateError } = await supabase
          .from("requirement_validation")
          .update({ status: "Completed" })
          .eq("id", validationRecord.id);

        if (updateError) {
          console.error("Error updating validation status:", updateError);
        }
      } else if (data.data) {
        const validationRecord = {
          ...data.data,
          status: "Completed",
        };
        setValidationData(validationRecord);
      }

      fetchValidations(); // Refresh the validations list
      toast.success("Requirement validation complete!");
      setError(null);
    } catch (error: any) {
      console.error("Error validating requirement:", error);
      toast.error(error.message || "Validation failed. Please try again.");
      setError(error.message || "Validation failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return { isValidating, error, handleValidate, setError };
};
