
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MarketAnalysisHeader from "./MarketAnalysisHeader";

interface ErrorDisplayProps {
  message?: string;
}

export const ErrorDisplay = ({ message = "Failed to load market analysis data." }: ErrorDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-4 md:space-y-6">
      <MarketAnalysisHeader />
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive text-base md:text-lg">Error Loading Data</CardTitle>
          <CardDescription className="text-sm">
            We encountered a problem while loading the market analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm md:text-base">
          <p>{message}</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/market-sense')}
            size="sm"
            className="w-full md:w-auto"
          >
            Back to Market Analyses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ErrorDisplay;
