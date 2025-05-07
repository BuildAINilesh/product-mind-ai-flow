
import {
  ForgeFlowItem,
  UserStory,
  UseCase,
  TestCase,
} from "@/hooks/useCaseGenerator";
import { supabase } from "@/integrations/supabase/client";

// Base API URL - replace with your actual API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get all case generator items for the dashboard view
export const getCaseGeneratorItems = async (): Promise<ForgeFlowItem[]> => {
  try {
    // Fetch real data from Supabase
    const { data: caseGeneratorData, error } = await supabase
      .from("case_generator")
      .select(`
        id,
        created_at,
        requirement_id,
        user_stories_status,
        use_cases_status,
        test_cases_status,
        requirements:requirement_id (
          id,
          req_id,
          project_name,
          industry_type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching case generator items:", error);
      throw error;
    }

    // Transform the data to match the ForgeFlowItem structure
    const items: ForgeFlowItem[] = caseGeneratorData.map(item => ({
      id: item.id,
      requirementId: item.requirement_id,
      projectName: item.requirements?.project_name || "Unknown Project",
      industry: item.requirements?.industry_type || "Unknown Industry",
      created: new Date(item.created_at).toLocaleDateString(),
      userStoriesStatus: item.user_stories_status,
      useCasesStatus: item.use_cases_status,
      testCasesStatus: item.test_cases_status,
      reqId: item.requirements?.req_id || "Unknown ID", // Add the formatted req_id
    }));

    return items;
  } catch (error) {
    console.error("Error fetching case generator items:", error);
    return []; // Return empty array on error
  }
};

// Get case generator data for a specific requirement
export const getCaseGeneratorData = async (requirementId: string) => {
  try {
    // First fetch the case_generator status data
    const { data: caseGeneratorStatus, error: statusError } = await supabase
      .from("case_generator")
      .select("user_stories_status, use_cases_status, test_cases_status")
      .eq("requirement_id", requirementId)
      .maybeSingle();

    if (statusError) {
      console.error("Error fetching case generator status:", statusError);
    }

    const statusData = caseGeneratorStatus || {
      user_stories_status: "Draft",
      use_cases_status: "Draft",
      test_cases_status: "Draft",
    };

    // Fetch real user stories from Supabase
    const { data: userStoriesData, error: userStoriesError } = await supabase
      .from("user_stories")
      .select("*")
      .eq("requirement_id", requirementId);

    if (userStoriesError) {
      console.error("Error fetching user stories:", userStoriesError);
    }

    // Fetch real use cases from Supabase
    const { data: useCasesData, error: useCasesError } = await supabase
      .from("use_cases")
      .select("*")
      .eq("requirement_id", requirementId);

    if (useCasesError) {
      console.error("Error fetching use cases:", useCasesError);
    }

    // Fetch real test cases from Supabase
    const { data: testCasesData, error: testCasesError } = await supabase
      .from("test_cases")
      .select("*")
      .eq("requirement_id", requirementId);

    if (testCasesError) {
      console.error("Error fetching test cases:", testCasesError);
    }

    // Transform the data to match our expected structures
    const userStories: UserStory[] = (userStoriesData || []).map((story) => ({
      id: story.id,
      content: story.story,
      status: "completed", // Default status
    }));

    const useCases: UseCase[] = (useCasesData || []).map((useCase) => ({
      id: useCase.id,
      content: useCase.title + (useCase.main_flow ? `: ${useCase.main_flow}` : ""),
      status: "completed", // Default status
    }));

    const testCases: TestCase[] = (testCasesData || []).map((testCase) => ({
      id: testCase.id,
      content: testCase.test_title,
      status: "completed", // Default status
    }));

    return {
      userStories,
      useCases,
      testCases,
      statusData: {
        userStoriesStatus: statusData.user_stories_status,
        useCasesStatus: statusData.use_cases_status,
        testCasesStatus: statusData.test_cases_status,
      }
    };
  } catch (error) {
    console.error(
      `Error fetching case generator data for requirement ${requirementId}:`,
      error
    );
    return {
      userStories: [],
      useCases: [],
      testCases: [],
      statusData: {
        userStoriesStatus: "Draft",
        useCasesStatus: "Draft",
        testCasesStatus: "Draft",
      }
    };
  }
};

// Generate or regenerate case generator elements
export const generateCaseGeneratorElements = async (
  requirementId: string,
  type?: "userStories" | "useCases" | "testCases"
) => {
  try {
    // In a real implementation, this would call your AI service
    // For now, we'll update the status in the database to simulate generation
    
    const updates: Record<string, string> = {};
    if (!type || type === "userStories") {
      updates.user_stories_status = "in-progress";
    }
    if (!type || type === "useCases") {
      updates.use_cases_status = "in-progress";
    }
    if (!type || type === "testCases") {
      updates.test_cases_status = "in-progress";
    }

    // Update the case generator record to show in-progress status
    const { error: updateError } = await supabase
      .from("case_generator")
      .update(updates)
      .eq("requirement_id", requirementId);

    if (updateError) {
      console.error("Error updating case generator status:", updateError);
      throw updateError;
    }

    // For now, we'll just return the current data
    return await getCaseGeneratorData(requirementId);
  } catch (error) {
    console.error(
      `Error generating case generator elements for requirement ${requirementId}:`,
      error
    );
    throw error;
  }
};
