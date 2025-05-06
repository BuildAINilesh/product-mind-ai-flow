
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Validations Dashboard</CardTitle>
          <Button onClick={handleNavigateToRequirements}>
            View Requirements
          </Button>
        </div>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search validations..."
              className="pl-9 w-full"
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
          <div className="space-y-4">
            {filteredValidations.map((validation) => (
              <Card
                key={validation.id}
                className="border p-4 hover:bg-muted/30 transition cursor-pointer"
                onClick={() =>
                  handleViewValidation(validation.requirements?.req_id || "")
                }
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      {validation.requirements?.project_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {validation.requirements?.req_id} ·{" "}
                      {validation.requirements?.industry_type}
                    </p>
                    {validation.validation_summary && (
                      <p className="mt-2 text-sm line-clamp-2">
                        {validation.validation_summary}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                      validation.status === "Completed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {validation.status}
                    </div>
                    {validation.readiness_score !== null && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Score:</span>
                          <span className={`text-sm font-bold ${
                            (validation.readiness_score || 0) >= 80
                              ? "text-green-600 dark:text-green-400"
                              : (validation.readiness_score || 0) >= 60
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }`}>
                            {validation.readiness_score}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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
