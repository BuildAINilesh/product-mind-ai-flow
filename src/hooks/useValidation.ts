
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  validation_verdict: string | null;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

export function useValidation(requirementId: string | null) {
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [requirement, setRequirement] = useState<any>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<any>(null);
  const [validationData, setValidationData] = useState<ValidationItem | null>(
    null
  );
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always fetch validation list on mount
  useEffect(() => {
    fetchValidations();
  }, []);

  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    if (requirementId) {
      console.log("Fetching data for requirementId:", requirementId);
      fetchRequirement(requirementId);
    }
  }, [requirementId]);

  const fetchValidations = async () => {
    setLoading(true);
    try {
      console.log("Fetching all validations");
      const { data, error } = await supabase
        .from("requirement_validation")
        .select(
          `
          *,
          requirements (
            id,
            req_id,
            project_name,
            industry_type
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching validations:", error);
        toast.error("Failed to load validations");
        throw error;
      }

      console.log("Fetched validations:", data);
      if (data) {
        setValidations(data);
      }
      setDataFetchAttempted(true);
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Failed to load validations");
      setError("Failed to load validations");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirement = async (reqId: string) => {
    setIsRequirementLoading(true);
    setError(null);

    try {
      // Decode the reqId in case it was URL encoded
      const decodedReqId = decodeURIComponent(reqId);
      console.log("Fetching requirement with ID:", reqId);
      console.log("Decoded ID:", decodedReqId);

      // First try to find the requirement by req_id (REQ-XX-XX format)
      let { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("req_id", decodedReqId)
        .maybeSingle();

      // If not found by req_id, try by internal UUID (id)
      if (!data && !error) {
        console.log("Not found by req_id, trying internal UUID...");

        ({ data, error } = await supabase
          .from("requirements")
          .select("*")
          .eq("id", decodedReqId)
          .maybeSingle());
      }

      if (error) {
        console.error("Error fetching requirement:", error);
        toast.error("Failed to load requirement details");
        setError("Failed to load requirement details");
        setDataFetchAttempted(true);
        return;
      }

      if (!data) {
        console.error("Requirement not found with ID or req_id:", decodedReqId);
        console.log("Trying case-insensitive search...");

        // Try case-insensitive search as fallback
        const { data: altData, error: altError } = await supabase
          .from("requirements")
          .select("*")
          .ilike("req_id", decodedReqId)
          .maybeSingle();

        if (altError || !altData) {
          console.error("All search methods failed for ID:", decodedReqId);
          toast.error(`Requirement with ID ${decodedReqId} not found`);
          setError(`Requirement with ID ${decodedReqId} not found`);
          setDataFetchAttempted(true);
          return;
        }

        console.log(
          "Found requirement using case-insensitive search:",
          altData
        );
        setRequirement(altData);
        fetchRequirementAnalysis(altData.id);
        fetchExistingValidation(altData.id);
        setDataFetchAttempted(true);
        return;
      }

      console.log("Found requirement:", data);
      setRequirement(data);

      // Now that we have the requirement, fetch the analysis and validation
      fetchRequirementAnalysis(data.id);
      fetchExistingValidation(data.id);

      setDataFetchAttempted(true);
    } catch (error: any) {
      console.error("Error fetching requirement:", error);
      toast.error("Failed to load requirement details");
      setError(error.message || "Failed to load requirement details");
      setDataFetchAttempted(true);
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const fetchRequirementAnalysis = async (requirementInternalId: string) => {
    try {
      console.log(
        "Fetching analysis for requirement ID:",
        requirementInternalId
      );

      const { data, error } = await supabase
        .from("requirement_analysis")
        .select("*")
        .eq("requirement_id", requirementInternalId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching analysis:", error);
        return;
      }

      if (data) {
        console.log("Found requirement analysis:", data);
        setRequirementAnalysis(data);
      } else {
        console.log("No requirement analysis found");
      }
    } catch (error) {
      console.error("Error fetching requirement analysis:", error);
    }
  };

  const fetchExistingValidation = async (requirementInternalId: string) => {
    try {
      console.log(
        "Checking for existing validation for requirement ID:",
        requirementInternalId
      );

      // Fetch the validation using the requirement UUID
      const { data, error } = await supabase
        .from("requirement_validation")
        .select("*")
        .eq("requirement_id", requirementInternalId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching validation:", error);
        return;
      }

      if (data) {
        console.log("Found existing validation:", data);
        setValidationData(data);
      } else {
        console.log("No validation record found");
        setValidationData(null);
      }
    } catch (error) {
      console.error("Error fetching existing validation:", error);
    }
  };

  const handleValidate = async () => {
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
    } catch (error: any) {
      console.error("Error validating requirement:", error);
      toast.error(error.message || "Validation failed. Please try again.");
      setError(error.message || "Validation failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validations,
    loading,
    requirement,
    requirementAnalysis,
    validationData,
    isRequirementLoading,
    isValidating,
    dataFetchAttempted,
    error,
    handleValidate,
    fetchValidations,
  };
}
