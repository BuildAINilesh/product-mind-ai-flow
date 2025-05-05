
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, BrainCircuit } from "lucide-react";

const ValidationInProgress = () => {
  const [progress, setProgress] = useState(10);
  const messages = [
    "Analyzing requirement details...",
    "Evaluating against market standards...",
    "Identifying potential risks and strengths...",
    "Calculating market readiness score...",
    "Generating recommendations..."
  ];
  
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 700);
    
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);
  
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          AI Validation in Progress
        </CardTitle>
        <CardDescription>
          Please wait while our AI analyzes the requirement and market data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-10">
        <div className="animate-pulse flex flex-col items-center max-w-md">
          <div className="p-3 rounded-full bg-[#9b87f5]/10 mb-6">
            <Sparkles className="h-12 w-12 text-[#9b87f5]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">Processing Your Requirement</h3>
          <p className="text-center mb-6 text-muted-foreground">
            {messages[messageIndex]}
          </p>
          <div className="w-full mb-2">
            <Progress value={progress} className="h-2 w-full" />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This may take up to 1-2 minutes to complete
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidationInProgress;
