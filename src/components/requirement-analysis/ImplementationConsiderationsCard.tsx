
import { AlertTriangle, CheckSquare, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisContentSection } from "./AnalysisContentSection";

interface ImplementationConsiderationsCardProps {
  constraintsAssumptions: string | null;
  risksMitigations: string | null;
  acceptanceCriteria: string | null;
}

export const ImplementationConsiderationsCard = ({
  constraintsAssumptions,
  risksMitigations,
  acceptanceCriteria
}: ImplementationConsiderationsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Implementation Considerations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnalysisContentSection
            icon={<Lock className="h-5 w-5 text-primary" />}
            title="Constraints & Assumptions"
            description="Technical, operational, legal constraints; and any assumptions made"
            content={constraintsAssumptions}
          />

          <AnalysisContentSection
            icon={<AlertTriangle className="h-5 w-5 text-primary" />}
            title="Risks & Mitigations"
            description="What risks exist? How can they be mitigated?"
            content={risksMitigations}
          />

          <AnalysisContentSection
            icon={<CheckSquare className="h-5 w-5 text-primary" />}
            title="Acceptance Criteria"
            description="High-level conditions for 'success' of this requirement"
            content={acceptanceCriteria}
          />
        </div>
      </CardContent>
    </Card>
  );
};
