
import React from "react";
import { Card } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";

interface CaseItemCardProps {
  item: {
    id: string;
    content: string;
    status: string;
  };
  index: number;
  type: "userStories" | "useCases" | "testCases";
}

const CaseItemCard: React.FC<CaseItemCardProps> = ({ item, index, type }) => {
  const getItemTitle = () => {
    switch (type) {
      case "userStories":
        return `User Story #${index + 1}`;
      case "useCases":
        return `Use Case #${index + 1}`;
      case "testCases":
        return `Test Case #${index + 1}`;
      default:
        return `Item #${index + 1}`;
    }
  };

  return (
    <Card key={item.id} className="p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{getItemTitle()}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-slate-600 whitespace-pre-line">{item.content}</p>
    </Card>
  );
};

export default CaseItemCard;
