
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
  reqId: string;
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
  req_id?: string;
  [key: string]: any;
}

// Type for the database requirement object which might have different field names
interface DatabaseRequirement {
  id: string;
  project_name?: string;
  projectName?: string;
  industry_type?: string;
  industry?: string;
  created_at?: string;
  created?: string;
  description?: string;
  document_summary?: string;
  req_id?: string;
  [key: string]: any;
}

// Helper function to format a database requirement to our Requirement interface
const formatRequirement = (data: DatabaseRequirement): Requirement => {
  return {
    id: data.id,
    projectName: data.projectName || data.project_name || "Unknown Project",
    industry: data.industry || data.industry_type || "Unknown Industry",
    created: data.created || 
      (data.created_at ? new Date(data.created_at).toLocaleDateString() : "Unknown Date"),
    description: data.description || data.document_summary || "No description available",
    req_id: data.req_id,
  };
};

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
          // Use our helper function to format the requirement
          setRequirement(formatRequirement(reqData));
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
                  document_summary,
                  req_id
                )
              `)
              .eq("requirement_id", requirementId)
              .maybeSingle();
              
            if (caseGenError) {
              console.error("Error fetching from case_generator:", caseGenError);
            } else if (caseGenData && caseGenData.requirements) {
              console.log("Found requirement via case_generator join:", caseGenData.requirements);
              
              // Create a standardized requirement object from the join result using our helper function
              if (typeof caseGenData.requirements === 'object') {
                const reqData: DatabaseRequirement = {
                  id: requirementId,
                  ...(caseGenData.requirements as object)
                };
                
                setRequirement(formatRequirement(reqData));
              }
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
