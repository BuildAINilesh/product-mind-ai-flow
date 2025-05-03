
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const LimitedDataAlert = () => {
  return (
    <Alert>
      <Info className="h-5 w-5 text-blue-500" />
      <AlertDescription>
        This requirement has been marked as completed but is showing limited analysis details.
        You may need to run a full analysis to see all sections.
        <span className="block mt-1 text-xs text-muted-foreground">
          Note: If you recently changed your database schema, ensure all column references match your current schema.
        </span>
      </AlertDescription>
    </Alert>
  );
};
