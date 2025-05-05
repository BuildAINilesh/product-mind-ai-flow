
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

interface ValidationIntroProps {
  onValidate: () => void;
  isValidating: boolean;
}

const ValidationIntro = ({ onValidate, isValidating }: ValidationIntroProps) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-[#9b87f5]" /> 
          AI Validation
        </CardTitle>
        <CardDescription>
          Validate this requirement against market data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">No validation available</h3>
              <p className="text-sm text-muted-foreground">
                Click the "Start Validation" button to begin the AI-powered validation process. This will evaluate the 
                requirement against market data to determine market readiness, identify strengths, risks, and provide 
                recommendations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pt-2">
          <Button
            variant="validator"
            size="lg"
            className="gap-2"
            onClick={onValidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Start Validation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationIntro;
