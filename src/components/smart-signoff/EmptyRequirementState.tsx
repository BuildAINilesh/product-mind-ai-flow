
import { FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyRequirementState = () => {
  return (
    <Card>
      <CardContent className="p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <FileCheck className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Select a Requirement</h3>
        <p className="text-muted-foreground max-w-md">
          Choose a requirement from the list to view details and approve or reject it.
        </p>
      </CardContent>
    </Card>
  );
};
