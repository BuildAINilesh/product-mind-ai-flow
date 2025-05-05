
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface ValidationIntroProps {
  onValidate: () => void;
  isValidating: boolean;
}

const ValidationIntro = ({ onValidate, isValidating }: ValidationIntroProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#9b87f5]" /> 
          AI Validation
        </CardTitle>
        <CardDescription>
          Validate this requirement against market data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#9b87f5]/10 mb-4">
            <Shield className="h-10 w-10 text-[#9b87f5]" />
          </div>
          <h3 className="text-lg font-medium mb-2">Ready for Validation</h3>
          <p className="text-muted-foreground max-w-md">
            Let AI evaluate this requirement against market data to determine market readiness,
            identify strengths, risks, and provide recommendations.
          </p>
        </div>
        <Button
          variant="validator"
          size="lg"
          className="gap-2"
          onClick={onValidate}
          disabled={isValidating}
        >
          <Shield className="h-5 w-5" />
          Start Validation
        </Button>
      </CardContent>
    </Card>
  );
};

export default ValidationIntro;
