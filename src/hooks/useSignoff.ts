import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Tables } from "@/integrations/supabase/types";

interface SignoffItem {
  id: string;
  requirementId: string;
  reqId: string | null;
  projectName: string;
  industry: string;
  created: string;
  status: string;
  reviewerComments: string | null;
}

type RequirementData = Tables<"requirements">;
type SignoffDetails = Tables<"requirement_brd">;

// Define the data we expect from the join
interface SignoffJoinResult {
  id: string;
  requirement_id: string;
  status: string;
  reviewer_comments: string | null;
  created_at: string;
  requirements: {
    id: string;
    req_id: string | null;
    project_name: string;
    industry_type: string;
  } | null;
}

export const useSignoff = (requirementId?: string | null) => {
  const [signoffItems, setSignoffItems] = useState<SignoffItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [requirement, setRequirement] = useState<RequirementData | null>(null);
  const [signoffDetails, setSignoffDetails] = useState<SignoffDetails | null>(
    null
  );
  const [isRequirementLoading, setIsRequirementLoading] =
    useState<boolean>(true);
  const [dataFetchAttempted, setDataFetchAttempted] = useState<boolean>(false);
  const [refreshTimestamp, setRefreshTimestamp] = useState<number>(Date.now());
  const { toast } = useToast();

  // Function to force a refresh of the data
  const refreshData = useCallback(() => {
    console.log("Forcing refresh of signoff data");
    setRefreshTimestamp(Date.now());
  }, []);

  // Fetch the signoff items for the dashboard
  useEffect(() => {
    const fetchSignoffItems = async () => {
      setLoading(true);
      console.log("Fetching signoff items at:", new Date().toISOString());

      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("No authenticated user found");
          setSignoffItems([]);
          setDataFetchAttempted(true);
          setLoading(false);
          return;
        }

        // First get user's requirements
        const { data: userRequirements, error: userReqError } = await supabase
          .from("requirements")
          .select("id")
          .eq("user_id", user.id);

        if (
          userReqError ||
          !userRequirements ||
          userRequirements.length === 0
        ) {
          console.log("User has no requirements");
          setSignoffItems([]);
          setDataFetchAttempted(true);
          setLoading(false);
          return;
        }

        // Get requirement IDs for this user
        const userRequirementIds = userRequirements.map((req) => req.id);

        // Now fetch brd data directly - try simpler approach with minimal data
        const result = await supabase
          .from("requirement_brd")
          .select("id, requirement_id, status, created_at")
          .in("requirement_id", userRequirementIds);

        if (result.error) {
          console.error("Error fetching requirement_brd:", result.error);
          throw result.error;
        }

        console.log("Successfully fetched BRD data:", result.data);

        // If we have results, try to get the requirement data for each
        if (result.data && result.data.length > 0) {
          // Fetch requirement details
          const reqResult = await supabase
            .from("requirements")
            .select("id, req_id, project_name, industry_type")
            .in(
              "id",
              result.data.map((item) => item.requirement_id)
            );

          if (reqResult.error) {
            console.error("Error fetching requirements:", reqResult.error);
            throw reqResult.error;
          }

          // Create a map for lookups
          interface RequirementInfo {
            id: string;
            req_id?: string | null;
            project_name?: string;
            industry_type?: string;
          }
          const reqMap: Record<string, RequirementInfo> = {};
          reqResult.data?.forEach((req) => {
            reqMap[req.id] = req;
          });

          // Format the data but filter out any with missing requirement data
          const formatted = result.data
            .filter((item) => reqMap[item.requirement_id]) // Only include BRDs with valid requirements
            .map((item) => ({
              id: item.id,
              requirementId: item.requirement_id,
              reqId: reqMap[item.requirement_id]?.req_id || "",
              projectName: reqMap[item.requirement_id]?.project_name || "",
              industry: reqMap[item.requirement_id]?.industry_type || "",
              created: new Date(item.created_at).toLocaleDateString(),
              status: item.status || "draft",
              reviewerComments: null,
            }));

          setSignoffItems(formatted);
        } else {
          setSignoffItems([]);
        }

        setDataFetchAttempted(true);
      } catch (error: unknown) {
        console.error("Error fetching signoff items:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load signoff data";
        toast({
          title: "Error fetching signoff data",
          description: errorMessage,
          variant: "destructive",
        });
        setSignoffItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSignoffItems();
  }, [toast, refreshTimestamp]);

  // Fetch specific requirement and its signoff details if requirementId is provided
  useEffect(() => {
    if (!requirementId) {
      setIsRequirementLoading(false);
      return;
    }

    const fetchRequirementDetails = async () => {
      setIsRequirementLoading(true);

      try {
        // Fetch the requirement
        const { data: reqData, error: reqError } = await supabase
          .from("requirements")
          .select("*")
          .eq("id", requirementId)
          .single();

        if (reqError) {
          throw reqError;
        }

        setRequirement(reqData);

        // Fetch the signoff details for this requirement
        const { data: signoffData, error: signoffError } = await supabase
          .from("requirement_brd")
          .select("*")
          .eq("requirement_id", requirementId)
          .single();

        if (signoffError && signoffError.code !== "PGRST116") {
          // PGRST116 is "not found"
          throw signoffError;
        }

        setSignoffDetails(signoffData || null);
        setDataFetchAttempted(true);
      } catch (error: unknown) {
        console.error("Error fetching requirement details:", error);
        const err = error as { code?: string; message?: string };
        if (err.code !== "PGRST116") {
          // Don't show error for "not found"
          const errorMessage = err.message || "Failed to load requirement data";
          toast({
            title: "Error fetching requirement details",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } finally {
        setIsRequirementLoading(false);
      }
    };

    fetchRequirementDetails();
  }, [requirementId, toast, refreshTimestamp]);

  return {
    signoffItems,
    loading,
    requirement,
    signoffDetails,
    isRequirementLoading,
    dataFetchAttempted,
    refreshData,
  };
};
