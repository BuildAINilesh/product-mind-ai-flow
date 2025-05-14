import React from "react";

interface StatusBadgeProps {
  status: string;
  showForItemType?: "userStories" | "useCases" | "testCases" | "all";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showForItemType = "all",
}) => {
  // Don't render badge for user stories, use cases, and test cases when specifically set
  if (
    showForItemType === "userStories" ||
    showForItemType === "useCases" ||
    showForItemType === "testCases"
  ) {
    return null;
  }

  const normalizedStatus = status?.toLowerCase() || "";

  if (normalizedStatus.includes("complet")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-sm font-medium">Completed</span>
      </div>
    );
  } else if (normalizedStatus.includes("fail")) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <span className="text-sm font-medium">Failed</span>
      </div>
    );
  } else if (
    normalizedStatus.includes("re-draft") ||
    normalizedStatus.includes("redraft")
  ) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
        <span className="text-sm font-medium">Re-Draft</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
      <span className="text-sm font-medium">Draft</span>
    </div>
  );
};

export default StatusBadge;
