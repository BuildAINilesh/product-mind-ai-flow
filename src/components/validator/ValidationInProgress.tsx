
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

const ValidationInProgress = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Validation in Progress</CardTitle>
        <CardDescription>
          Please wait while our AI analyzes the requirement and market data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <Sparkles className="h-12 w-12 text-[#9b87f5] mb-4" />
          <p className="text-center mb-4">
            AI is evaluating the requirement against market data...
          </p>
          <Progress value={50} className="w-64 h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationInProgress;
