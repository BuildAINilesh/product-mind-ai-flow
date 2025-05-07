import axios from "axios";

// Base API URL - replace with your actual API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Mock requirement data for testing
const mockRequirements = [
  {
    id: "REQ-25-01",
    title: "AI-powered goal tracking system",
    description:
      "Develop a system that uses AI to track employee goals, provide feedback, and suggest improvements.",
    projectName: "AI GoalPilot",
    industry: "HR",
    priority: "high",
    status: "active",
    created: "5/6/2023",
    author: "John Smith",
  },
  {
    id: "REQ-25-02",
    title: "Health monitoring mobile application",
    description:
      "Create a mobile app that allows users to track health metrics, set wellness goals, and receive personalized recommendations.",
    projectName: "MeNova",
    industry: "healthcare",
    priority: "high",
    status: "active",
    created: "5/6/2023",
    author: "Sarah Johnson",
  },
];

// Get a specific requirement by ID
export const getRequirement = async (requirementId: string) => {
  try {
    // For real API, uncomment this
    // const response = await axios.get(`${API_URL}/requirements/${requirementId}`);
    // return response.data;

    // For testing, return mock data
    const requirement = mockRequirements.find(
      (req) => req.id === requirementId
    );
    return Promise.resolve(requirement || null);
  } catch (error) {
    console.error(`Error fetching requirement ${requirementId}:`, error);
    return null;
  }
};

// Get all requirements
export const getRequirements = async () => {
  try {
    // For real API, uncomment this
    // const response = await axios.get(`${API_URL}/requirements`);
    // return response.data;

    // For testing, return mock data
    return Promise.resolve(mockRequirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return [];
  }
};
