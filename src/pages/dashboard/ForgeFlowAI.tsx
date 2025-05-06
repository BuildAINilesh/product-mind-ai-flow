import { useSearchParams } from "react-router-dom";
import { useForgeFlow } from "@/hooks/useForgeFlow";
import ForgeFlowDashboard from "@/components/forgeflow/ForgeFlowDashboard";
import ForgeFlowDetails from "@/components/forgeflow/ForgeFlowDetails";

const ForgeFlowAI = () => {
  console.log("ForgeFlowAI component rendering");

  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");

  console.log("requirementId:", requirementId);

  const {
    forgeflowItems,
    loading,
    requirement,
    userStories,
    useCases,
    testCases,
    isRequirementLoading,
    isGenerating,
    dataFetchAttempted,
    handleGenerate,
  } = useForgeFlow(requirementId);

  console.log("ForgeFlowAI hook data:", {
    itemsCount: forgeflowItems.length,
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
    console.log("Rendering ForgeFlowDetails");
    return (
      <ForgeFlowDetails
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

  // Show forgeflow dashboard when no requirementId is provided
  console.log("Rendering ForgeFlowDashboard");
  return (
    <ForgeFlowDashboard
      forgeflowItems={forgeflowItems}
      loading={loading}
      dataFetchAttempted={dataFetchAttempted}
    />
  );
};

export default ForgeFlowAI;
