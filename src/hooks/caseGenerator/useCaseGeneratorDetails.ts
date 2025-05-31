
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getRequirement } from "@/services/requirementService";
import {
  getCaseGeneratorData,
  generateCaseGeneratorElements,
} from "@/services/caseGeneratorService";
import { getUserStoriesForRequirement, DatabaseUserStory } from "@/services/userStoriesService";
import { Requirement, UseCase, TestCase, StatusData } from "./types";
import { formatRequirement } from "./utils";

export const useCaseGeneratorDetails = (requirementId: string | null) => {
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [userStories, setUserStories] = useState<DatabaseUserStory[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isRequirementLoading, setIsRequirementLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<StatusData>({
    userStoriesStatus: "Draft",
    useCasesStatus: "Draft",
    testCasesStatus: "Draft",
  });

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
          setRequirement(formatRequirement(reqData));
        } else {
          console.log("Could not find requirement directly, trying to find via case_generator table");
          
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
              
              if (typeof caseGenData.requirements === 'object') {
                const reqData = {
                  id: requirementId,
                  ...(caseGenData.requirements as object)
                };
                
                setRequirement(formatRequirement(reqData));
              }
            }
          }
        }

        // Fetch user stories from database
        try {
          const dbUserStories = await getUserStoriesForRequirement(requirementId);
          setUserStories(dbUserStories);
          console.log("Fetched user stories from database:", dbUserStories);
        } catch (error) {
          console.error("Error fetching user stories:", error);
          setUserStories([]);
        }

        // Fetch case generator data for this requirement
        const caseGeneratorData = await getCaseGeneratorData(requirementId);

        if (caseGeneratorData) {
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
      if (type === "userStories" || !type) {
        // Refresh user stories from database
        try {
          const dbUserStories = await getUserStoriesForRequirement(requirementId);
          setUserStories(dbUserStories);
        } catch (error) {
          console.error("Error refreshing user stories:", error);
        }
      }

      const caseGeneratorData = await getCaseGeneratorData(requirementId);

      if (caseGeneratorData) {
        if (type === "useCases" || !type) {
          setUseCases(caseGeneratorData.useCases || []);
        }
        if (type === "testCases" || !type) {
          setTestCases(caseGeneratorData.testCases || []);
        }
        
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
