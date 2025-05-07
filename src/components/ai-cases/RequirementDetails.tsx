
import React from "react";
import { Card } from "@/components/ui/card";

interface RequirementDetailsProps {
  requirement: {
    id: string;
    projectName: string;
    industry: string;
    created: string;
    description: string;
    req_id?: string;
  };
}

const RequirementDetails: React.FC<RequirementDetailsProps> = ({
  requirement,
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">Requirement Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">ID</p>
          <p className="text-slate-900">{requirement.req_id || requirement.id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Project</p>
          <p className="text-slate-900">{requirement.projectName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Industry</p>
          <p className="text-slate-900">{requirement.industry}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Created</p>
          <p className="text-slate-900">{requirement.created}</p>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-500 mb-1">
        Requirement Text
      </p>
      <p className="text-slate-900 p-4 bg-slate-50 rounded-md">
        {requirement.description}
      </p>
    </Card>
  );
};

export default RequirementDetails;
