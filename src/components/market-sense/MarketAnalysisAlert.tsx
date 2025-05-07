
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const MarketAnalysisAlert = () => {
  return (
    <Alert variant="default" className="bg-muted/50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No market analysis available</AlertTitle>
      <AlertDescription>
        Click the "Generate Market Analysis" button to start the
        AI-powered market analysis process. This will research current
        market trends, competition, and strategic recommendations for this
        requirement.
      </AlertDescription>
    </Alert>
  );
};

export default MarketAnalysisAlert;
