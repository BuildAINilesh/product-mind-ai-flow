
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const NotFoundCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Not Found</CardTitle>
        <CardDescription>
          The requested project could not be loaded.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Please check the URL or go back to the requirements list.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
