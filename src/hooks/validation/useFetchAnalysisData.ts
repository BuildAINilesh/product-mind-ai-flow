import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define proper types
interface RequirementAnalysis {
  id: string;
  requirement_id: string;
  project_overview: string | null;
  problem_statement: string | null;
  proposed_solution: string | null;
  key_features: string | null;
  [key: string]: any;
}

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
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export const useFetchAnalysisData = () => {
  const [requirementAnalysis, setRequirementAnalysis] =
    useState<RequirementAnalysis | null>(null);
  const [validationData, setValidationData] = useState<ValidationData | null>(
    null
  );

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
        "[DEBUG] Fetching validation for requirement ID:",
        requirementInternalId
      );

      // Get the current user to ensure we only show their data
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting current user:", userError);
        return;
      }

      console.log("[DEBUG] Current user ID:", user.id);

      // First get the requirement to double-check ownership
      const { data: requirement, error: reqError } = await supabase
        .from("requirements")
        .select("id, req_id, user_id")
        .eq("id", requirementInternalId)
        .maybeSingle();

      if (reqError) {
        console.error("Error verifying requirement ownership:", reqError);
        return;
      }

      // Verify this requirement belongs to the current user
      if (!requirement) {
        console.error("Requirement not found:", requirementInternalId);
        return;
      }

      if (requirement.user_id !== user.id) {
        console.error(`Requirement does not belong to current user. 
          Requirement user_id: ${requirement.user_id}, Current user: ${user.id}`);
        return;
      }

      console.log(
        `[DEBUG] Verified requirement ownership. Requirement: ${requirementInternalId}, req_id: ${requirement.req_id}`
      );

      // Fetch the validation using the requirement UUID
      // Order by created_at to get the most recent one first
      const { data, error } = await supabase
        .from("requirement_validation")
        .select("*")
        .eq("requirement_id", requirementInternalId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching validation:", error);
        return;
      }

      if (data && data.length > 0) {
        console.log("[DEBUG] Found existing validation:", data[0]);
        console.log(
          `[DEBUG] Validation ID: ${data[0].id}, RequirementID: ${data[0].requirement_id}`
        );
        console.log(
          `[DEBUG] Summary excerpt: ${
            data[0].validation_summary?.substring(0, 50) || "not set"
          }...`
        );
        setValidationData(data[0]);
      } else {
        console.log(
          "[DEBUG] No validation record found for requirement:",
          requirementInternalId
        );
        setValidationData(null);
      }
    } catch (error) {
      console.error("Error fetching existing validation:", error);
    }
  };

  return {
    requirementAnalysis,
    validationData,
    fetchRequirementAnalysis,
    fetchExistingValidation,
    setValidationData,
  };
};
