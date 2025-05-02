
import { BookOpen, Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisContentSection } from "./AnalysisContentSection";

interface DocumentInformationCardProps {
  projectOverview: string | null;
  problemStatement: string | null;
  proposedSolution: string | null;
}

export const DocumentInformationCard = ({
  projectOverview,
  problemStatement,
  proposedSolution
}: DocumentInformationCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Document Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnalysisContentSection
            icon={<BookOpen className="h-5 w-5 text-primary" />}
            title="Project Overview"
            description="A quick summary of the project idea and objective"
            content={projectOverview}
          />

          <AnalysisContentSection
            icon={<Target className="h-5 w-5 text-primary" />}
            title="Problem Statement"
            description="The problem the product/feature is solving"
            content={problemStatement}
          />

          <AnalysisContentSection
            icon={<Lightbulb className="h-5 w-5 text-primary" />}
            title="Proposed Solution"
            description="How this product/feature will solve the problem"
            content={proposedSolution}
          />
        </div>
      </CardContent>
    </Card>
  );
};
