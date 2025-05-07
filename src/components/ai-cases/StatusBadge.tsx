
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  showForItemType?: "userStories" | "useCases" | "testCases" | "all";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showForItemType = "all" }) => {
  // Don't render badge for user stories, use cases, and test cases when specifically set
  if (
    (showForItemType === "userStories") || 
    (showForItemType === "useCases") || 
    (showForItemType === "testCases")
  ) {
    return null;
  }

  const normalizedStatus = status?.toLowerCase() || "";

  if (normalizedStatus.includes("complet")) {
    return <Badge variant="success" className="bg-green-500">Completed</Badge>;
  } else if (normalizedStatus.includes("fail")) {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="secondary">Draft</Badge>;
};

export default StatusBadge;
