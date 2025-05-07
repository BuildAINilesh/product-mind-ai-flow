
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
      console.log("Fetching all validations");
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching validations:", error);
        toast.error("Failed to load validations");
        throw error;
      }

      console.log("Fetched validations:", data);
      if (data) {
        setValidations(data);
      }
      setDataFetchAttempted(true);
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Failed to load validations");
      setError("Failed to load validations");
    } finally {
      setLoading(false);
    }
  };

  return { validations, loading, error, dataFetchAttempted, fetchValidations, setError };
};
