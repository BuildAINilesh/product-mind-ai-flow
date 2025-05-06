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
  const [validationData, setValidationData] = useState<ValidationItem | null>(null);
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  // Fetch validation list when component loads (no requirementId is provided)
  useEffect(() => {
    if (!requirementId) {
      fetchValidations();
    }
  }, [requirementId]);

  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    if (requirementId) {
      fetchRequirement();
      fetchRequirementAnalysis();
      // Check if validation already exists for this requirement
      fetchExistingValidation(requirementId);
    }
  }, [requirementId]);

  const fetchValidations = async () => {
    setLoading(true);
    try {
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

      if (data) {
        setValidations(data);
      }
      setDataFetchAttempted(true);
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Failed to load validations");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirement = async () => {
    if (!requirementId) return;

    setIsRequirementLoading(true);
    try {
      // Query the requirements table for the specified requirement
      const { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("req_id", requirementId)
        .single();

      if (error) {
        console.error("Error fetching requirement:", error);
        toast.error("Failed to load requirement details");
        throw error;
      }

      if (data) {
        setRequirement(data);
        console.log("Loaded requirement:", data);
      }
      setDataFetchAttempted(true);
    } catch (error) {
      console.error("Error fetching requirement:", error);
      toast.error("Failed to load requirement details");
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const fetchRequirementAnalysis = async () => {
    if (!requirementId) return;

    try {
      // Query the requirement_analysis table for the specified requirement
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id")
        .eq("req_id", requirementId)
        .single();

      if (reqError) {
        console.error("Error fetching requirement ID:", reqError);
        return;
      }

      if (reqData) {
        const { data, error } = await supabase
          .from("requirement_analysis")
          .select("*")
          .eq("requirement_id", reqData.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching analysis:", error);
          return;
        }

        if (data) {
          setRequirementAnalysis(data);
          console.log("Loaded requirement analysis:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching requirement analysis:", error);
    }
  };

  const fetchExistingValidation = async (reqId: string) => {
    try {
      // First get the requirement ID (UUID) from the req_id
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id")
        .eq("req_id", reqId)
        .single();

      if (reqError) {
        console.error("Error fetching requirement ID:", reqError);
        return;
      }

      if (reqData) {
        // Now fetch the validation using the requirement UUID
        const { data, error } = await supabase
          .from("requirement_validation")
          .select("*")
          .eq("requirement_id", reqData.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching validation:", error);
          return;
        }

        if (data) {
          setValidationData(data);
          console.log("Found existing validation:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching existing validation:", error);
    }
  };

  const handleValidate = async () => {
    if (!requirementId) {
      toast.error("Requirement ID is missing");
      return;
    }

    setIsValidating(true);

    try {
      toast.info("Starting AI validation process...", { duration: 2000 });

      // Call the AI validator edge function
      const { data, error } = await supabase.functions.invoke("ai-validator", {
        body: { requirementId },
      });

      if (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.message || "Validation process failed");
      }

      // Update the local state with the validation results
      if (data.record && data.record[0]) {
        // Ensure the status is set to "Completed"
        const validationRecord = {
          ...data.record[0],
          status: "Completed"
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
          status: "Completed"
        };
        setValidationData(validationRecord);
      }
      
      fetchValidations(); // Refresh the validations list
      toast.success("Requirement validation complete!");
    } catch (error: any) {
      console.error("Error validating requirement:", error);
      toast.error(error.message || "Validation failed. Please try again.");
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
    handleValidate,
    fetchValidations,
  };
}
