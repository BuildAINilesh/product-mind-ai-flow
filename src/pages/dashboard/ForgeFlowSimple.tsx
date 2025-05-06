import React from "react";
import { Card } from "@/components/ui/card";

const ForgeFlowSimple: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ForgeFlow AI - Simple Version</h1>
        <p className="text-slate-500">
          This is a simplified version to diagnose rendering issues
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Simplified Content</h2>
        <p>
          If you can see this page, the basic component rendering is working
          correctly. The issue might be with the hooks or data fetching in the
          full version.
        </p>
      </Card>
    </div>
  );
};

export default ForgeFlowSimple;
