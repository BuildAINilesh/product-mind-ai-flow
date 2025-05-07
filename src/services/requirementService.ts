
import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

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

// Get a specific requirement by ID - improved to check both ID and req_id
export const getRequirement = async (requirementId: string) => {
  try {
    console.log(`Looking for requirement with ID: ${requirementId}`);
    
    // First try to find directly from Supabase if available
    if (supabase) {
      console.log("Supabase client available, trying database lookup first");
      
      // Try direct UUID lookup
      let { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", requirementId)
        .maybeSingle();
      
      // If not found by UUID, try looking up by req_id (REQ-XX-XX format)
      if (!data && !error) {
        console.log("Not found by UUID, trying req_id lookup");
        ({ data, error } = await supabase
          .from("requirements")
          .select("*")
          .eq("req_id", requirementId)
          .maybeSingle());
      }
      
      // If found in database, return it
      if (data) {
        console.log("Found requirement in database:", data);
        return data;
      }
      
      // If there was a database error, log it but continue to fallback method
      if (error) {
        console.error("Error fetching from database:", error);
      }
    }
    
    // Fallback to mock data
    console.log("Using mock data lookup as fallback");
    const requirement = mockRequirements.find(
      (req) => req.id === requirementId
    );
    
    if (requirement) {
      console.log("Found requirement in mock data");
      return requirement;
    }
    
    // If we reach here, the requirement wasn't found
    console.log("Requirement not found in any data source");
    return null;
  } catch (error) {
    console.error(`Error fetching requirement ${requirementId}:`, error);
    return null;
  }
};

// Get all requirements
export const getRequirements = async () => {
  try {
    // First try to fetch from Supabase if available
    if (supabase) {
      const { data, error } = await supabase
        .from("requirements")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        console.log("Fetched requirements from database:", data.length);
        return data;
      }
      
      if (error) {
        console.error("Error fetching requirements from database:", error);
      }
    }
    
    // Fallback to mock data
    console.log("Using mock requirement data as fallback");
    return Promise.resolve(mockRequirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return [];
  }
};
