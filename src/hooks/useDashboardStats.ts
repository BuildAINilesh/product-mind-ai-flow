import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface DashboardStats {
  requirementStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  validationStats: {
    passed: number;
    failed: number;
    pending: number;
  };
  testCoverage: {
    functional: number;
    edge: number;
    integration: number;
    negative: number;
  };
  weeklyProgress: Array<{
    date: string;
    requirements: number;
    validated: number;
  }>;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    item: string;
    timestamp: string;
  }>;
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);

        // Fetch requirements stats
        const { data: requirements, error: reqError } = await supabase
          .from("requirements")
          .select("id, status");

        if (reqError) throw reqError;

        // Fetch validation stats
        const { data: validations, error: validationError } = await supabase
          .from("requirement_validation")
          .select("id, status, readiness_score");

        if (validationError) throw validationError;

        // Fetch test cases
        const { data: testCases, error: testError } = await supabase
          .from("test_cases")
          .select("id, type");

        if (testError) throw testError;

        // Calculate requirement stats
        const requirementStats = {
          total: requirements.length,
          completed: requirements.filter((req) => req.status === "Completed")
            .length,
          inProgress: requirements.filter((req) => req.status === "Draft")
            .length,
          pending: requirements.filter((req) => req.status === "Re_Draft")
            .length,
        };

        // Calculate validation stats
        const validationStats = {
          passed: validations.filter(
            (val) => val.readiness_score && val.readiness_score >= 70
          ).length,
          failed: validations.filter(
            (val) => val.readiness_score && val.readiness_score < 70
          ).length,
          pending: validations.filter((val) => !val.readiness_score).length,
        };

        // Calculate test coverage
        const totalTestCases = testCases.length;
        const testCoverage = {
          functional: totalTestCases
            ? Math.round(
                (testCases.filter((test) => test.type === "functional").length /
                  totalTestCases) *
                  100
              )
            : 0,
          edge: totalTestCases
            ? Math.round(
                (testCases.filter((test) => test.type === "edge").length /
                  totalTestCases) *
                  100
              )
            : 0,
          integration: totalTestCases
            ? Math.round(
                (testCases.filter((test) => test.type === "integration")
                  .length /
                  totalTestCases) *
                  100
              )
            : 0,
          negative: totalTestCases
            ? Math.round(
                (testCases.filter((test) => test.type === "negative").length /
                  totalTestCases) *
                  100
              )
            : 0,
        };

        // Get weekly progress (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentRequirements, error: recentReqError } =
          await supabase
            .from("requirements")
            .select("created_at, status")
            .gte("created_at", oneWeekAgo.toISOString());

        if (recentReqError) throw recentReqError;

        const { data: recentValidations, error: recentValError } =
          await supabase
            .from("requirement_validation")
            .select("created_at, status")
            .gte("created_at", oneWeekAgo.toISOString());

        if (recentValError) throw recentValError;

        // Process weekly data
        const weeklyData: {
          [key: string]: { requirements: number; validated: number };
        } = {};

        // Initialize the last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split("T")[0];
          weeklyData[dateString] = { requirements: 0, validated: 0 };
        }

        // Fill in requirements data
        recentRequirements.forEach((req) => {
          const dateString = new Date(req.created_at)
            .toISOString()
            .split("T")[0];
          if (weeklyData[dateString]) {
            weeklyData[dateString].requirements += 1;
          }
        });

        // Fill in validation data
        recentValidations.forEach((val) => {
          const dateString = new Date(val.created_at)
            .toISOString()
            .split("T")[0];
          if (weeklyData[dateString]) {
            weeklyData[dateString].validated += 1;
          }
        });

        // Convert to array and sort by date
        const weeklyProgress = Object.entries(weeklyData)
          .map(([date, counts]) => ({
            date,
            requirements: counts.requirements,
            validated: counts.validated,
          }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        // Get recent activity
        // For a real implementation, you might have an activity log table
        // For now, we'll use recent changes to requirements and validations
        const { data: recentActivity, error: activityError } = await supabase
          .from("requirements")
          .select("id, project_name, created_at, updated_at, status")
          .order("updated_at", { ascending: false })
          .limit(5);

        if (activityError) throw activityError;

        const formattedActivity = recentActivity.map((item) => ({
          id: item.id,
          user: "System User", // In a real app, you would have user info
          action:
            item.status === "Completed"
              ? "Completed"
              : item.status === "Draft"
              ? "Updated"
              : "Added",
          item: item.project_name,
          timestamp: item.updated_at || item.created_at,
        }));

        // Set the dashboard data
        setData({
          requirementStats,
          validationStats,
          testCoverage,
          weeklyProgress,
          recentActivity: formattedActivity,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  return { data, loading, error };
}
