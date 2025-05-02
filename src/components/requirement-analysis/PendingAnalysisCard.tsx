
import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PendingAnalysisCard = () => {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="w-12 h-12 text-muted-foreground/60 mb-4" />
          <h3 className="text-lg font-medium mb-2">Requirement Analysis Pending</h3>
          <p className="text-muted-foreground">
            This requirement needs to be analyzed first. Use the "Analyze" button to start the process.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
