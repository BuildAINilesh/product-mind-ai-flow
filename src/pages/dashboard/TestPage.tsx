
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon } from "@/components/icons";
import { Separator } from "@/components/ui/separator";

const TestPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <CardTitle>System Status: Online</CardTitle>
          </div>
          <CardDescription>
            Your application is running correctly. This page confirms that React routing is working as expected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-green-500">Routing Active</Badge>
            <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
              Components Loaded
            </Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background rounded-md p-3 shadow-sm border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Current Path</p>
                <p className="font-mono text-sm break-all">{window.location.pathname}</p>
              </div>
              <div className="bg-background rounded-md p-3 shadow-sm border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Full URL</p>
                <p className="font-mono text-sm break-all">{window.location.href}</p>
              </div>
              <div className="bg-background rounded-md p-3 shadow-sm border">
                <p className="text-sm font-medium text-muted-foreground mb-1">React Version</p>
                <p className="font-mono text-sm">{React.version}</p>
              </div>
              <div className="bg-background rounded-md p-3 shadow-sm border">
                <p className="text-sm font-medium text-muted-foreground mb-1">User Agent</p>
                <p className="font-mono text-sm break-all">{navigator.userAgent}</p>
              </div>
            </div>
          </div>
          
          <Alert className="mt-6">
            <AlertTitle>All systems operational</AlertTitle>
            <AlertDescription>
              This test page confirms your React application is rendering correctly.
              If you can see this content, your routing configuration is working properly.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestPage;
