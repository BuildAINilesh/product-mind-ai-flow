import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { completeValidator } from "@/services/requirementFlowService";

// Define interface for the requirement
interface Requirement {
  id: string;
  req_id?: string;
  user_id: string;
  project_name?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Define interface for validation data
interface ValidationData {
  id: string;
  requirement_id: string;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  readiness_score: number | null;
  validation_verdict: string | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useValidationProcess = (
  setValidationData: (data: ValidationData | null) => void,
  fetchValidations: () => Promise<void>
) => {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (requirement: Requirement) => {
    if (!requirement) {
      toast.error("Requirement data is missing");
      return;
    }

    // Safety check - Check if this is a mock record by checking the ID format
    const isMockData =
      requirement.id?.startsWith("REQ-") && !requirement.req_id;
    if (isMockData) {
      console.error(
        "%c[Validation] ⚠️ Cannot validate a mock requirement record!",
        "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
        requirement
      );
      toast.error(
        "Cannot validate mock requirements. Please use a real requirement from the database."
      );
      return;
    }

    // Log the requirement details for debugging
    console.log(
      "%c[Validation] Validating Requirement: ",
      "background: #40916c; color: white; padding: 2px 5px; border-radius: 3px;",
      {
        id: requirement.id,
        req_id: requirement.req_id,
        project_name: requirement.project_name,
        user_id: requirement.user_id,
        isMockData,
      }
    );

    // Fetch from database to ensure we have latest data
    try {
      const { data: freshData, error: fetchError } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", requirement.id)
        .single();

      if (fetchError || !freshData) {
        console.error(
          "%c[Validation] Failed to fetch fresh data:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          fetchError || "No data returned"
        );
        toast.error("Failed to fetch the latest requirement data");
        return;
      }

      console.log(
        "%c[Validation] Using fresh data from database:",
        "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
        freshData
      );

      // Use the fresh data from this point on - extract the necessary properties
      requirement = {
        id: freshData.id,
        req_id: freshData.req_id,
        user_id: freshData.user_id,
        project_name: freshData.project_name,
      };
    } catch (fetchError) {
      console.error(
        "%c[Validation] Error fetching fresh data:",
        "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
        fetchError
      );
      toast.error("Failed to fetch the latest requirement data");
      return;
    }

    // Clear any existing validation data to avoid showing wrong data
    setValidationData(null);
    setIsValidating(true);
    setError(null);

    try {
      toast.info("Starting AI validation process...", { duration: 2000 });
      console.log(
        "%c[Validation] Starting validation for requirement:",
        "background: #40916c; color: white; padding: 2px 5px; border-radius: 3px;",
        requirement
      );
      console.log(
        `%c[Validation] Requirement ID: ${requirement.id}, req_id: ${
          requirement.req_id || "none"
        }`,
        "background: #40916c; color: white; padding: 2px 5px; border-radius: 3px;"
      );

      // Use internal UUID for validation (not req_id) to ensure correct record linkage
      const idForValidation = requirement.id;
      console.log(
        "%c[Validation] Using ID for validation:",
        "background: #40916c; color: white; padding: 2px 5px; border-radius: 3px;",
        idForValidation
      );

      // Call the AI validator edge function
      console.log(
        "%c[API] Calling AI validator edge function with:",
        "background: #3b82f6; color: white; padding: 2px 5px; border-radius: 3px;",
        {
          requirementId: idForValidation,
        }
      );

      const { data, error } = await supabase.functions.invoke("ai-validator", {
        body: { requirementId: idForValidation },
      });

      if (error) {
        console.error(
          "%c[API] Validation error:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          error
        );
        toast.error(`Validation failed: ${error.message}`);
        throw error;
      }

      console.log(
        "%c[API] Validation API response:",
        "background: #3b82f6; color: white; padding: 2px 5px; border-radius: 3px;",
        data
      );

      if (!data.success) {
        throw new Error(data.message || "Validation process failed");
      }

      console.log(
        "%c[Validation] Validation completed, received data:",
        "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
        data
      );

      // Fetch the latest validation record
      console.log(
        "%c[DB] Fetching latest validation record:",
        "background: #8b5cf6; color: white; padding: 2px 5px; border-radius: 3px;",
        {
          requirement_id: requirement.id,
        }
      );

      const { data: latestData, error: fetchError } = await supabase
        .from("requirement_validation")
        .select("*")
        .eq("requirement_id", requirement.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error(
          "%c[DB] Failed to fetch latest validation:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          fetchError
        );
        throw new Error("Failed to retrieve validation result");
      }

      console.log(
        "%c[DB] Latest validation record:",
        "background: #8b5cf6; color: white; padding: 2px 5px; border-radius: 3px;",
        latestData
      );

      if (!latestData || latestData.length === 0) {
        console.error(
          "%c[DB] No validation record found after successful API call",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;"
        );
        throw new Error("Validation record not found in database");
      }

      // Verify the validation data is for the correct requirement
      const validationRecord = latestData[0] as ValidationData;
      if (validationRecord.requirement_id !== requirement.id) {
        console.error(
          "%c[DB] Validation record mismatch!",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          {
            validation_requirement_id: validationRecord.requirement_id,
            current_requirement_id: requirement.id,
          }
        );
        throw new Error("Validation record doesn't match current requirement");
      }

      // Update the validation record status to "Completed"
      console.log(
        "%c[DB] Updating validation record status to Completed:",
        "background: #8b5cf6; color: white; padding: 2px 5px; border-radius: 3px;",
        validationRecord.id
      );

      const { error: updateError } = await supabase
        .from("requirement_validation")
        .update({ status: "Completed" })
        .eq("id", validationRecord.id);

      if (updateError) {
        console.error(
          "%c[DB] Failed to update validation status:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          updateError
        );
        // Continue anyway as we can still show results
      }

      // Only update the requirement flow status after validation record is marked as completed
      if (requirement.id) {
        console.log(
          "%c[Validation] Updating requirement flow status...",
          "background: #40916c; color: white; padding: 2px 5px; border-radius: 3px;"
        );
        const success = await completeValidator(requirement.id);

        if (success) {
          console.log(
            "%c[Validation] Successfully marked validator stage as complete",
            "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;"
          );
          toast.success(
            "Validation complete! You can now move to the next stage."
          );
        } else {
          console.error(
            "%c[Validation] Failed to update requirement flow status",
            "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;"
          );
        }
      }

      // Wait a moment to ensure database has been updated
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fetch the updated validation record
      const { data: updatedData, error: refetchError } = await supabase
        .from("requirement_validation")
        .select("*")
        .eq("id", validationRecord.id)
        .single();

      if (refetchError) {
        console.error(
          "%c[DB] Failed to fetch updated validation:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          refetchError
        );
        // Use the original record but with updated status
        validationRecord.status = "Completed";
        setValidationData(validationRecord);
      } else {
        // Only update the validation data when we're sure we have the correct data
        console.log(
          "%c[Validation] Setting validation data from database:",
          "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
          updatedData
        );
        setValidationData(updatedData);
      }

      // Also update the validations list
      await fetchValidations();

      toast.success("Requirement validation complete!");
    } catch (error: unknown) {
      console.error(
        "%c[Validation] Error validating requirement:",
        "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
        error
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Validation failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      // Keep validation data as null when there's an error
      setValidationData(null);
    } finally {
      // Keep isValidating true until we either set valid data or handle the error
      setIsValidating(false);
    }
  };

  return { isValidating, error, handleValidate, setError };
};
