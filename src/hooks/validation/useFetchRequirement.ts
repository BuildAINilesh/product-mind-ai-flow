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
      console.log(
        "%c[Requirement Fetch] Starting requirement fetch for:",
        "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;",
        {
          reqId,
          decodedReqId,
          isValidReqId: /^REQ-\d{2}-\d{2}$/.test(decodedReqId),
          isValidUUID:
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              decodedReqId
            ),
        }
      );

      // First try to find the requirement by req_id (REQ-XX-XX format)
      let { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("req_id", decodedReqId)
        .maybeSingle();

      console.log(
        "%c[Requirement Fetch] req_id lookup result:",
        "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;",
        { found: !!data, error: error?.message, data }
      );

      // If not found by req_id, try by internal UUID (id)
      if (!data && !error) {
        console.log(
          "%c[Requirement Fetch] Not found by req_id, trying internal UUID...",
          "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;"
        );

        ({ data, error } = await supabase
          .from("requirements")
          .select("*")
          .eq("id", decodedReqId)
          .maybeSingle());

        console.log(
          "%c[Requirement Fetch] UUID lookup result:",
          "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;",
          { found: !!data, error: error?.message, data }
        );
      }

      if (error) {
        console.error(
          "%c[Requirement Fetch] Error fetching requirement:",
          "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
          error
        );
        toast.error("Failed to load requirement details");
        setError("Failed to load requirement details");
        setDataFetchAttempted(true);
        return null;
      }

      if (!data) {
        console.log(
          "%c[Requirement Fetch] Requirement not found with ID or req_id, trying case-insensitive search...",
          "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;"
        );

        // Try case-insensitive search as fallback
        const { data: altData, error: altError } = await supabase
          .from("requirements")
          .select("*")
          .ilike("req_id", decodedReqId)
          .maybeSingle();

        console.log(
          "%c[Requirement Fetch] Case-insensitive lookup result:",
          "background: #4B5563; color: white; padding: 2px 5px; border-radius: 3px;",
          { found: !!altData, error: altError?.message, data: altData }
        );

        if (altError || !altData) {
          console.error(
            "%c[Requirement Fetch] All search methods failed for ID:",
            "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
            decodedReqId
          );
          toast.error(`Requirement with ID ${decodedReqId} not found`);
          setError(`Requirement with ID ${decodedReqId} not found`);
          setDataFetchAttempted(true);
          return null;
        }

        console.log(
          "%c[Requirement Fetch] Found requirement using case-insensitive search:",
          "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
          altData
        );
        setRequirement(altData);
        setDataFetchAttempted(true);
        return altData;
      }

      console.log(
        "%c[Requirement Fetch] Found requirement successfully:",
        "background: #10B981; color: white; padding: 2px 5px; border-radius: 3px;",
        data
      );
      setRequirement(data);
      setDataFetchAttempted(true);
      return data;
    } catch (error: any) {
      console.error(
        "%c[Requirement Fetch] Exception fetching requirement:",
        "background: #EF4444; color: white; padding: 2px 5px; border-radius: 3px;",
        error
      );
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
    setDataFetchAttempted,
  };
};
