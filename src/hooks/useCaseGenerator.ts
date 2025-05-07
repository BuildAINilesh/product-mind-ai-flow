
import { useState, useEffect, useCallback } from "react";
import { getRequirement } from "@/services/requirementService";
import {
  getCaseGeneratorItems,
  getCaseGeneratorData,
  generateCaseGeneratorElements,
} from "@/services/caseGeneratorService";

export interface ForgeFlowItem {
  id: string;
  requirementId: string;
  projectName: string;
  industry: string;
  created: string;
  userStoriesStatus: string;
  useCasesStatus: string;
  testCasesStatus: string;
  reqId: string; // Add the reqId field to match the format REQ-25-01
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

// Add a type definition for Requirement
interface Requirement {
  id: string;
  projectName: string;
  industry: string;
  created: string;
  description: string;
  req_id?: string; // Add the req_id field
  [key: string]: any; // Allow additional properties
}

export const useCaseGenerator = (requirementId: string | null) => {
  // States for dashboard view
  const [caseGeneratorItems, setCaseGeneratorItems] = useState<ForgeFlowItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState<boolean>(false);

  // States for detail view
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRequirementLoading, setIsRequirementLoading] =
    useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Fetch case generator items for dashboard view
  useEffect(() => {
    const fetchCaseGeneratorItems = async () => {
      if (requirementId) return;

      setLoading(true);
      try {
        const data = await getCaseGeneratorItems();
        setCaseGeneratorItems(data);
      } catch (error) {
        console.error("Error fetching case generator items:", error);
      } finally {
        setLoading(false);
        setDataFetchAttempted(true);
      }
    };

    fetchCaseGeneratorItems();
  }, [requirementId]);

  // Fetch requirement and case generator data for detail view
  useEffect(() => {
    const fetchRequirementAndCaseGeneratorData = async () => {
      if (!requirementId) return;

      setIsRequirementLoading(true);
      try {
        // Fetch requirement details
        const reqData = await getRequirement(requirementId);
        setRequirement(reqData);

        // Fetch case generator data for this requirement
        const caseGeneratorData = await getCaseGeneratorData(requirementId);

        if (caseGeneratorData) {
          setUserStories(caseGeneratorData.userStories || []);
          setUseCases(caseGeneratorData.useCases || []);
          setTestCases(caseGeneratorData.testCases || []);
        }
      } catch (error) {
        console.error(
          "Error fetching requirement or case generator data:",
          error
        );
      } finally {
        setIsRequirementLoading(false);
        setDataFetchAttempted(true);
      }
    };

    fetchRequirementAndCaseGeneratorData();
  }, [requirementId]);

  // Function to generate/regenerate case generator elements
  const handleGenerate = useCallback(async (
    type?: "userStories" | "useCases" | "testCases"
  ) => {
    if (!requirementId) return;

    setIsGenerating(true);
    try {
      // Call the API to generate the requested elements
      const generatedData = await generateCaseGeneratorElements(
        requirementId,
        type
      );

      // After successful generation, refresh the data
      const caseGeneratorData = await getCaseGeneratorData(requirementId);

      if (caseGeneratorData) {
        setUserStories(caseGeneratorData.userStories || []);
        setUseCases(caseGeneratorData.useCases || []);
        setTestCases(caseGeneratorData.testCases || []);
      }
    } catch (error) {
      console.error("Error generating case generator elements:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [requirementId]);

  return {
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
  };
};
