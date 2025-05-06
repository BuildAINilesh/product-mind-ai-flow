import { useState, useEffect } from "react";
import { getRequirement } from "@/services/requirementService";
import {
  getForgeFlowItems,
  getForgeFlowData,
} from "@/services/forgeFlowService";

export interface ForgeFlowItem {
  id: string;
  requirementId: string;
  projectName: string;
  industry: string;
  created: string;
  userStoriesStatus: string;
  useCasesStatus: string;
  testCasesStatus: string;
}

export interface UserStory {
  id: string;
  content: string;
  status: string;
}

export interface UseCase {
  id: string;
  content: string;
  status: string;
}

export interface TestCase {
  id: string;
  content: string;
  status: string;
}

export const useForgeFlow = (requirementId: string | null) => {
  // States for dashboard view
  const [forgeflowItems, setForgeFlowItems] = useState<ForgeFlowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState<boolean>(false);

  // States for detail view
  const [requirement, setRequirement] = useState<any>(null);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRequirementLoading, setIsRequirementLoading] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch forgeflow items for dashboard view
  useEffect(() => {
    const fetchForgeFlowItems = async () => {
      if (requirementId) return;

      setLoading(true);
      try {
        const data = await getForgeFlowItems();
        setForgeFlowItems(data);
      } catch (error) {
        console.error("Error fetching forgeflow items:", error);
      } finally {
        setLoading(false);
        setDataFetchAttempted(true);
      }
    };

    fetchForgeFlowItems();
  }, [requirementId]);

  // Fetch requirement and forgeflow data for detail view
  useEffect(() => {
    const fetchRequirementAndForgeFlowData = async () => {
      if (!requirementId) return;

      setIsRequirementLoading(true);
      try {
        // Fetch requirement details
        const reqData = await getRequirement(requirementId);
        setRequirement(reqData);

        // Fetch forgeflow data for this requirement
        const forgeFlowData = await getForgeFlowData(requirementId);

        if (forgeFlowData) {
          setUserStories(forgeFlowData.userStories || []);
          setUseCases(forgeFlowData.useCases || []);
          setTestCases(forgeFlowData.testCases || []);
        }
      } catch (error) {
        console.error("Error fetching requirement or forgeflow data:", error);
      } finally {
        setIsRequirementLoading(false);
      }
    };

    fetchRequirementAndForgeFlowData();
  }, [requirementId]);

  // Function to generate/regenerate forgeflow elements
  const handleGenerate = async (
    type?: "userStories" | "useCases" | "testCases"
  ) => {
    if (!requirementId) return;

    setIsGenerating(true);
    try {
      // Here you would call your API to generate the requested elements
      // For example, calling an endpoint like /api/forgeflow/generate
      // with the requirementId and type parameters

      // Example API call (replace with actual implementation):
      // const generatedData = await generateForgeFlowElements(requirementId, type);

      // After successful generation, refresh the data
      const forgeFlowData = await getForgeFlowData(requirementId);

      if (forgeFlowData) {
        setUserStories(forgeFlowData.userStories || []);
        setUseCases(forgeFlowData.useCases || []);
        setTestCases(forgeFlowData.testCases || []);
      }
    } catch (error) {
      console.error("Error generating forgeflow elements:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
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
  };
};
