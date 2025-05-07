
import { useSearchParams } from "react-router-dom";
import { useValidation } from "@/hooks/useValidation";
import ValidationDashboard from "@/components/validator/ValidationDashboard";
import ValidationDetails from "@/components/validator/ValidationDetails";

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");

  const {
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
  } = useValidation(requirementId);

  // If requirementId is provided, show the validation view for that requirement
  if (requirementId) {
    return (
      <ValidationDetails 
        requirementId={requirementId}
        requirement={requirement}
        validationData={validationData}
        isRequirementLoading={isRequirementLoading}
        isValidating={isValidating}
        error={error}
        handleValidate={handleValidate}
      />
    );
  }

  // Show validations dashboard when no requirementId is provided
  return (
    <ValidationDashboard 
      validations={validations} 
      loading={loading}
      dataFetchAttempted={dataFetchAttempted}
    />
  );
};

export default RequirementValidator;
