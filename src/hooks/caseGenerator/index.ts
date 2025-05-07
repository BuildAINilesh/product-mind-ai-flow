
import { useCaseGeneratorDashboard } from "./useCaseGeneratorDashboard";
import { useCaseGeneratorDetails } from "./useCaseGeneratorDetails";
import type {
  ForgeFlowItem,
  Requirement,
  UserStory,
  UseCase,
  TestCase,
  StatusData,
} from "./types";

// Main hook that combines dashboard and details functionality
export const useCaseGenerator = (requirementId: string | null) => {
  // Dashboard data (always load this data)
  const {
    caseGeneratorItems,
    loading,
    dataFetchAttempted: dashboardDataFetched,
  } = useCaseGeneratorDashboard();

  // Details data (conditionally load based on requirementId)
  const {
    requirement,
    userStories,
    useCases,
    testCases,
    isRequirementLoading,
    isGenerating,
    dataFetchAttempted: detailsDataFetched,
    handleGenerate,
    statusData,
  } = useCaseGeneratorDetails(requirementId);

  return {
    // Dashboard data
    caseGeneratorItems,
    loading,
    
    // Details data
    requirement,
    userStories,
    useCases,
    testCases,
    isRequirementLoading,
    isGenerating,
    
    // Combined data fetch status
    dataFetchAttempted: requirementId ? detailsDataFetched : dashboardDataFetched,
    
    // Actions
    handleGenerate,
    statusData,
  };
};

// Re-export types and other hooks for use elsewhere
export type {
  ForgeFlowItem,
  Requirement,
  UserStory,
  UseCase,
  TestCase,
  StatusData,
};

export { useCaseGeneratorDashboard, useCaseGeneratorDetails };
