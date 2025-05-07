
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, RefreshCw } from "lucide-react";
import Loader from "@/components/shared/Loader";

interface AICaseGeneratorHeaderProps {
  isGenerating: boolean;
  handleGenerateAll: () => void;
}

const AICaseGeneratorHeader: React.FC<AICaseGeneratorHeaderProps> = ({
  isGenerating,
  handleGenerateAll,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Link
          to="/dashboard/ai-cases"
          className="text-slate-500 hover:text-slate-700"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">AI Case Analysis</h1>
      </div>
      <Button
        variant="default"
        disabled={isGenerating}
        onClick={handleGenerateAll}
        className="flex items-center space-x-2"
      >
        {isGenerating ? (
          <>
            <Loader size="small" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Generate All</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default AICaseGeneratorHeader;
