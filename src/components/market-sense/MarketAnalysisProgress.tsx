
import { Loader, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type ProcessStep = {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  current?: number;
  total?: number;
};

interface MarketAnalysisProgressProps {
  progressSteps: ProcessStep[];
  currentStep: number;
}

export const MarketAnalysisProgress = ({ 
  progressSteps, 
  currentStep 
}: MarketAnalysisProgressProps) => {
  
  const renderStepIndicator = (step: ProcessStep, index: number) => {
    const isActive = index === currentStep;
    const getStatusIcon = () => {
      switch (step.status) {
        case "completed":
          return <Check className="h-4 w-4 text-green-500" />;
        case "processing":
          return <Loader className="h-4 w-4 animate-spin" />;
        case "failed":
          return <div className="h-4 w-4 rounded-full bg-red-500"></div>;
        default:
          return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
      }
    };
    
    // Calculate progress percentage
    let progressPercentage = 0;
    if (step.status === "completed") {
      progressPercentage = 100;
    } else if (step.status === "processing") {
      if (step.current !== undefined && step.total) {
        progressPercentage = Math.floor((step.current / step.total) * 100);
      } else {
        progressPercentage = isActive ? 50 : 0;
      }
    }
    
    return (
      <div key={index} className="mb-2">
        <div className="flex items-center mb-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
            step.status === "completed" ? "bg-green-100" :
            step.status === "processing" ? "bg-blue-100" :
            step.status === "failed" ? "bg-red-100" : "bg-gray-100"
          }`}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm ${
            step.status === "completed" ? "text-green-700" :
            step.status === "processing" ? "text-blue-700 font-medium" :
            step.status === "failed" ? "text-red-700" : "text-gray-500"
          }`}>
            {step.name}
            {step.current !== undefined && step.total ? 
              <span className="ml-1 text-xs font-normal text-slate-500">
                ({step.current}/{step.total})
              </span> : null}
          </span>
        </div>
        {(step.status === "processing" || step.status === "completed") && (
          <Progress 
            value={progressPercentage}
            className="h-1 mb-2" 
            indicatorClassName={step.status === "completed" ? "bg-green-500" : "bg-blue-500"}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-accent/10">
      <h3 className="text-lg font-medium mb-3">Analysis in Progress</h3>
      <div className="space-y-1">
        {progressSteps.map((step, index) => renderStepIndicator(step, index))}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Please don't navigate away from this page. The analysis process may take a few minutes to complete.
      </p>
    </div>
  );
};

export default MarketAnalysisProgress;
