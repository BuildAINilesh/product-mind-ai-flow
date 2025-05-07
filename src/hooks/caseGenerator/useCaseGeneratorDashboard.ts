
import { useState, useEffect } from "react";
import { ForgeFlowItem } from "./types";
import { getCaseGeneratorItems } from "@/services/caseGeneratorService";

export const useCaseGeneratorDashboard = () => {
  const [caseGeneratorItems, setCaseGeneratorItems] = useState<ForgeFlowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataFetchAttempted, setDataFetchAttempted] = useState<boolean>(false);

  // Fetch case generator items for dashboard view
  useEffect(() => {
    const fetchCaseGeneratorItems = async () => {
      setLoading(true);
      try {
        const data = await getCaseGeneratorItems();
        setCaseGeneratorItems(data);
      } catch (error) {
        console.error("Error fetching case generator items:", error);
      } finally {
        setLoading(false);
        setDataFetchAttempted(true);
      }
    };

    fetchCaseGeneratorItems();
  }, []);

  return {
    caseGeneratorItems,
    loading,
    dataFetchAttempted
  };
};
