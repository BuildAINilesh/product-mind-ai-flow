
import { useSearchParams } from "react-router-dom";
import { useCaseGenerator } from "@/hooks/useCaseGenerator";
import AICaseGeneratorDashboard from "@/components/ai-cases/AICaseGeneratorDashboard";
import AICaseGeneratorDetails from "@/components/ai-cases/AICaseGeneratorDetails";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { NotFoundDisplay } from "@/components/market-sense/NotFoundDisplay";

const AICaseGenerator = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");
  const [error, setError] = useState<string | null>(null);

  console.log("AICaseGenerator - received requirementId:", requirementId);

  const {
    caseGeneratorItems,
    loading,
    requirement,
    userStories,
    useCases,
    testCases,
    isRequirementLoading,
    isGenerating,
    dataFetchAttempted,
    handleGenerate,
    statusData,
  } = useCaseGenerator(requirementId);

  // When navigating from validator page, auto-generate if no data exists yet
  useEffect(() => {
    const autoGenerateOnNav = async () => {
      if (requirementId && dataFetchAttempted && !isRequirementLoading && 
          requirement && userStories.length === 0 && useCases.length === 0 && testCases.length === 0) {
        console.log("Auto-generating case data for newly navigated requirement");
        handleGenerate();
      }
    };
    
    autoGenerateOnNav();
  }, [requirementId, dataFetchAttempted, isRequirementLoading, requirement, userStories.length, useCases.length, testCases.length, handleGenerate]);

  // If requirementId is provided, but we've tried to fetch and got an error or no data found
  if (requirementId && dataFetchAttempted && !isRequirementLoading && !requirement) {
    return (
      <NotFoundDisplay requirementId={requirementId} />
    );
  }

  // If requirementId is provided, show the details view for that requirement
  if (requirementId) {
    console.log("Rendering AICaseGeneratorDetails");
    return (
      <AICaseGeneratorDetails
        requirementId={requirementId}
        requirement={requirement}
        userStories={userStories}
        useCases={useCases}
        testCases={testCases}
        isRequirementLoading={isRequirementLoading}
        isGenerating={isGenerating}
        statusData={statusData}
        handleGenerate={handleGenerate}
      />
    );
  }

  // Show dashboard when no requirementId is provided
  console.log("Rendering AICaseGeneratorDashboard");
  return (
    <AICaseGeneratorDashboard
      caseGeneratorItems={caseGeneratorItems}
      loading={loading}
      dataFetchAttempted={dataFetchAttempted}
    />
  );
};

export default AICaseGenerator;
