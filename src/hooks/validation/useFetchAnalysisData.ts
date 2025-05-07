
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFetchAnalysisData = () => {
  const [requirementAnalysis, setRequirementAnalysis] = useState<any>(null);
  const [validationData, setValidationData] = useState<any>(null);

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

  return { 
    requirementAnalysis, 
    validationData, 
    fetchRequirementAnalysis, 
    fetchExistingValidation,
    setValidationData
  };
};
