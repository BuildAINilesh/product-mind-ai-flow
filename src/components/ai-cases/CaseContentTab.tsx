
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loader from "@/components/shared/Loader";
import StatusBadge from "./StatusBadge";
import CasePendingGeneration from "./CasePendingGeneration";
import CaseItemCard from "./CaseItemCard";
import { LucideIcon } from "lucide-react";

interface CaseContentTabProps {
  title: string;
  icon: LucideIcon;
  status: string;
  items: Array<{ id: string; content: string; status: string }>;
  type: "userStories" | "useCases" | "testCases";
  isGenerating: boolean;
  onGenerate: () => void;
}

const CaseContentTab: React.FC<CaseContentTabProps> = ({
  title,
  icon: Icon,
  status,
  items,
  type,
  isGenerating,
  onGenerate,
}) => {
  const isDraft = status === "Draft";
  const isInProgress = status === "In Progress" || status === "in-progress";

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center">
          <StatusBadge status={status} />
          <Button
            variant="outline"
            disabled={isGenerating}
            onClick={onGenerate}
            className="ml-3 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader size="small" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>
                  {status === "Draft" || status === "Failed"
                    ? "Generate"
                    : "Regenerate"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {isDraft ? (
        <CasePendingGeneration 
          icon={Icon} 
          title={title} 
          isGenerating={isGenerating} 
          onGenerate={onGenerate} 
        />
      ) : items.length > 0 ? (
        items.map((item, index) => (
          <CaseItemCard
            key={item.id}
            item={item}
            index={index}
            type={type}
          />
        ))
      ) : (
        <CasePendingGeneration
          icon={Icon}
          title={title}
          isGenerating={isGenerating}
          inProgress={isInProgress}
          onGenerate={onGenerate}
        />
      )}
    </>
  );
};

export default CaseContentTab;
