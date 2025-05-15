import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ValidationItem } from "./types";

export const useFetchValidations = () => {
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  const fetchValidations = async () => {
    setLoading(true);
    try {
      console.log("Fetching validations for current user");

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No authenticated user found");
        setValidations([]);
        setDataFetchAttempted(true);
        return;
      }

      // First get user's requirements
      const { data: userRequirements, error: userReqError } = await supabase
        .from("requirements")
        .select("id")
        .eq("user_id", user.id);

      if (userReqError || !userRequirements || userRequirements.length === 0) {
        console.log("User has no requirements");
        setValidations([]);
        setDataFetchAttempted(true);
        return;
      }

      // Get requirement IDs for this user
      const userRequirementIds = userRequirements.map((req) => req.id);

      // Then fetch validations only for those requirements
      const { data, error } = await supabase
        .from("requirement_validation")
        .select(
          `
          *,
          requirements (
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
        console.error("Error fetching validations:", error);
        toast.error("Failed to load validations");
        throw error;
      }

      console.log("Fetched validations:", data);

      // Only include validations with valid requirement data
      if (data) {
        setValidations(data.filter((item) => item.requirements !== null));
      } else {
        setValidations([]);
      }

      setDataFetchAttempted(true);
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Failed to load validations");
      setError("Failed to load validations");
      setValidations([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    validations,
    loading,
    error,
    dataFetchAttempted,
    fetchValidations,
    setError,
  };
};
