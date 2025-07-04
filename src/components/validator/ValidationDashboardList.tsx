import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords } from "@/utils/formatters";

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

  // Render status badge with icon
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (
      normalizedStatus === "analyzing" ||
      normalizedStatus === "processing"
    ) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">{status}</span>
        </div>
      );
    } else if (normalizedStatus === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          <span className="text-sm font-medium">{status}</span>
        </div>
      );
    }
  };

  return (
    <div className="rounded-3xl shadow-2xl bg-white/80 p-0 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 px-2 pt-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Validation Analysis
          </h2>
          <p className="text-slate-500">
            View and manage your AI-powered requirement validation analysis
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search validations..."
            className="pl-12 pr-4 py-3 rounded-full w-full bg-white/70 border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow transition text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading validations...</p>
        </div>
      ) : filteredValidations.length > 0 ? (
        <div className="overflow-x-auto animate-fadeIn">
          <Table className="min-w-full rounded-2xl overflow-hidden">
            <TableHeader className="bg-slate-50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="whitespace-nowrap text-lg">ID</TableHead>
                <TableHead className="w-[300px] text-lg">Project</TableHead>
                <TableHead className="text-lg">Industry</TableHead>
                <TableHead className="text-lg">Created</TableHead>
                <TableHead className="text-lg">Status</TableHead>
                <TableHead className="text-right text-lg">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredValidations.map((validation) => (
                <TableRow
                  key={validation.id}
                  className="hover:bg-indigo-50/60 transition cursor-pointer"
                  onClick={() =>
                    handleViewValidation(validation.requirements?.id || "")
                  }
                >
                  <TableCell className="font-medium text-base">
                    {validation.requirements?.req_id || "N/A"}
                  </TableCell>
                  <TableCell className="text-base">
                    {validation.requirements?.project_name || "Unknown Project"}
                  </TableCell>
                  <TableCell className="text-base">
                    {capitalizeWords(validation.requirements?.industry_type) ||
                      "N/A"}
                  </TableCell>
                  <TableCell className="text-base">
                    {formatDate(validation.created_at)}
                  </TableCell>
                  <TableCell className="text-base">
                    {renderStatusBadge(validation.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewValidation(validation.requirements?.id || "");
                      }}
                      className="bg-gradient-to-r from-indigo-500 to-indigo-700 hover:opacity-90 text-white rounded-full px-5 py-2 shadow"
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
              : "You haven't created any requirements to validate yet. Start by creating a requirement and then validate it."}
          </p>
          <Button
            onClick={handleNavigateToRequirements}
            className="rounded-full px-6 py-2 text-base"
          >
            Create Requirement
          </Button>
        </div>
      )}
    </div>
  );
};

export default ValidationDashboardList;
