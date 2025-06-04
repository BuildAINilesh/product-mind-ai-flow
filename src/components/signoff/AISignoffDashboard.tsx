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
import { capitalizeWords } from "@/utils/formatters";

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
  hideMetrics?: boolean;
}

// Simple animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<number>();
  React.useEffect(() => {
    const start = 0;
    const step = (timestamp: number) => {
      if (!ref.current) ref.current = timestamp;
      const progress = Math.min((timestamp - ref.current) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    setCount(0);
    ref.current = undefined;
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [end]);
  return count;
}

const AISignoffDashboard: React.FC<AISignoffDashboardProps> = ({
  signoffItems,
  loading,
  dataFetchAttempted,
  hideMetrics = false,
}) => {
  console.log("AISignoffDashboard rendering with props:", {
    itemsCount: signoffItems.length,
    loading,
    dataFetchAttempted,
    hideMetrics,
  });

  // Calculate summary statistics with improved status mapping
  const totalItems = signoffItems.length;

  const approvedItems = signoffItems.filter((item) => {
    const status = item.status?.toLowerCase() || "";
    return status === "signed_off" || status === "approved";
  }).length;

  const pendingItems = signoffItems.filter((item) => {
    const status = item.status?.toLowerCase() || "";
    return (
      status === "draft" ||
      status === "pending" ||
      status === "ready" ||
      status === "review" ||
      status === "under review"
    );
  }).length;

  const rejectedItems = signoffItems.filter((item) => {
    const status = item.status?.toLowerCase() || "";
    return status === "rejected";
  }).length;

  // Animated stats
  const totalCount = useCountUp(totalItems);
  const approvedCount = useCountUp(approvedItems);
  const pendingCount = useCountUp(pendingItems);
  const rejectedCount = useCountUp(rejectedItems);

  // Improved status badge renderer
  const renderStatusBadge = (status: string) => {
    if (!status)
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          <span className="text-sm font-medium">Pending</span>
        </div>
      );

    status = status.toLowerCase();
    if (status === "approved" || status === "signed_off") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (status === "pending" || status === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else if (status === "rejected") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Rejected</span>
        </div>
      );
    } else if (
      status === "review" ||
      status === "ready" ||
      status === "under review"
    ) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">Ready for Review</span>
        </div>
      );
    } else if (status === "error") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
        <span className="text-sm font-medium">{status}</span>
      </div>
    );
  };

  return (
    <div className="rounded-3xl shadow-2xl bg-white/80 p-0 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 px-2 pt-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Signoff Analysis
          </h2>
          <p className="text-slate-500">
            View and manage your AI-powered signoff analysis
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search signoffs..."
            className="pl-12 pr-4 py-3 rounded-full w-full bg-white/70 border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow transition text-base"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="large" />
        </div>
      ) : dataFetchAttempted && signoffItems.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="inline-flex p-3 rounded-full bg-muted mb-4">
            <SearchIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-medium mb-2">No signoffs found</h3>
          <p className="max-w-md mx-auto mb-6">
            {"You haven't created any requirements to sign off yet. Start by creating a requirement and then sign off."}
          </p>
          <Link
            to="/dashboard/requirements/new"
            className="rounded-full px-6 py-2 text-base bg-indigo-500 text-white hover:bg-indigo-600 transition"
          >
            Create Requirement
          </Link>
        </div>
      ) : (
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
              {signoffItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-indigo-50/60 transition cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/signoff?requirementId=${item.requirementId}`}
                >
                  <TableCell className="font-medium text-base">{item.reqId || "N/A"}</TableCell>
                  <TableCell className="text-base">{item.projectName}</TableCell>
                  <TableCell className="capitalize text-base">{capitalizeWords(item.industry)}</TableCell>
                  <TableCell className="whitespace-nowrap text-base">{item.created}</TableCell>
                  <TableCell className="text-base">{renderStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/dashboard/signoff?requirementId=${item.requirementId}`}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-full shadow hover:opacity-90 transition"
                      onClick={e => e.stopPropagation()}
                    >
                      <SearchIcon className="h-4 w-4" /> View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AISignoffDashboard;
