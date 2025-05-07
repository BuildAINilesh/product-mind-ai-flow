import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, EditIcon, BrainCircuit } from "lucide-react";
import ValidationResultSummary from "./ValidationResultSummary";
import ValidationRisksRecommendations from "./ValidationRisksRecommendations";
import ValidationEmptyState from "./ValidationEmptyState";

interface ValidationDetailsProps {
  requirementId: string | null;
  requirement: any;
  validationData: any;
  isRequirementLoading: boolean;
  isValidating: boolean;
  handleValidate: () => void;
}

const ValidationDetails = ({
  requirementId,
  requirement,
  validationData,
  isRequirementLoading,
  isValidating,
  handleValidate,
}: ValidationDetailsProps) => {
  const navigate = useNavigate();

  if (!requirementId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          onClick={() => navigate("/dashboard/market-sense")}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Market Sense
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
            {isValidating
              ? "Validating..."
              : validationData
              ? "Create AI Case Generator"
              : "Analyze"}
          </Button>
        </div>
      </div>

      {isRequirementLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading requirement...</p>
        </div>
      ) : validationData && validationData.status === "Completed" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Summary and scores */}
          <div className="md:col-span-2">
            <ValidationResultSummary
              validationData={validationData}
              requirement={requirement}
            />
          </div>

          {/* Right column - Risks and Recommendations */}
          <div>
            <ValidationRisksRecommendations
              validationData={validationData}
              requirement={requirement}
            />
          </div>
        </div>
      ) : (
        <ValidationEmptyState
          handleValidate={handleValidate}
          isValidating={isValidating}
        />
      )}
    </div>
  );
};

export default ValidationDetails;
