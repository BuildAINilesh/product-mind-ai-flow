
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AIGradientText } from "@/components/ui/ai-elements";
import { useIsMobile } from "@/hooks/use-mobile";

export interface MarketAnalysisHeaderProps {
  projectName?: string;
  requirementId?: string;
  showBackButton?: boolean;
}

export const MarketAnalysisHeader = ({ 
  projectName, 
  requirementId,
  showBackButton = true
}: MarketAnalysisHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const getHeaderText = () => {
    if (projectName && requirementId) {
      return isMobile ? projectName : `${projectName} (${requirementId})`;
    }
    return "MarketSense AI";
  };

  return (
    <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
      <div className="flex-1 min-w-0">
        <h2 className={`text-xl md:text-2xl font-bold ${projectName ? '' : 'flex items-center gap-2'}`}>
          {projectName ? (
            <>
              {getHeaderText()}
            </>
          ) : (
            <>
              MarketSense <AIGradientText>AI</AIGradientText>
            </>
          )}
        </h2>
        {projectName ? (
          <p className="text-muted-foreground mt-1 text-sm md:text-base truncate">
            Market analysis for {requirementId}
          </p>
        ) : (
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            AI-powered market analysis for your product requirements
          </p>
        )}
      </div>
      
      {showBackButton && (
        <div>
          <Button 
            onClick={() => navigate('/dashboard/market-sense')}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            {isMobile ? "Back" : "Back to All Analyses"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysisHeader;
