
import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Loader from "@/components/shared/Loader";

interface CasePendingGenerationProps {
  icon: LucideIcon;
  title: string;
  isGenerating: boolean;
  inProgress?: boolean;
  onGenerate: () => void;
}

const CasePendingGeneration: React.FC<CasePendingGenerationProps> = ({
  icon: Icon,
  title,
  isGenerating,
  inProgress = false,
  onGenerate,
}) => {
  return (
    <div className="bg-slate-50 p-8 rounded-md text-center">
      <Icon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-medium mb-2">
        {inProgress ? "Generation in Progress" : "Pending Generation"}
      </h3>
      <p className="text-slate-500 mb-4">
        {inProgress
          ? "Generation in progress, please wait..."
          : `Generate ${title} from the requirement to see them here.`}
      </p>
      <Button
        onClick={onGenerate}
        disabled={isGenerating || inProgress}
      >
        {isGenerating ? "Generating..." : `Generate ${title}`}
      </Button>
    </div>
  );
};

export default CasePendingGeneration;
