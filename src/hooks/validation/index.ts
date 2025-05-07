
import { useState, useEffect } from "react";
import { useFetchValidations } from "./useFetchValidations";
import { useFetchRequirement } from "./useFetchRequirement";
import { useFetchAnalysisData } from "./useFetchAnalysisData";
import { useValidationProcess } from "./useValidationProcess";

export function useValidation(requirementId: string | null) {
  const { 
    validations, 
    loading, 
    error: validationsError, 
    dataFetchAttempted: validationsAttempted, 
    fetchValidations, 
    setError: setValidationsError 
  } = useFetchValidations();

  const {
    requirement,
    isRequirementLoading,
    error: requirementError,
    dataFetchAttempted: requirementAttempted,
    fetchRequirement,
    setError: setRequirementError
  } = useFetchRequirement();

  const {
    requirementAnalysis,
    validationData,
    fetchRequirementAnalysis,
    fetchExistingValidation,
    setValidationData
  } = useFetchAnalysisData();

  const {
    isValidating,
    error: validationProcessError,
    handleValidate: processValidation,
    setError: setValidationProcessError
  } = useValidationProcess(setValidationData, fetchValidations);

  // Combine errors from different sources
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Combine errors from all sources
    const combinedError = validationsError || requirementError || validationProcessError;
    setError(combinedError);
  }, [validationsError, requirementError, validationProcessError]);

  // Determine if data fetch has been attempted
  const dataFetchAttempted = validationsAttempted || requirementAttempted;

  // Always fetch validation list on mount
  useEffect(() => {
    fetchValidations();
  }, []);

  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    if (requirementId) {
      console.log("Fetching data for requirementId:", requirementId);
      (async () => {
        const fetchedRequirement = await fetchRequirement(requirementId);
        if (fetchedRequirement) {
          // Now that we have the requirement, fetch the analysis and validation
          fetchRequirementAnalysis(fetchedRequirement.id);
          fetchExistingValidation(fetchedRequirement.id);
        }
      })();
    }
  }, [requirementId]);

  const handleValidate = async () => {
    await processValidation(requirement);
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

// Re-export types for convenience
export * from "./types";
