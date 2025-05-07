
import React from "react";
import { Card } from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import { AIGradientText } from "@/components/ui/ai-elements";

interface CaseItemCardProps {
  item: {
    id: string;
    content: string;
    status: string;
    actor?: string;
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
        <h3 className="text-sm font-medium">{getItemTitle()}</h3>
        <StatusBadge status={item.status || "Draft"} showForItemType={type} />
      </div>
      
      {/* Special formatting for user stories to include actor */}
      {type === "userStories" && item.actor && (
        <div className="mb-2">
          <span className="text-sm font-medium text-slate-700">Actor: </span>
          <AIGradientText variant="neural" className="text-sm font-medium">{item.actor}</AIGradientText>
        </div>
      )}
      
      <p className="text-slate-600 whitespace-pre-line">{item.content || "No content available"}</p>
    </Card>
  );
};

export default CaseItemCard;
