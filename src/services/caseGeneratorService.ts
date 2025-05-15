import {
  ForgeFlowItem,
  UserStory,
  UseCase,
  TestCase,
} from "@/hooks/caseGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper function to check if a string is a valid UUID
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Helper function to determine if we're working with a custom ID or UUID
// For specific table types to avoid type errors
const queryRequirementData = (requirementId: string) => {
  // Check if the ID has a format like "REQ-xx-xx" or if it's not a UUID
  const isCustomId =
    requirementId.includes("REQ-") ||
    (!isUUID(requirementId) && requirementId.includes("-"));

  return {
    // Get case generator entry
    getCaseGenerator: () => {
      if (isCustomId) {
        return supabase
          .from("requirements")
          .select("id")
          .eq("req_id", requirementId)
          .single()
          .then(({ data, error }) => {
            if (error || !data) return { data: null, error };
            // Now use the actual UUID to query the case_generator table
            return supabase
              .from("case_generator")
              .select("*")
              .eq("requirement_id", data.id)
              .maybeSingle();
          });
      }
      return supabase
        .from("case_generator")
        .select("*")
        .eq("requirement_id", requirementId)
        .maybeSingle();
    },

    // Get requirement entry
    getRequirement: () => {
      if (isCustomId) {
        return supabase
          .from("requirements")
          .select("*")
          .eq("req_id", requirementId)
          .maybeSingle();
      }
      return supabase
        .from("requirements")
        .select("*")
        .eq("id", requirementId)
        .maybeSingle();
    },

    // Get user stories
    getUserStories: () => {
      if (isCustomId) {
        return supabase
          .from("requirements")
          .select("id")
          .eq("req_id", requirementId)
          .single()
          .then(({ data, error }) => {
            if (error || !data) return { data: null, error };
            return supabase
              .from("user_stories")
              .select("*")
              .eq("requirement_id", data.id);
          });
      }
      return supabase
        .from("user_stories")
        .select("*")
        .eq("requirement_id", requirementId);
    },

    // Get use cases
    getUseCases: () => {
      if (isCustomId) {
        return supabase
          .from("requirements")
          .select("id")
          .eq("req_id", requirementId)
          .single()
          .then(({ data, error }) => {
            if (error || !data) return { data: null, error };
            return supabase
              .from("use_cases")
              .select("*")
              .eq("requirement_id", data.id);
          });
      }
      return supabase
        .from("use_cases")
        .select("*")
        .eq("requirement_id", requirementId);
    },

    // Get test cases
    getTestCases: () => {
      if (isCustomId) {
        return supabase
          .from("requirements")
          .select("id")
          .eq("req_id", requirementId)
          .single()
          .then(({ data, error }) => {
            if (error || !data) return { data: null, error };
            return supabase
              .from("test_cases")
              .select("*")
              .eq("requirement_id", data.id);
          });
      }
      return supabase
        .from("test_cases")
        .select("*")
        .eq("requirement_id", requirementId);
    },
  };
};

