
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIBackground, AIGradientText } from "@/components/ui/ai-elements";
import { useNavigate } from "react-router-dom";

interface MarketAnalysisHeaderProps {
  projectName?: string;
  showBackButton?: boolean;
  requirementId?: string | null;
}

export const MarketAnalysisHeader = ({ 
  projectName, 
  showBackButton = true,
  requirementId
}: MarketAnalysisHeaderProps) => {
  const navigate = useNavigate();
  
  const handleValidatorClick = () => {
    if (requirementId) {
      navigate(`/dashboard/validator?requirementId=${requirementId}`);
    }
  };
  
  return (
    <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
          <p className="text-muted-foreground mt-1">
            {projectName 
              ? `AI-powered market analysis for ${projectName}` 
              : "AI-powered market analysis"
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          {requirementId && (
            <Button 
              onClick={handleValidatorClick}
              className="flex items-center gap-1"
              variant="outline"
            >
              <ShieldCheck className="h-4 w-4" />
              AI Validator
            </Button>
          )}
          
          {showBackButton && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market Analyses
            </Button>
          )}
        </div>
      </div>
    </AIBackground>
  );
};

export default MarketAnalysisHeader;
