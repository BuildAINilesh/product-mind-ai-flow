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

// Simple animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<number>();
  React.useEffect(() => {
    let start = 0;
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

  // Animated stats
  const totalCount = useCountUp(totalItems);
  const approvedCount = useCountUp(approvedItems);
  const pendingCount = useCountUp(pendingItems);
  const rejectedCount = useCountUp(rejectedItems);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-100 animate-gradient-x p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight drop-shadow-lg">AI Signoff</h1>
        <p className="text-lg text-slate-500">AI-powered requirement signoff management with comprehensive review and approval workflow</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 justify-items-center">
        {/* Total Requirements */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-blue-400 transition-all duration-200 max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow">
              <FileText className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Total Requirements</span>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-900 animate-countup">{totalCount}</h2>
        </Card>
        {/* Approved */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow">
              <Check className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Approved</span>
          </div>
          <h2 className="text-3xl font-extrabold text-green-900 animate-countup">{approvedCount}</h2>
        </Card>
        {/* Pending */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-amber-400 transition-all duration-200 max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Pending</span>
          </div>
          <h2 className="text-3xl font-extrabold text-amber-900 animate-countup">{pendingCount}</h2>
        </Card>
        {/* Rejected */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-red-400 transition-all duration-200 max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow">
              <AlertTriangle className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Rejected</span>
          </div>
          <h2 className="text-3xl font-extrabold text-red-900 animate-countup">{rejectedCount}</h2>
        </Card>
      </div>
      {/* Table Section */}
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Signoff Analysis</h2>
            <p className="text-slate-500">View and manage your AI-powered signoff analysis</p>
          </div>
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search signoffs..."
              className="pl-12 pr-4 py-3 rounded-full w-full bg-white/70 border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow transition text-base"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="large" />
          </div>
        ) : !dataFetchAttempted || signoffItems.length === 0 ? (
          <EmptyState
            title="No signoffs yet"
            description="Select a requirement to begin the signoff process."
            icon={<FileText className="h-12 w-12" />}
          />
        ) : (
          <div className="overflow-x-auto animate-fadeIn">
            <Table className="min-w-full rounded-2xl overflow-hidden">
              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Requirement ID</TableHead>
                  <TableHead className="whitespace-nowrap">Project</TableHead>
                  <TableHead className="whitespace-nowrap">Industry</TableHead>
                  <TableHead className="whitespace-nowrap">Created</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signoffItems.map((item, idx) => (
                  <TableRow key={item.id} className="hover:bg-blue-100/60 transition-all duration-200 cursor-pointer animate-fadeIn" style={{ animationDelay: `${idx * 40}ms` }}>
                    <TableCell className="whitespace-nowrap font-mono text-blue-900 font-semibold">{item.reqId || "N/A"}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-semibold text-slate-800 flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow bg-gradient-to-br from-blue-400 to-blue-600">{item.projectName?.[0] || "P"}</span>
                      {item.projectName}
                    </TableCell>
                    <TableCell className="capitalize text-slate-700">{item.industry}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">{item.created}</TableCell>
                    <TableCell>{renderStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <Link
                        to={`/dashboard/signoff?requirementId=${item.requirementId}`}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
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
    </div>
  );
};

export default AISignoffDashboard;
