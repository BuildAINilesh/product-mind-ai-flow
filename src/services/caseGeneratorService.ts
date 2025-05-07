
import {
  ForgeFlowItem,
  UserStory,
  UseCase,
  TestCase,
} from "@/hooks/caseGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

    console.log("Fetched case generator items:", caseGeneratorData);
    
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
      reqId: item.requirements?.req_id || item.requirement_id.substring(0, 8), // Use req_id or first part of UUID
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
    console.log(`Fetching case generator data for requirement: ${requirementId}`);
    
    // First fetch the case_generator status data
    const { data: caseGeneratorStatus, error: statusError } = await supabase
      .from("case_generator")
      .select("user_stories_status, use_cases_status, test_cases_status")
      .eq("requirement_id", requirementId)
      .maybeSingle();

    if (statusError) {
      console.error("Error fetching case generator status:", statusError);
    }

    console.log("Case generator status:", caseGeneratorStatus);
    
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

    console.log("User stories data:", userStoriesData);

    // Fetch real use cases from Supabase
    const { data: useCasesData, error: useCasesError } = await supabase
      .from("use_cases")
      .select("*")
      .eq("requirement_id", requirementId);

    if (useCasesError) {
      console.error("Error fetching use cases:", useCasesError);
    }

    console.log("Use cases data:", useCasesData);

    // Fetch real test cases from Supabase
    const { data: testCasesData, error: testCasesError } = await supabase
      .from("test_cases")
      .select("*")
      .eq("requirement_id", requirementId);

    if (testCasesError) {
      console.error("Error fetching test cases:", testCasesError);
    }

    console.log("Test cases data:", testCasesData);

    // If no data found for any of the entities, try to initialize a case_generator entry if it doesn't exist
    if (!caseGeneratorStatus && (!userStoriesData?.length || !useCasesData?.length || !testCasesData?.length)) {
      const { data: existingEntry, error: checkError } = await supabase
        .from("case_generator")
        .select("id")
        .eq("requirement_id", requirementId)
        .maybeSingle();
        
      if (!existingEntry && !checkError) {
        console.log("Creating new case_generator entry for this requirement");
        const { error: createError } = await supabase
          .from("case_generator")
          .insert({
            requirement_id: requirementId,
            user_stories_status: "Draft",
            use_cases_status: "Draft",
            test_cases_status: "Draft"
          });
          
        if (createError) {
          console.error("Error creating case_generator entry:", createError);
        } else {
          console.log("Successfully created case_generator entry");
        }
      }
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

// Generate user stories for a requirement
export const generateUserStories = async (requirementId: string) => {
  try {
    console.log(`Generating user stories for requirement ${requirementId}`);
    
    const { data, error } = await supabase.functions.invoke("generate-user-stories", {
      body: { requirementId }
    });
    
    if (error) {
      console.error("Error generating user stories:", error);
      toast.error("Failed to generate user stories");
      throw error;
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate user stories");
    }
    
    toast.success("User stories generated successfully");
    return data;
  } catch (error) {
    console.error(`Error generating user stories for requirement ${requirementId}:`, error);
    toast.error("Failed to generate user stories");
    throw error;
  }
};

// Generate use cases for a requirement
export const generateUseCases = async (requirementId: string) => {
  try {
    console.log(`Generating use cases for requirement ${requirementId}`);
    
    const { data, error } = await supabase.functions.invoke("generate-use-cases", {
      body: { requirementId }
    });
    
    if (error) {
      console.error("Error generating use cases:", error);
      toast.error("Failed to generate use cases");
      throw error;
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate use cases");
    }
    
    toast.success("Use cases generated successfully");
    return data;
  } catch (error) {
    console.error(`Error generating use cases for requirement ${requirementId}:`, error);
    toast.error("Failed to generate use cases");
    throw error;
  }
};

// Generate test cases for a requirement
export const generateTestCases = async (requirementId: string) => {
  try {
    console.log(`Generating test cases for requirement ${requirementId}`);
    
    const { data, error } = await supabase.functions.invoke("generate-test-cases", {
      body: { requirementId }
    });
    
    if (error) {
      console.error("Error generating test cases:", error);
      toast.error("Failed to generate test cases");
      throw error;
    }
    
    if (!data.success) {
      throw new Error(data.error || "Failed to generate test cases");
    }
    
    toast.success("Test cases generated successfully");
    return data;
  } catch (error) {
    console.error(`Error generating test cases for requirement ${requirementId}:`, error);
    toast.error("Failed to generate test cases");
    throw error;
  }
};

// Generate or regenerate case generator elements
export const generateCaseGeneratorElements = async (
  requirementId: string,
  type?: "userStories" | "useCases" | "testCases"
) => {
  try {
    console.log(`Generating case elements for requirement ${requirementId}, type: ${type || 'all'}`);
    
    // Check the current status to ensure we respect dependencies
    const { data: statusData, error: statusError } = await supabase
      .from("case_generator")
      .select("user_stories_status, use_cases_status, test_cases_status")
      .eq("requirement_id", requirementId)
      .maybeSingle();
      
    if (statusError) {
      console.error("Error fetching status data:", statusError);
      throw statusError;
    }
    
    // Create default status data if none exists
    if (!statusData) {
      const { error: createError } = await supabase
        .from("case_generator")
        .insert({
          requirement_id: requirementId,
          user_stories_status: "Draft",
          use_cases_status: "Draft",
          test_cases_status: "Draft"
        });
        
      if (createError) {
        console.error("Error creating case_generator entry:", createError);
        throw createError;
      }
    }
    
    // Handle specific type generation or generate all based on dependencies
    if (type === "userStories" || !type) {
      await generateUserStories(requirementId);
    }
    
    // Re-fetch status after user stories generation
    const { data: updatedStatus1 } = await supabase
      .from("case_generator")
      .select("user_stories_status")
      .eq("requirement_id", requirementId)
      .single();
      
    if ((type === "useCases" || !type) && updatedStatus1.user_stories_status === "Completed") {
      await generateUseCases(requirementId);
    } else if (type === "useCases") {
      toast.error("User stories must be generated successfully first");
    }
    
    // Re-fetch status after use cases generation
    const { data: updatedStatus2 } = await supabase
      .from("case_generator")
      .select("user_stories_status, use_cases_status")
      .eq("requirement_id", requirementId)
      .single();
      
    if ((type === "testCases" || !type) && 
        updatedStatus2.user_stories_status === "Completed" && 
        updatedStatus2.use_cases_status === "Completed") {
      await generateTestCases(requirementId);
    } else if (type === "testCases") {
      toast.error("User stories and use cases must be generated successfully first");
    }
    
    // Return the updated data
    return getCaseGeneratorData(requirementId);
  } catch (error) {
    console.error(
      `Error generating case generator elements for requirement ${requirementId}:`,
      error
    );
    toast.error("Failed to generate case elements");
    throw error;
  }
};
