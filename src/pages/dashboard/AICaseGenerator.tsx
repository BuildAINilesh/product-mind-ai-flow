import { useSearchParams } from "react-router-dom";
import { useCaseGenerator } from "@/hooks/useCaseGenerator";
import AICaseGeneratorDashboard from "@/components/ai-cases/AICaseGeneratorDashboard";
import AICaseGeneratorDetails from "@/components/ai-cases/AICaseGeneratorDetails";

const AICaseGenerator = () => {
  console.log("AICaseGenerator component rendering");

  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");

  console.log("requirementId:", requirementId);

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
  } = useCaseGenerator(requirementId);

  console.log("AICaseGenerator hook data:", {
    itemsCount: caseGeneratorItems.length,
    loading,
    requirement,
    userStoriesCount: userStories.length,
    useCasesCount: useCases.length,
    testCasesCount: testCases.length,
    isRequirementLoading,
    isGenerating,
    dataFetchAttempted,
  });

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
