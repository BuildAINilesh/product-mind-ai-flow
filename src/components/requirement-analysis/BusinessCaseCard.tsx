
import { BarChart, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisContentSection } from "./AnalysisContentSection";

interface BusinessCaseCardProps {
  businessGoals: string | null;
  targetAudience: string | null;
  competitiveLandscape: string | null;
}

export const BusinessCaseCard = ({
  businessGoals,
  targetAudience,
  competitiveLandscape
}: BusinessCaseCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Business Case</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <AnalysisContentSection
            icon={<BarChart className="h-5 w-5 text-primary" />}
            title="Business Goals & Success Metrics"
            description="What business outcomes are expected? (Example: user growth, revenue, efficiency)"
            content={businessGoals}
          />

          <AnalysisContentSection
            icon={<Users className="h-5 w-5 text-primary" />}
            title="Target Audience / Users"
            description="Who will use this product? Personas, segments"
            content={targetAudience}
          />

          <AnalysisContentSection
            icon={<Globe className="h-5 w-5 text-primary" />}
            title="Competitive Landscape Summary"
            description="Quick snapshot from MarketSense AI module: competitors, gaps identified"
            content={competitiveLandscape}
          />
        </div>
      </CardContent>
    </Card>
  );
};
