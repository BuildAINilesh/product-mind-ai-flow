
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MarketAnalysisHeader from "./MarketAnalysisHeader";

interface NotFoundDisplayProps {
  requirementId?: string | null;
}

export const NotFoundDisplay = ({ requirementId }: NotFoundDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AI Case Generator</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/ai-cases')}
          className="gap-1"
        >
          Back to AI Case Generator
        </Button>
      </div>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Requirement Not Found</CardTitle>
          <CardDescription>
            We couldn't find the requirement you're looking for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>The requirement with ID "{requirementId}" could not be found. It may have been deleted or you may not have access to it.</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard/ai-cases')}
          >
            Back to Case Analyses
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFoundDisplay;
