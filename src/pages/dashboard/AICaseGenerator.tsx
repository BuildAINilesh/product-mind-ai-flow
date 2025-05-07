
import { useSearchParams } from "react-router-dom";
import { useCaseGenerator } from "@/hooks/caseGenerator";
import AICaseGeneratorDashboard from "@/components/ai-cases/AICaseGeneratorDashboard";
import AICaseGeneratorDetails from "@/components/ai-cases/AICaseGeneratorDetails";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { NotFoundDisplay } from "@/components/market-sense/NotFoundDisplay";
import { toast } from "sonner";

const AICaseGenerator = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");
  const [error, setError] = useState<string | null>(null);
  // Add a state to track whether auto-generation should happen
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState<boolean>(false);

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

  // Auto-generation should only happen when explicitly triggered, not on navigation
  useEffect(() => {
    const autoGenerateOnNav = async () => {
      if (!shouldAutoGenerate) return;
      
      if (requirementId && dataFetchAttempted && !isRequirementLoading && 
          requirement && userStories.length === 0 && useCases.length === 0 && testCases.length === 0) {
        console.log("Auto-generating case data for requirement with auto-generate flag");
        handleGenerate();
        // Reset the flag after triggering generation
        setShouldAutoGenerate(false);
      }
    };
    
    autoGenerateOnNav();
  }, [requirementId, dataFetchAttempted, isRequirementLoading, requirement, userStories.length, useCases.length, testCases.length, handleGenerate, shouldAutoGenerate]);

  // If requirementId is provided, but we've tried to fetch and got an error or no data found
  if (requirementId && dataFetchAttempted && !isRequirementLoading && !requirement) {
    console.log("Requirement not found, showing NotFoundDisplay");
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
        // Pass down the function to enable auto-generation
        triggerAutoGenerate={() => setShouldAutoGenerate(true)}
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
