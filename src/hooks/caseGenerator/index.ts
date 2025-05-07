
import { useCaseGeneratorDashboard } from "./useCaseGeneratorDashboard";
import { useCaseGeneratorDetails } from "./useCaseGeneratorDetails";

export const useCaseGenerator = (requirementId: string | null) => {
  // If there's no requirementId, we're in the dashboard view
  if (!requirementId) {
    const dashboardData = useCaseGeneratorDashboard();
    return {
      ...dashboardData,
      // Include null/empty values for the detail fields to maintain the same interface
      requirement: null,
      userStories: [],
      useCases: [],
      testCases: [],
      isRequirementLoading: false,
      isGenerating: false,
      handleGenerate: () => Promise.resolve(),
      statusData: {
        userStoriesStatus: "Draft",
        useCasesStatus: "Draft",
        testCasesStatus: "Draft",
      }
    };
  }
  
  // If there is a requirementId, we're in the details view
  const detailsData = useCaseGeneratorDetails(requirementId);
  return {
    // Include empty values for the dashboard fields to maintain the same interface
    caseGeneratorItems: [],
    loading: detailsData.isRequirementLoading,
    ...detailsData
  };
};

// Export types
export * from "./types";
