
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, Shield } from "lucide-react";
import { AIBadge, AICard } from "@/components/ui/ai-elements";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  validation_verdict: string | null;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

interface ValidationListProps {
  validations: ValidationItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onViewValidation: (requirementId: string) => void;
  onNavigateToRequirements: () => void;
}

const ValidationList = ({ 
  validations, 
  searchQuery, 
  onSearchChange,
  onViewValidation,
  onNavigateToRequirements
}: ValidationListProps) => {
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <AIBadge variant="neural">Draft</AIBadge>;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <AIBadge variant="complete">Completed</AIBadge>;
      case "validating":
        return <AIBadge variant="analyzing">Validating</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      default:
        return <AIBadge variant="neural">Draft</AIBadge>;
    }
  };
  
  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;
    
    switch (verdict.toLowerCase()) {
      case "validated":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1 text-white px-2 py-1">
            Validated
          </Badge>
        );
      case "needs_refinement":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1 text-white px-2 py-1">
            Needs Refinement
          </Badge>
        );
      case "high_risk":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1 text-white px-2 py-1">
            High Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AICard>
      <CardHeader>
        <CardTitle>Requirement Validations</CardTitle>
        <CardDescription>
          View and manage your AI-powered requirement validations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search validations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="w-[300px]">Project</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validations.length > 0 ? (
                validations.map((validation) => (
                  <TableRow key={validation.id}>
                    <TableCell className="font-medium">{validation.requirements?.req_id || 'N/A'}</TableCell>
                    <TableCell>{validation.requirements?.project_name || 'Unknown Project'}</TableCell>
                    <TableCell>{validation.requirements?.industry_type || 'N/A'}</TableCell>
                    <TableCell>
                      {getVerdictBadge(validation.validation_verdict)}
                    </TableCell>
                    <TableCell>{validation.readiness_score ? `${validation.readiness_score}/100` : 'Pending'}</TableCell>
                    <TableCell>{new Date(validation.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {getStatusBadge(validation.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="validator"
                        onClick={() => onViewValidation(validation.requirements?.req_id || '')}
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        View Validation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <ShieldCheck className="h-8 w-8 text-muted-foreground/60" />
                      <p>No validations found. Try a different search or validate a requirement.</p>
                      <Button 
                        className="mt-2"
                        variant="outline"
                        onClick={onNavigateToRequirements}
                      >
                        Go to Requirements
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </AICard>
  );
};

export default ValidationList;
