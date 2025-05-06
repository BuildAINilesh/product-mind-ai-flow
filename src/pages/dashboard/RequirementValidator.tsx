
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, AlertTriangle, Sparkles, BrainCircuit, EditIcon } from "lucide-react";
import { toast } from "sonner";
import { useValidation } from "@/hooks/useValidation";
import ValidationDashboardHeader from "@/components/validator/ValidationDashboardHeader";
import ValidationDashboardList from "@/components/validator/ValidationDashboardList";
import ValidationStats from "@/components/validator/ValidationStats";

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementId = searchParams.get("requirementId");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    validations,
    loading,
    requirement,
    requirementAnalysis,
    validationData,
    isRequirementLoading,
    isValidating,
    dataFetchAttempted,
    handleValidate,
  } = useValidation(requirementId);

  // If requirementId is provided, show the validation view for that requirement
  if (requirementId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate("/dashboard/requirements")}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Requirements
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="validator" 
              className="gap-1"
              onClick={handleValidate}
              disabled={isValidating}
            >
              <BrainCircuit className="h-4 w-4" />
              {isValidating ? "Validating..." : "Analyze"}
            </Button>
          </div>
        </div>

        {isRequirementLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
            <p className="ml-2">Loading requirement...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
            <div className="p-6 rounded-full bg-[#f0f2fe] mb-6">
              <BrainCircuit className="h-16 w-16 text-[#5057d9]" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Ready for Analysis</h1>
            <p className="text-muted-foreground text-lg mb-8">
              This requirement hasn't been analyzed yet. Click the "Analyze" button to generate the AI-powered analysis.
            </p>
            <Button 
              size="lg" 
              variant="validator" 
              className="gap-2 px-8" 
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-5 w-5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show validations dashboard when no requirementId is provided
  return (
    <div className="space-y-6">
      <ValidationDashboardHeader showBackButton={false} />
      
      {loading && !dataFetchAttempted ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <>
          <ValidationStats validations={validations} loading={loading} />
          
          <ValidationDashboardList 
            validations={validations}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </>
      )}
    </div>
  );
};

export default RequirementValidator;
