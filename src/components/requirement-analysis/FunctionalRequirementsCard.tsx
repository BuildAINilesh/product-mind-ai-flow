
import { List, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisContentSection } from "./AnalysisContentSection";

interface FunctionalRequirementsCardProps {
  keyFeatures: string | null;
  userStories: string | null;
}

export const FunctionalRequirementsCard = ({
  keyFeatures,
  userStories
}: FunctionalRequirementsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Functional Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnalysisContentSection
            icon={<List className="h-5 w-5 text-primary" />}
            title="Key Features & Requirements"
            description="List major features or functionalities needed"
            content={keyFeatures}
          />

          <AnalysisContentSection
            icon={<User className="h-5 w-5 text-primary" />}
            title="User Stories"
            description="High-level user journeys if applicable"
            content={userStories}
          />
        </div>
      </CardContent>
    </Card>
  );
};
