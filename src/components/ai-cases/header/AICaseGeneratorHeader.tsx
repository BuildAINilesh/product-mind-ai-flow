import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  RefreshCw,
  Clipboard,
  ClipboardCheck,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AICaseGeneratorHeaderProps {
  isGenerating: boolean;
  handleGenerateAll: () => void;
  requirementId: string;
}

const AICaseGeneratorHeader: React.FC<AICaseGeneratorHeaderProps> = ({
  isGenerating,
  handleGenerateAll,
  requirementId,
}) => {
  const navigate = useNavigate();
  const [isMovingToSignoff, setIsMovingToSignoff] = React.useState(false);

  const handleMoveToSignoff = async () => {
    if (!requirementId) {
      toast.error("Requirement ID is missing");
      return;
    }

    setIsMovingToSignoff(true);

    try {
      console.log("Moving requirement to AI Signoff:", requirementId);

      // Check if a signoff record already exists
      const { data: existingData, error: checkError } = await supabase
        .from("requirement_brd")
        .select("id")
        .eq("requirement_id", requirementId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking for existing record:", checkError);
        toast.error(
          `Failed to check existing AI Signoff record: ${checkError.message}`
        );
        setIsMovingToSignoff(false);
        return;
      }

      // If no record exists, create one
      if (!existingData) {
        console.log("No existing record found, creating new one");

        // Simpler direct insert with error logging
        const { data, error: insertError } = await supabase
          .from("requirement_brd")
          .insert({
            requirement_id: requirementId,
            status: "draft",
            brd_document: {}, // Add empty object as default value for brd_document
          })
          .select();

        if (insertError) {
          console.error("Error creating AI Signoff record:", insertError);
          toast.error(
            `Failed to create AI Signoff record: ${insertError.message}`
          );
          setIsMovingToSignoff(false);
          return;
        }

        console.log("Created AI Signoff record:", data);
        toast.success("Requirement moved to AI Signoff");
      } else {
        console.log("AI Signoff record already exists");
        toast.info("Requirement already in AI Signoff");
      }

      // Navigate to the AI Signoff page for this requirement
      navigate(
        `/dashboard/signoff?requirementId=${encodeURIComponent(requirementId)}`
      );
    } catch (error: unknown) {
      console.error("Error in AI Signoff process:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to move requirement to AI Signoff: ${errorMessage}`);
    } finally {
      setIsMovingToSignoff(false);
    }
  };

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
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={isMovingToSignoff}
          onClick={handleMoveToSignoff}
          className="flex items-center gap-2"
        >
          {isMovingToSignoff ? (
            <>
              <Loader size="small" />
              <span>Moving to Signoff...</span>
            </>
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4" />
              <span>Move to AI Signoff</span>
            </>
          )}
        </Button>
        <Button
          variant="default"
          disabled={isGenerating}
          onClick={handleGenerateAll}
          className="flex items-center gap-2"
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
    </div>
  );
};

export default AICaseGeneratorHeader;
