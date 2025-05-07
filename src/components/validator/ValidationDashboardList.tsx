import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ValidationDashboardListProps {
  validations: ValidationItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ValidationDashboardList = ({
  validations,
  loading,
  searchQuery,
  setSearchQuery,
}: ValidationDashboardListProps) => {
  const navigate = useNavigate();

  const handleViewValidation = (validationRequirementId: string) => {
    navigate(`/dashboard/validator?requirementId=${validationRequirementId}`);
  };

  const handleNavigateToRequirements = () => {
    navigate("/dashboard/requirements");
  };

  const filteredValidations = validations.filter(
    (validation) =>
      validation?.requirements?.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      validation?.requirements?.req_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      validation?.requirements?.industry_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      validation?.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format the date string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "analyzing":
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
      default:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Validation Analyses</CardTitle>
        <CardDescription>
          View and manage your AI-powered requirement validations for all
          projects
        </CardDescription>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search validations..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
            <p className="ml-2">Loading validations...</p>
          </div>
        ) : filteredValidations.length > 0 ? (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-[300px]">Project</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidations.map((validation) => (
                  <TableRow key={validation.id}>
                    <TableCell className="font-medium">
                      {validation.requirements?.req_id || "N/A"}
                    </TableCell>
                    <TableCell>
                      {validation.requirements?.project_name ||
                        "Unknown Project"}
                    </TableCell>
                    <TableCell>
                      {validation.requirements?.industry_type || "N/A"}
                    </TableCell>
                    <TableCell>{formatDate(validation.created_at)}</TableCell>
                    <TableCell>
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded-full inline-flex ${getStatusBadgeClass(
                          validation.status
                        )}`}
                      >
                        {validation.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleViewValidation(
                            validation.requirements?.id || ""
                          )
                        }
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      >
                        View Validation
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="inline-flex p-3 rounded-full bg-muted mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-medium mb-2">No validations found</h3>
            <p className="max-w-md mx-auto mb-6">
              {searchQuery
                ? "Try adjusting your search to find what you're looking for."
                : "You haven't validated any requirements yet. Go to a requirement and start the validation process."}
            </p>
            <Button onClick={handleNavigateToRequirements}>
              Browse Requirements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ValidationDashboardList;
