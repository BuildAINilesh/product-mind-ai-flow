
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status?.toLowerCase() || "";

  if (normalizedStatus.includes("complet")) {
    return <Badge variant="success" className="bg-green-500">Completed</Badge>;
  } else if (normalizedStatus.includes("progress") || normalizedStatus.includes("in progress")) {
    return <Badge variant="warning" className="bg-amber-500">In Progress</Badge>;
  } else if (normalizedStatus.includes("fail")) {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="secondary">Draft</Badge>;
};

export default StatusBadge;
