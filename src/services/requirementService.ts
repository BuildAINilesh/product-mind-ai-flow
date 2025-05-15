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
    projectName: "Employee Progress Tracker",
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
    console.log(
      "%c[RequirementService] Looking for requirement with ID:",
      "background: #6366F1; color: white; padding: 2px 5px; border-radius: 3px;",
      requirementId
    );

    // First try to find directly from Supabase if available
    if (supabase) {
      console.log(
        "%c[RequirementService] Supabase client available, trying database lookup first",
        "background: #6366F1; color: white; padding: 2px 5px; border-radius: 3px;"
      );

      // Try direct UUID lookup
      let { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", requirementId)
        .maybeSingle();

      console.log(
        "%c[RequirementService] UUID lookup result:",
        "background: #6366F1; color: white; padding: 2px 5px; border-radius: 3px;",
        { found: !!data, error: error?.message }
      );

      // If not found by UUID, try looking up by req_id (REQ-XX-XX format)
      if (!data && !error) {
        console.log(
          "%c[RequirementService] Not found by UUID, trying req_id lookup",
          "background: #6366F1; color: white; padding: 2px 5px; border-radius: 3px;"
        );
        ({ data, error } = await supabase
          .from("requirements")
          .select("*")
          .eq("req_id", requirementId)
          .maybeSingle());

        console.log(
          "%c[RequirementService] req_id lookup result:",
          "background: #6366F1; color: white; padding: 2px 5px; border-radius: 3px;",
          { found: !!data, error: error?.message }
        );
      }

      // If found in database, return it
      if (data) {
        console.log(
          "%c[RequirementService] Found requirement in database:",
          "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
          data
        );
        return data;
      }

      // If there was a database error, log it but continue to fallback method
      if (error) {
        console.error(
          "%c[RequirementService] Error fetching from database:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          error
        );
      }
    }

    // Fallback to mock data
    console.log(
      "%c[RequirementService] ⚠️ USING MOCK DATA as fallback - this should only happen in development",
      "background: #F59E0B; color: black; padding: 2px 5px; border-radius: 3px; font-weight: bold;"
    );

    const mockRequirement = mockRequirements.find(
      (req) => req.id === requirementId
    );

    if (mockRequirement) {
      console.log(
        "%c[RequirementService] ⚠️ Found requirement in MOCK data:",
        "background: #F59E0B; color: black; padding: 2px 5px; border-radius: 3px; font-weight: bold;",
        mockRequirement
      );
      return mockRequirement;
    }

    // If we reach here, the requirement wasn't found
    console.log(
      "%c[RequirementService] Requirement not found in any data source",
      "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;"
    );
    return null;
  } catch (error) {
    console.error(
      "%c[RequirementService] Error fetching requirement:",
      "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
      error
    );
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
        console.log(
          "%c[RequirementService] Fetched requirements from database:",
          "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
          data.length
        );
        return data;
      }

      if (error) {
        console.error(
          "%c[RequirementService] Error fetching requirements from database:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          error
        );
      }
    }

    // Fallback to mock data
    console.log(
      "%c[RequirementService] ⚠️ USING MOCK DATA as fallback - this should only happen in development",
      "background: #F59E0B; color: black; padding: 2px 5px; border-radius: 3px; font-weight: bold;"
    );
    return Promise.resolve(mockRequirements);
  } catch (error) {
    console.error(
      "%c[RequirementService] Error fetching requirements:",
      "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
      error
    );
    return [];
  }
};
