
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFetchRequirement = () => {
  const [requirement, setRequirement] = useState<any>(null);
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  const fetchRequirement = async (reqId: string) => {
    setIsRequirementLoading(true);
    setError(null);

    try {
      // Decode the reqId in case it was URL encoded
      const decodedReqId = decodeURIComponent(reqId);
      console.log("Fetching requirement with ID:", reqId);
      console.log("Decoded ID:", decodedReqId);

      // First try to find the requirement by req_id (REQ-XX-XX format)
      let { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("req_id", decodedReqId)
        .maybeSingle();

      // If not found by req_id, try by internal UUID (id)
      if (!data && !error) {
        console.log("Not found by req_id, trying internal UUID...");

        ({ data, error } = await supabase
          .from("requirements")
          .select("*")
          .eq("id", decodedReqId)
          .maybeSingle());
      }

      if (error) {
        console.error("Error fetching requirement:", error);
        toast.error("Failed to load requirement details");
        setError("Failed to load requirement details");
        setDataFetchAttempted(true);
        return null;
      }

      if (!data) {
        console.error("Requirement not found with ID or req_id:", decodedReqId);
        console.log("Trying case-insensitive search...");

        // Try case-insensitive search as fallback
        const { data: altData, error: altError } = await supabase
          .from("requirements")
          .select("*")
          .ilike("req_id", decodedReqId)
          .maybeSingle();

        if (altError || !altData) {
          console.error("All search methods failed for ID:", decodedReqId);
          toast.error(`Requirement with ID ${decodedReqId} not found`);
          setError(`Requirement with ID ${decodedReqId} not found`);
          setDataFetchAttempted(true);
          return null;
        }

        console.log(
          "Found requirement using case-insensitive search:",
          altData
        );
        setRequirement(altData);
        setDataFetchAttempted(true);
        return altData;
      }

      console.log("Found requirement:", data);
      setRequirement(data);
      setDataFetchAttempted(true);
      return data;
    } catch (error: any) {
      console.error("Error fetching requirement:", error);
      toast.error("Failed to load requirement details");
      setError(error.message || "Failed to load requirement details");
      setDataFetchAttempted(true);
      return null;
    } finally {
      setIsRequirementLoading(false);
    }
  };

  return { 
    requirement, 
    isRequirementLoading, 
    error, 
    dataFetchAttempted, 
    fetchRequirement, 
    setRequirement,
    setError,
    setDataFetchAttempted
  };
};
