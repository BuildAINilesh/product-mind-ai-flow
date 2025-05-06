
import { AIBackground, AIGradientText } from "@/components/ui/ai-elements";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ValidationDashboardHeaderProps {
  showBackButton?: boolean;
  requirementId?: string | null;
  projectName?: string;
}

const ValidationDashboardHeader = ({
  showBackButton = true,
  requirementId,
  projectName,
}: ValidationDashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <AIBackground
      variant="neural"
      intensity="medium"
      className="rounded-lg mb-6 p-6"
    >
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold">
            AI <AIGradientText>Validator</AIGradientText>
          </h2>
          {projectName ? (
            <p className="text-muted-foreground mt-1">
              {projectName} <span className="text-xs">({requirementId})</span>
            </p>
          ) : (
            <p className="text-muted-foreground mt-1">
              Evaluate requirements for quality, completeness, and market fit
            </p>
          )}
        </div>

        {showBackButton && (
          <Button
            onClick={() => navigate("/dashboard/validator")}
            variant="outline"
            className="flex items-center gap-2"
          >
            Back to Validation Dashboard
          </Button>
        )}
      </div>
    </AIBackground>
  );
};

export default ValidationDashboardHeader;
