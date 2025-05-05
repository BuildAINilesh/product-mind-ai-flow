
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileSearch } from "lucide-react";

interface MissingAnalysisProps {
  requirementId: string;
  onNavigateToRequirement: (id: string) => void;
}

const MissingAnalysis = ({ requirementId, onNavigateToRequirement }: MissingAnalysisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirement Analysis Required</CardTitle>
        <CardDescription>
          This requirement needs to be analyzed first
        </CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-6">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
        </div>
        <h3 className="text-xl font-medium mb-3">Analysis Required</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Before validating this requirement, you need to analyze it first.
          Please go to the Requirement Analysis page to generate insights.
        </p>
        <Button 
          variant="outline"
          onClick={() => onNavigateToRequirement(requirementId)}
        >
          <FileSearch className="h-4 w-4 mr-2" />
          View Requirement
        </Button>
      </CardContent>
    </Card>
  );
};

export default MissingAnalysis;
