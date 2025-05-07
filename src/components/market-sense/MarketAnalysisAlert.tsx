
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const MarketAnalysisAlert = () => {
  const isMobile = useIsMobile();
  
  return (
    <Alert variant="default" className="bg-muted/50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No market analysis available</AlertTitle>
      <AlertDescription className="text-sm md:text-base">
        Click the {isMobile ? '"Generate"' : '"Generate Market Analysis"'} button to start the
        AI-powered market analysis process. This will research current
        market trends, competition, and strategic recommendations for this
        requirement.
      </AlertDescription>
    </Alert>
  );
};

export default MarketAnalysisAlert;
