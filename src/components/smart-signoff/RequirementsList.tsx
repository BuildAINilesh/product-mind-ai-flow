
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BRDRequirement } from "@/types/smart-signoff";

interface RequirementsListProps {
  requirements: BRDRequirement[];
  selectedRequirement: BRDRequirement | null;
  onSelectRequirement: (requirement: BRDRequirement) => void;
}

export const RequirementsList = ({
  requirements,
  selectedRequirement,
  onSelectRequirement,
}: RequirementsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requirements</CardTitle>
        <CardDescription>
          Requirements pending approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requirements.map((req) => (
            <div 
              key={req.id}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                selectedRequirement?.id === req.id 
                  ? "bg-primary/5 border-primary/30" 
                  : "hover:bg-muted"
              }`}
              onClick={() => onSelectRequirement(req)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{req.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{req.req_id}</code>
                    <Badge variant={
                      req.status === "signed_off" ? "default" :
                      req.status === "rejected" ? "destructive" :
                      req.status === "ready" ? "outline" : "secondary"
                    }>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center gap-1">
                <div className="flex -space-x-2">
                  {req.stakeholders.slice(0, 3).map((stakeholder) => (
                    <Avatar key={stakeholder.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={stakeholder.avatar} />
                      <AvatarFallback className="text-xs">
                        {stakeholder.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {req.stakeholders.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                      +{req.stakeholders.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {req.stakeholders.filter(s => s.approved).length}/{req.stakeholders.length} approved
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
