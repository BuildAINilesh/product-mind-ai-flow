
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, AlertTriangle, ShieldCheck } from "lucide-react";
import { RequirementData, RequirementAnalysisData, MarketAnalysisData, ResearchSource } from "@/hooks/useMarketAnalysis";
import MarketAnalysisProgress from "./MarketAnalysisProgress";
import MarketAnalysisContent from "./MarketAnalysisContent";
import type { ProcessStep } from "./MarketAnalysisProgress";

interface MarketAnalysisDetailProps {
  requirement: RequirementData | null;
  requirementAnalysis: RequirementAnalysisData | null;
  marketAnalysis: MarketAnalysisData | null;
  researchSources: ResearchSource[];
  analysisInProgress: boolean;
  progressSteps: ProcessStep[];
  currentStep: number;
  onGenerateAnalysis: () => Promise<void>;
}

export const MarketAnalysisDetail = ({ 
  requirement,
  requirementAnalysis,
  marketAnalysis,
  researchSources,
  analysisInProgress,
  progressSteps,
  currentStep,
  onGenerateAnalysis
}: MarketAnalysisDetailProps) => {
  const navigate = useNavigate();
  
  if (!requirement) {
    return null;
  }
  
  const handleValidatorClick = () => {
    navigate(`/dashboard/validator?requirementId=${requirement.req_id}`);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {requirement?.req_id} - {requirement?.project_name}
              {marketAnalysis?.status && (
                <Badge variant={marketAnalysis.status === 'Completed' ? 'default' : 'outline'}>
                  {marketAnalysis.status}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Industry: {requirement?.industry_type}
            </CardDescription>
          </div>
          
          {!marketAnalysis?.market_trends && !analysisInProgress && (
            <Button
              onClick={onGenerateAnalysis}
              disabled={!requirementAnalysis}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Market Analysis
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Progress UI when analysis is in progress */}
        {analysisInProgress && (
          <MarketAnalysisProgress progressSteps={progressSteps} currentStep={currentStep} />
        )}
        
        {/* Display market analysis if available */}
        {marketAnalysis?.market_trends && (
          <MarketAnalysisContent marketAnalysis={marketAnalysis} researchSources={researchSources} />
        )}
        
        {/* Display a message if no analysis and we're not in progress */}
        {!marketAnalysis?.market_trends && !analysisInProgress && (
          <Alert variant="default" className="bg-muted/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No market analysis available</AlertTitle>
            <AlertDescription>
              Click the "Generate Market Analysis" button to start the AI-powered market analysis process.
              This will research current market trends, competition, and strategic recommendations for this requirement.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      {/* Add a footer with Validator button when market analysis is completed */}
      {marketAnalysis?.market_trends && (
        <CardFooter className="pt-6 border-t flex justify-between">
          <Button 
            onClick={handleValidatorClick}
            className="flex items-center gap-2"
            variant="validator"
          >
            <ShieldCheck className="h-4 w-4" /> 
            AI Validator
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MarketAnalysisDetail;
