
import { useSearchParams } from "react-router-dom";
import { useValidation } from "@/hooks/useValidation";
import ValidationDashboard from "@/components/validator/ValidationDashboard";
import ValidationDetails from "@/components/validator/ValidationDetails";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RequirementValidator = () => {
  const navigate = useNavigate();
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

  // If requirementId is provided, but we've tried to fetch and got an error or no data found
  if (requirementId && dataFetchAttempted && !isRequirementLoading && (error || !requirement)) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate("/dashboard/market-sense")}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            Back to Market Sense
          </Button>
        </div>
        
        <Alert variant="destructive" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || `Requirement with ID ${requirementId} not found`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If requirementId is provided and we have data, show the validation view for that requirement
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
