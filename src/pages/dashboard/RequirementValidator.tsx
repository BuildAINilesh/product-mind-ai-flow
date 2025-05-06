
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, AlertTriangle, Sparkles, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { useValidation } from "@/hooks/useValidation";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  const handleBackToList = () => {
    navigate("/dashboard/validator");
  };

  const handleNavigateToRequirements = () => {
    navigate("/dashboard/requirements");
  };

  // ==========================================
  // Component Renders
  // ==========================================

  // Placeholder component for ValidationInProgress
  const ValidationInProgressPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          AI Validation in Progress
        </CardTitle>
        <CardDescription>
          Please wait while our AI analyzes the requirement and market data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-10">
        <div className="animate-pulse flex flex-col items-center max-w-md">
          <div className="p-3 rounded-full bg-[#9b87f5]/10 mb-6">
            <Sparkles className="h-12 w-12 text-[#9b87f5]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">
            Processing Your Requirement
          </h3>
          <p className="text-center mb-6 text-muted-foreground">
            Analyzing requirement details...
          </p>
          <div className="w-full mb-2">
            <Progress value={60} className="h-2 w-full" />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This may take up to 1-2 minutes to complete
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder component for ValidationIntro
  const ValidationIntroPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-[#9b87f5]" />
          AI Validation
        </CardTitle>
        <CardDescription>
          Validate this requirement against market data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">No validation available</h3>
              <p className="text-sm text-muted-foreground">
                Click the "Start Validation" button to begin the AI-powered
                validation process. This will evaluate the requirement against
                market data to determine market readiness, identify strengths,
                risks, and provide recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10"
            onClick={handleValidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Start Validation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder component for MissingAnalysis
  const MissingAnalysisPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          Ready for Analysis
        </CardTitle>
        <CardDescription>
          This requirement needs to be analyzed first
        </CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-[#9b87f5]/10 mb-6">
          <BrainCircuit className="h-12 w-12 text-[#9b87f5]" />
        </div>
        <h3 className="text-xl font-medium mb-3">Analysis Required</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          This requirement hasn't been analyzed yet. Before validating this
          requirement, you need to analyze it first. Click the "Analyze" button
          to generate the AI-powered analysis.
        </p>
        <Button
          variant="default"
          className="bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
          onClick={() =>
            navigate(`/dashboard/requirements?id=${requirementId}`)
          }
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          Analyze Requirement
        </Button>
      </CardContent>
    </Card>
  );

  // Placeholder for RequirementCard
  const RequirementCardPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Requirement Details</CardTitle>
        <CardDescription>
          {isRequirementLoading ? "Loading..." : requirement?.project_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>ID:</strong> {requirement?.req_id}
          </div>
          <div>
            <strong>Industry:</strong> {requirement?.industry_type}
          </div>
          <div>
            <strong>Status:</strong> {requirement?.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder for ValidationReport
  const ValidationReportPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#9b87f5]" />
          Validation Report
        </CardTitle>
        <CardDescription>
          AI validation results for this requirement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationData ? (
          <div className="space-y-4">
            <div>
              <strong>Score:</strong> {validationData.readiness_score || "N/A"}
            </div>
            <div>
              <strong>Verdict:</strong>{" "}
              {validationData.validation_verdict || "N/A"}
            </div>
            <div>
              <strong>Summary:</strong>{" "}
              {validationData.validation_summary || "No summary available"}
            </div>
            {validationData.strengths &&
              validationData.strengths.length > 0 && (
                <div>
                  <strong>Strengths:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {validationData.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            {validationData.risks && validationData.risks.length > 0 && (
              <div>
                <strong>Risks:</strong>
                <ul className="list-disc pl-5 mt-2">
                  {validationData.risks.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationData.recommendations &&
              validationData.recommendations.length > 0 && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {validationData.recommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No validation data available
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If requirementId is provided, show the validation form
  if (requirementId) {
    return (
      <div className="space-y-6">
        <ValidationDashboardHeader 
          projectName={requirement?.project_name}
          requirementId={requirementId}
        />

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column - Requirement Details */}
          <div className="md:col-span-5">
            <RequirementCardPlaceholder />
          </div>

          {/* Right Column - Analysis & Validation */}
          <div className="md:col-span-7">
            {isValidating ? (
              <ValidationInProgressPlaceholder />
            ) : validationData ? (
              <ValidationReportPlaceholder />
            ) : requirementAnalysis ? (
              <div className="space-y-6">
                {/* Analysis view */}
                <RequirementAnalysisView
                  project={requirement}
                  analysis={requirementAnalysis}
                  loading={isRequirementLoading}
                  onRefresh={() => {
                    /* Refresh implementation */
                    toast.success("Analysis refreshed");
                  }}
                />

                {/* Validation intro card */}
                <ValidationIntroPlaceholder />
              </div>
            ) : (
              <MissingAnalysisPlaceholder />
            )}
          </div>
        </div>
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
