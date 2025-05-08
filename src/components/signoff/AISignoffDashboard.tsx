import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchIcon } from "@/components/icons";
import { Check, FileText, ClipboardCheck, AlertTriangle } from "lucide-react";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";

interface SignoffItem {
  id: string;
  requirementId: string;
  reqId: string | null;
  projectName: string;
  industry: string;
  created: string;
  status: string;
  reviewerComments: string | null;
}

interface AISignoffDashboardProps {
  signoffItems: SignoffItem[];
  loading: boolean;
  dataFetchAttempted: boolean;
}

const AISignoffDashboard: React.FC<AISignoffDashboardProps> = ({
  signoffItems,
  loading,
  dataFetchAttempted,
}) => {
  console.log("AISignoffDashboard rendering with props:", {
    itemsCount: signoffItems.length,
    loading,
    dataFetchAttempted,
  });

  // Calculate summary statistics
  const totalItems = signoffItems.length;

  const approvedItems = signoffItems.filter(
    (item) => item.status === "Approved"
  ).length;

  const pendingItems = signoffItems.filter(
    (item) => item.status === "Pending"
  ).length;

  const rejectedItems = signoffItems.filter(
    (item) => item.status === "Rejected"
  ).length;

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>;

    status = status.toLowerCase();
    if (status === "approved" || status === "signed_off") {
      return <Badge variant="success">Approved</Badge>;
    } else if (status === "pending" || status === "draft") {
      return <Badge variant="warning">Pending</Badge>;
    } else if (status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (status === "review" || status === "ready") {
      return <Badge variant="secondary">Under Review</Badge>;
    } else if (status === "error") {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Signoff</h1>
        <p className="text-slate-500">
          AI-powered requirement signoff management with comprehensive review
          and approval workflow
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Total Requirements</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{totalItems}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Check className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Approved</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{approvedItems}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{pendingItems}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{rejectedItems}</h2>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Requirement Signoffs</h2>
          <p className="text-slate-500 mb-4">
            View and manage signoff status for your requirements
          </p>

          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search signoffs..."
                className="pl-10 pr-4 py-2 border rounded-md w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size="large" />
            </div>
          ) : !dataFetchAttempted || signoffItems.length === 0 ? (
            <EmptyState
              title="No signoffs yet"
              description="Select a requirement to begin the signoff process."
              icon={<FileText className="h-12 w-12" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      Requirement ID
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Project</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Industry
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Created</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signoffItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {item.reqId || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {item.projectName}
                      </TableCell>
                      <TableCell>{item.industry}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.created}
                      </TableCell>
                      <TableCell>{renderStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/signoff?requirementId=${item.requirementId}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISignoffDashboard;
