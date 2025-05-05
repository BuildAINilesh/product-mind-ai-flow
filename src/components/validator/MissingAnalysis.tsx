
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileSearch, BrainCircuit } from "lucide-react";

interface MissingAnalysisProps {
  requirementId: string;
  onNavigateToRequirement: (id: string) => void;
}

const MissingAnalysis = ({ requirementId, onNavigateToRequirement }: MissingAnalysisProps) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          Ready for Analysis
        </CardTitle>
        <CardDescription>
          This requirement needs to be analyzed first
        </CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-[#9b87f5]/10 mb-6">
          <BrainCircuit className="h-12 w-12 text-[#9b87f5]" />
        </div>
        <h3 className="text-xl font-medium mb-3">Analysis Required</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          This requirement hasn't been analyzed yet. Before validating this requirement, 
          you need to analyze it first. Click the "Analyze" button to generate the AI-powered analysis.
        </p>
        <Button 
          variant="default"
          className="bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
          onClick={() => onNavigateToRequirement(requirementId)}
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          Analyze Requirement
        </Button>
      </CardContent>
    </Card>
  );
};

export default MissingAnalysis;
