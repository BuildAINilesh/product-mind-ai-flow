
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (status === "completed" || status === "Completed") {
    return <Badge variant="success" className="bg-green-500">Completed</Badge>;
  } else if (status === "in-progress" || status === "In Progress") {
    return <Badge variant="warning" className="bg-amber-500">In Progress</Badge>;
  } else if (status === "failed" || status === "Failed") {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="secondary">Draft</Badge>;
};

export default StatusBadge;
