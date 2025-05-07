import {
  ForgeFlowItem,
  UserStory,
  UseCase,
  TestCase,
} from "@/hooks/useCaseGenerator";
import axios from "axios";

// Base API URL - replace with your actual API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Mock data for testing
const mockCaseGeneratorItems: ForgeFlowItem[] = [
  {
    id: "FF-001",
    requirementId: "REQ-25-01",
    projectName: "AI GoalPilot",
    industry: "HR",
    created: "5/6/2023",
    userStoriesStatus: "completed",
    useCasesStatus: "completed",
    testCasesStatus: "in-progress",
  },
  {
    id: "FF-002",
    requirementId: "REQ-25-02",
    projectName: "MeNova",
    industry: "healthcare",
    created: "5/6/2023",
    userStoriesStatus: "completed",
    useCasesStatus: "in-progress",
    testCasesStatus: "pending",
  },
];

const mockUserStories: UserStory[] = [
  {
    id: "US-001",
    content:
      "As a user, I want to easily track my daily health metrics so that I can monitor my well-being over time.",
    status: "completed",
  },
  {
    id: "US-002",
    content:
      "As a patient, I want to receive medication reminders so that I never miss a dose.",
    status: "completed",
  },
];

const mockUseCases: UseCase[] = [
  {
    id: "UC-001",
    content:
      "User opens the app and navigates to the metrics dashboard to view their health trends over the past week.",
    status: "completed",
  },
  {
    id: "UC-002",
    content:
      "System sends a notification when it's time to take medication and logs when the user confirms they've taken it.",
    status: "in-progress",
  },
];

const mockTestCases: TestCase[] = [
  {
    id: "TC-001",
    content:
      "Verify that health metrics are accurately displayed on the dashboard with appropriate visualizations.",
    status: "completed",
  },
  {
    id: "TC-002",
    content:
      "Test that medication reminders are sent at the scheduled time and can be dismissed or marked as completed.",
    status: "pending",
  },
];

// Get all case generator items for the dashboard view
export const getCaseGeneratorItems = async (): Promise<ForgeFlowItem[]> => {
  try {
    // For real API, uncomment this
    // const response = await axios.get(`${API_URL}/case-generator`);
    // return response.data;

    // For testing, return mock data
    return Promise.resolve(mockCaseGeneratorItems);
  } catch (error) {
    console.error("Error fetching case generator items:", error);
    return mockCaseGeneratorItems; // Return mock data on error
  }
};

// Get case generator data for a specific requirement
export const getCaseGeneratorData = async (requirementId: string) => {
  try {
    // For real API, uncomment this
    // const response = await axios.get(`${API_URL}/case-generator/${requirementId}`);
    // return response.data;

    // For testing, return mock data
    return Promise.resolve({
      userStories: mockUserStories,
      useCases: mockUseCases,
      testCases: mockTestCases,
    });
  } catch (error) {
    console.error(
      `Error fetching case generator data for requirement ${requirementId}:`,
      error
    );
    // Return mock data on error
    return {
      userStories: mockUserStories,
      useCases: mockUseCases,
      testCases: mockTestCases,
    };
  }
};

// Generate or regenerate case generator elements
export const generateCaseGeneratorElements = async (
  requirementId: string,
  type?: "userStories" | "useCases" | "testCases"
) => {
  try {
    // For real API, uncomment this
    // const response = await axios.post(`${API_URL}/case-generator/generate`, {
    //   requirementId,
    //   type,
    // });
    // return response.data;

    // For testing, return mock data
    return Promise.resolve({
      userStories: mockUserStories,
      useCases: mockUseCases,
      testCases: mockTestCases,
    });
  } catch (error) {
    console.error(
      `Error generating case generator elements for requirement ${requirementId}:`,
      error
    );
    throw error;
  }
};
