
import { useState, useEffect, useCallback } from "react";
import { getRequirement } from "@/services/requirementService";
import {
  getCaseGeneratorItems,
  getCaseGeneratorData,
  generateCaseGeneratorElements,
} from "@/services/caseGeneratorService";
import { supabase } from "@/integrations/supabase/client";

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
export interface Requirement {
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
  const [statusData, setStatusData] = useState<{
    userStoriesStatus: string;
    useCasesStatus: string;
    testCasesStatus: string;
  }>({
    userStoriesStatus: "Draft",
    useCasesStatus: "Draft",
    testCasesStatus: "Draft",
  });

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
        
        if (reqData) {
          console.log("Successfully found requirement:", reqData);
          // Make sure to transform the data to match our Requirement interface
          const formattedRequirement: Requirement = {
            id: reqData.id,
            projectName: reqData.projectName || reqData.project_name || "Unknown Project",
            industry: reqData.industry || reqData.industry_type || "Unknown Industry",
            created: reqData.created || 
              (reqData.created_at ? new Date(reqData.created_at).toLocaleDateString() : "Unknown Date"),
            description: reqData.description || "No description available",
            req_id: reqData.req_id
          };
          setRequirement(formattedRequirement);
        } else {
          console.log("Could not find requirement directly, trying to find via case_generator table");
          
          // If we couldn't find the requirement directly, try to find information from case_generator table
          if (supabase) {
            const { data: caseGenData, error: caseGenError } = await supabase
              .from("case_generator")
              .select(`
                *,
                requirements:requirement_id (
                  id, 
                  project_name,
                  industry_type, 
                  created_at,
                  description,
                  req_id
                )
              `)
              .eq("requirement_id", requirementId)
              .maybeSingle();
              
            if (caseGenError) {
              console.error("Error fetching from case_generator:", caseGenError);
            } else if (caseGenData && caseGenData.requirements) {
              console.log("Found requirement via case_generator join:", caseGenData.requirements);
              
              // Safely access properties with type checking
              const requirementsData = caseGenData.requirements as {
                id?: string;
                project_name?: string;
                industry_type?: string;
                created_at?: string;
                description?: string;
                req_id?: string;
              };
              
              // Create a standardized requirement object from the join result
              const formattedRequirement: Requirement = {
                id: requirementsData.id || requirementId,
                projectName: requirementsData.project_name || "Unknown Project",
                industry: requirementsData.industry_type || "Unknown Industry",
                created: requirementsData.created_at 
                  ? new Date(requirementsData.created_at).toLocaleDateString() 
                  : "Unknown Date",
                description: requirementsData.description || "",
                req_id: requirementsData.req_id
              };
              
              setRequirement(formattedRequirement);
            }
          }
        }

        // Fetch case generator data for this requirement
        const caseGeneratorData = await getCaseGeneratorData(requirementId);

        if (caseGeneratorData) {
          setUserStories(caseGeneratorData.userStories || []);
          setUseCases(caseGeneratorData.useCases || []);
          setTestCases(caseGeneratorData.testCases || []);
          
          // Set status data
          if (caseGeneratorData.statusData) {
            setStatusData(caseGeneratorData.statusData);
          }
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
        
        // Update status data
        if (caseGeneratorData.statusData) {
          setStatusData(caseGeneratorData.statusData);
        }
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
    statusData,
  };
};
