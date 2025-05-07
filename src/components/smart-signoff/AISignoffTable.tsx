
import { useState } from "react";
import { Clock, Check, X, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BRDRequirement } from "@/types/smart-signoff";

interface AISignoffTableProps {
  requirements: BRDRequirement[];
  onViewDetails: (requirement: BRDRequirement) => void;
}

export const AISignoffTable = ({ 
  requirements,
  onViewDetails
}: AISignoffTableProps) => {
  // Filter to show only requirements that need signoff (ready status)
  const pendingSignoffs = requirements.filter(req => 
    req.status === "ready" || req.status === "draft"
  );

  const getStatusBadgeVariant = (status: "draft" | "ready" | "signed_off" | "rejected") => {
    switch (status) {
      case "signed_off": return "success";
      case "rejected": return "destructive";
      case "ready": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Requirement</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead>Stakeholders</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingSignoffs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <AlertTriangle className="h-10 w-10 mb-2" />
                  <p>No requirements pending signoff</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pendingSignoffs.map((req) => (
              <TableRow key={req.id} className="group hover:bg-muted/50">
                <TableCell className="font-medium">{req.title}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {req.req_id}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(req.status)}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`h-2 w-8 rounded-full mr-2 ${
                      req.qualityScore >= 90 ? "bg-green-500" :
                      req.qualityScore >= 70 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`} />
                    <span className="text-xs">{req.qualityScore}%</span>
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {req.lastUpdated}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(req)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