// Base API URL - replace with your actual API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get all case generator items for the dashboard view
export const getCaseGeneratorItems = async (): Promise<ForgeFlowItem[]> => {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("No authenticated user found");
      return [];
    }

    // First get user's requirements
    const { data: userRequirements, error: userReqError } = await supabase
      .from("requirements")
      .select("id")
      .eq("user_id", user.id);

    if (userReqError || !userRequirements || userRequirements.length === 0) {
      console.log("User has no requirements");
      return [];
    }

    // Get requirement IDs for this user
    const userRequirementIds = userRequirements.map((req) => req.id);

    // Fetch real data from Supabase only for this user's requirements
    const { data: caseGeneratorData, error } = await supabase
      .from("case_generator")
      .select(
        `
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
      `
      )
      .in("requirement_id", userRequirementIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching case generator items:", error);
      return [];
    }

    if (!caseGeneratorData || caseGeneratorData.length === 0) {
      console.log("No case generator data found for user");
      return [];
    }

    console.log("Fetched case generator items:", caseGeneratorData);

    // Transform the data to match the ForgeFlowItem structure
    // but only include valid entries with requirement data
    const items: ForgeFlowItem[] = caseGeneratorData
      .filter((item) => item.requirements) // Only include items with valid requirement data
      .map((item) => ({
        id: item.id,
        requirementId: item.requirement_id,
        projectName: item.requirements?.project_name || "",
        industry: item.requirements?.industry_type || "",
        created: new Date(item.created_at).toLocaleDateString(),
        userStoriesStatus: item.user_stories_status,
        useCasesStatus: item.use_cases_status,
        testCasesStatus: item.test_cases_status,
        reqId: item.requirements?.req_id || "",
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
    console.log(
      `Fetching case generator data for requirement: ${requirementId}`
    );

    // Create a query helper for this requirement ID
    const queryHelper = queryRequirementData(requirementId);

    // First fetch the case_generator status data
    const { data: caseGeneratorStatus, error: statusError } =
      await queryHelper.getCaseGenerator();

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
    const { data: userStoriesData, error: userStoriesError } =
      await queryHelper.getUserStories();

    if (userStoriesError) {
      console.error("Error fetching user stories:", userStoriesError);
    }

    console.log("User stories data:", userStoriesData);

    // Fetch real use cases from Supabase
    const { data: useCasesData, error: useCasesError } =
      await queryHelper.getUseCases();

    if (useCasesError) {
      console.error("Error fetching use cases:", useCasesError);
    }

    console.log("Use cases data:", useCasesData);

    // Fetch real test cases from Supabase
    const { data: testCasesData, error: testCasesError } =
      await queryHelper.getTestCases();

    if (testCasesError) {
      console.error("Error fetching test cases:", testCasesError);
    }

    console.log("Test cases data:", testCasesData);

    // If no data found for any of the entities, try to initialize a case_generator entry if it doesn't exist
    if (
      !caseGeneratorStatus &&
      (!userStoriesData?.length ||
        !useCasesData?.length ||
        !testCasesData?.length)
    ) {
      // First, we need the actual UUID of the requirement for custom IDs
      let actualRequirementId = requirementId;

      if (requirementId.includes("REQ-") || requirementId.includes("-")) {
        const { data: reqData } = await supabase
          .from("requirements")
          .select("id")
          .eq("req_id", requirementId)
          .maybeSingle();

        if (reqData?.id) {
          actualRequirementId = reqData.id;
        } else {
          console.error(
            "Could not find the actual UUID for this requirement ID"
          );
          return {
            userStories: [],
            useCases: [],
            testCases: [],
            statusData: {
              userStoriesStatus: "Draft",
              useCasesStatus: "Draft",
              testCasesStatus: "Draft",
            },
          };
        }
      }

      const { data: existingEntry, error: checkError } = await supabase
        .from("case_generator")
        .select("id")
        .eq("requirement_id", actualRequirementId)
        .maybeSingle();

      if (!existingEntry && !checkError) {
        console.log("Creating new case_generator entry for this requirement");
        const { error: createError } = await supabase
          .from("case_generator")
          .insert({
            requirement_id: actualRequirementId,
            user_stories_status: "Draft",
            use_cases_status: "Draft",
            test_cases_status: "Draft",
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
      content:
        useCase.title + (useCase.main_flow ? `: ${useCase.main_flow}` : ""),
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
      },
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
      },
    };
  }
};

// Generate user stories for a requirement
export const generateUserStories = async (requirementId: string) => {
  try {
    console.log(`Generating user stories for requirement ${requirementId}`);
    console.log(
      `Requirement ID type check: isUUID=${isUUID(
        requirementId
      )}, includes REQ-=${requirementId.includes("REQ-")}`
    );

    // Handle custom IDs for Edge Function invocation
    let actualRequirementId = requirementId;
    if (
      requirementId.includes("REQ-") ||
      (!isUUID(requirementId) && requirementId.includes("-"))
    ) {
      console.log("Detected custom ID format, looking up UUID...");
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id, req_id")
        .eq("req_id", requirementId)
        .maybeSingle();

      if (reqError) {
        console.error("Database error looking up requirement:", reqError);
        toast.error("Database error looking up requirement");
        throw reqError;
      }

      if (reqData?.id) {
        actualRequirementId = reqData.id;
        console.log(
          `Successfully mapped custom ID ${requirementId} to UUID ${actualRequirementId}`
        );
      } else {
        console.error(
          `Could not find requirement with ID ${requirementId} in the requirements table`
        );
        toast.error(`Requirement ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      }
    } else {
      console.log(`Using UUID format directly: ${requirementId}`);

      // Verify UUID exists in database
      const { data: reqCheck, error: reqCheckError } = await supabase
        .from("requirements")
        .select("id")
        .eq("id", requirementId)
        .maybeSingle();

      if (reqCheckError) {
        console.error("Error verifying requirement exists:", reqCheckError);
      } else if (!reqCheck) {
        console.error(
          `Requirement with UUID ${requirementId} not found in database`
        );
        toast.error(`Requirement with ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      } else {
        console.log(
          `Confirmed requirement ${requirementId} exists in database`
        );
      }
    }

    console.log(
      `Invoking edge function with requirementId: ${actualRequirementId}`
    );
    const { data, error } = await supabase.functions.invoke(
      "generate-user-stories",
      {
        body: { requirementId: actualRequirementId },
      }
    );

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
    console.error(
      `Error generating user stories for requirement ${requirementId}:`,
      error
    );
    toast.error("Failed to generate user stories");
    throw error;
  }
};

// Generate use cases for a requirement
export const generateUseCases = async (requirementId: string) => {
  try {
    console.log(`Generating use cases for requirement ${requirementId}`);
    console.log(
      `Requirement ID type check: isUUID=${isUUID(
        requirementId
      )}, includes REQ-=${requirementId.includes("REQ-")}`
    );

    // Handle custom IDs for Edge Function invocation
    let actualRequirementId = requirementId;
    if (
      requirementId.includes("REQ-") ||
      (!isUUID(requirementId) && requirementId.includes("-"))
    ) {
      console.log("Detected custom ID format, looking up UUID...");
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id, req_id")
        .eq("req_id", requirementId)
        .maybeSingle();

      if (reqError) {
        console.error("Database error looking up requirement:", reqError);
        toast.error("Database error looking up requirement");
        throw reqError;
      }

      if (reqData?.id) {
        actualRequirementId = reqData.id;
        console.log(
          `Successfully mapped custom ID ${requirementId} to UUID ${actualRequirementId}`
        );
      } else {
        console.error(
          `Could not find requirement with ID ${requirementId} in the requirements table`
        );
        toast.error(`Requirement ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      }
    } else {
      console.log(`Using UUID format directly: ${requirementId}`);

      // Verify UUID exists in database
      const { data: reqCheck, error: reqCheckError } = await supabase
        .from("requirements")
        .select("id")
        .eq("id", requirementId)
        .maybeSingle();

      if (reqCheckError) {
        console.error("Error verifying requirement exists:", reqCheckError);
      } else if (!reqCheck) {
        console.error(
          `Requirement with UUID ${requirementId} not found in database`
        );
        toast.error(`Requirement with ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      } else {
        console.log(
          `Confirmed requirement ${requirementId} exists in database`
        );
      }
    }

    console.log(
      `Invoking edge function with requirementId: ${actualRequirementId}`
    );
    const { data, error } = await supabase.functions.invoke(
      "generate-use-cases",
      {
        body: { requirementId: actualRequirementId },
      }
    );

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
    console.error(
      `Error generating use cases for requirement ${requirementId}:`,
      error
    );
    toast.error("Failed to generate use cases");
    throw error;
  }
};

// Generate test cases for a requirement
export const generateTestCases = async (requirementId: string) => {
  try {
    console.log(`Generating test cases for requirement ${requirementId}`);
    console.log(
      `Requirement ID type check: isUUID=${isUUID(
        requirementId
      )}, includes REQ-=${requirementId.includes("REQ-")}`
    );

    // Handle custom IDs for Edge Function invocation
    let actualRequirementId = requirementId;
    if (
      requirementId.includes("REQ-") ||
      (!isUUID(requirementId) && requirementId.includes("-"))
    ) {
      console.log("Detected custom ID format, looking up UUID...");
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id, req_id")
        .eq("req_id", requirementId)
        .maybeSingle();

      if (reqError) {
        console.error("Database error looking up requirement:", reqError);
        toast.error("Database error looking up requirement");
        throw reqError;
      }

      if (reqData?.id) {
        actualRequirementId = reqData.id;
        console.log(
          `Successfully mapped custom ID ${requirementId} to UUID ${actualRequirementId}`
        );
      } else {
        console.error(
          `Could not find requirement with ID ${requirementId} in the requirements table`
        );
        toast.error(`Requirement ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      }
    } else {
      console.log(`Using UUID format directly: ${requirementId}`);

      // Verify UUID exists in database
      const { data: reqCheck, error: reqCheckError } = await supabase
        .from("requirements")
        .select("id")
        .eq("id", requirementId)
        .maybeSingle();

      if (reqCheckError) {
        console.error("Error verifying requirement exists:", reqCheckError);
      } else if (!reqCheck) {
        console.error(
          `Requirement with UUID ${requirementId} not found in database`
        );
        toast.error(`Requirement with ID ${requirementId} not found`);
        throw new Error(`Requirement with ID ${requirementId} not found`);
      } else {
        console.log(
          `Confirmed requirement ${requirementId} exists in database`
        );
      }
    }

    console.log(
      `Invoking edge function with requirementId: ${actualRequirementId}`
    );
    const { data, error } = await supabase.functions.invoke(
      "generate-test-cases",
      {
        body: { requirementId: actualRequirementId },
      }
    );

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
    console.error(
      `Error generating test cases for requirement ${requirementId}:`,
      error
    );
    toast.error("Failed to generate test cases");
    throw error;
  }
};

// Generate all or specific case generator elements
export const generateCaseGeneratorElements = async (
  requirementId: string,
  type?: "userStories" | "useCases" | "testCases"
) => {
  try {
    console.log(`Generating ${type || "all"} for requirement ${requirementId}`);
    console.log(
      `Requirement ID type check: isUUID=${isUUID(
        requirementId
      )}, includes REQ-=${requirementId.includes("REQ-")}`
    );

    // Create a query helper for this requirement ID
    const queryHelper = queryRequirementData(requirementId);

    // First check if the requirement exists directly
    const { data: requirementCheck, error: requirementCheckError } =
      await queryHelper.getRequirement();

    if (requirementCheckError) {
      console.error(
        "Error checking if requirement exists:",
        requirementCheckError
      );
      toast.error("Error checking requirement");
      return { success: false, error: "Database error looking up requirement" };
    }

    if (!requirementCheck) {
      console.error(`Requirement with ID ${requirementId} not found`);
      toast.error(`Requirement with ID ${requirementId} not found`);
      return {
        success: false,
        error: `Requirement with ID ${requirementId} not found`,
      };
    }

    console.log("Requirement found:", requirementCheck);

    // Get current status to determine what needs to be generated
    const { data: currentStatus, error: statusError } =
      await queryHelper.getCaseGenerator();

    if (statusError) {
      console.error("Error fetching current status:", statusError);
      return { success: false, error: "Failed to fetch current status" };
    }

    const status = currentStatus || {
      user_stories_status: "Draft",
      use_cases_status: "Draft",
      test_cases_status: "Draft",
    };

    // Get the actual UUID for custom IDs
    let actualRequirementId = requirementId;
    if (
      requirementId.includes("REQ-") ||
      (!isUUID(requirementId) && requirementId.includes("-"))
    ) {
      console.log("Detected custom ID format, looking up UUID...");
      // We should already have the requirement data from the check above
      if (requirementCheck?.id) {
        actualRequirementId = requirementCheck.id;
        console.log(
          `Successfully mapped custom ID ${requirementId} to UUID ${actualRequirementId}`
        );
      } else {
        // Double-check directly if somehow the ID wasn't found
        const { data: reqData, error: reqError } = await supabase
          .from("requirements")
          .select("id, req_id")
          .eq("req_id", requirementId)
          .maybeSingle();

        if (reqError) {
          console.error(
            "Database error looking up requirement by req_id:",
            reqError
          );
          toast.error("Database error looking up requirement");
          return { success: false, error: "Database error" };
        }

        if (reqData?.id) {
          actualRequirementId = reqData.id;
          console.log(
            `Mapped custom ID ${requirementId} to UUID ${actualRequirementId}`
          );
        } else {
          console.error(`Could not find requirement with ID ${requirementId}`);
          toast.error(`Requirement ID ${requirementId} not found`);
          return {
            success: false,
            error: `Requirement with ID ${requirementId} not found`,
          };
        }
      }
    } else {
      console.log(`Using UUID format directly: ${requirementId}`);
    }

    // If a specific type is specified, only generate that type
    if (type) {
      console.log(`Generating specific type: ${type}`);

      let result;

      switch (type) {
        case "userStories":
          console.log("Generating user stories...");
          result = await generateUserStories(actualRequirementId);
          return { success: result.success };

        case "useCases":
          console.log("Generating use cases...");
          // Check if user stories are completed first
          if (status.user_stories_status !== "Completed") {
            toast.error("Please generate user stories first");
            return {
              success: false,
              error: "User stories must be generated first",
            };
          }
          result = await generateUseCases(actualRequirementId);
          return { success: result.success };

        case "testCases":
          console.log("Generating test cases...");
          // Check if use cases are completed first
          if (status.use_cases_status !== "Completed") {
            toast.error("Please generate use cases first");
            return {
              success: false,
              error: "Use cases must be generated first",
            };
          }
          result = await generateTestCases(actualRequirementId);
          return { success: result.success };
      }
    }

    // Generate all in sequence - with proper handling for sequential execution
    console.log("Generating all case elements in sequence");

    try {
      // Start with user stories
      console.log("Step 1: Generating user stories");
      toast.info("Generating user stories...");
      const userStoriesResult = await generateUserStories(actualRequirementId);
      if (!userStoriesResult.success) {
        console.error("Failed to generate user stories");
        toast.error("Failed to generate user stories");
        return { success: false, error: "Failed to generate user stories" };
      }

      // Get the updated status after user stories generation
      const { data: statusAfterUserStories } = await supabase
        .from("case_generator")
        .select("user_stories_status")
        .eq("requirement_id", actualRequirementId)
        .maybeSingle();

      if (
        !statusAfterUserStories ||
        statusAfterUserStories.user_stories_status !== "Completed"
      ) {
        console.log("Waiting for user stories completion...");
        // Wait for the user stories to complete (max 5 seconds)
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: checkStatus } = await supabase
            .from("case_generator")
            .select("user_stories_status")
            .eq("requirement_id", actualRequirementId)
            .maybeSingle();

          if (checkStatus?.user_stories_status === "Completed") {
            console.log("User stories marked as completed, proceeding...");
            break;
          }
        }
      }

      // Then generate use cases
      console.log("Step 2: Generating use cases");
      toast.info("Generating use cases...");
      const useCasesResult = await generateUseCases(actualRequirementId);
      if (!useCasesResult.success) {
        console.error("Failed to generate use cases");
        toast.error("Failed to generate use cases");
        return { success: false, error: "Failed to generate use cases" };
      }

      // Get the updated status after use cases generation
      const { data: statusAfterUseCases } = await supabase
        .from("case_generator")
        .select("use_cases_status")
        .eq("requirement_id", actualRequirementId)
        .maybeSingle();

      if (
        !statusAfterUseCases ||
        statusAfterUseCases.use_cases_status !== "Completed"
      ) {
        console.log("Waiting for use cases completion...");
        // Wait for the use cases to complete (max 5 seconds)
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: checkStatus } = await supabase
            .from("case_generator")
            .select("use_cases_status")
            .eq("requirement_id", actualRequirementId)
            .maybeSingle();

          if (checkStatus?.use_cases_status === "Completed") {
            console.log("Use cases marked as completed, proceeding...");
            break;
          }
        }
      }

      // Finally generate test cases
      console.log("Step 3: Generating test cases");
      toast.info("Generating test cases...");
      const testCasesResult = await generateTestCases(actualRequirementId);
      if (!testCasesResult.success) {
        console.error("Failed to generate test cases");
        toast.error("Failed to generate test cases");
        return { success: false, error: "Failed to generate test cases" };
      }

      toast.success("All case elements generated successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error in sequential generation:", error);
      toast.error(`Generation sequence failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error("Error generating case elements:", error);
    toast.error(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};
