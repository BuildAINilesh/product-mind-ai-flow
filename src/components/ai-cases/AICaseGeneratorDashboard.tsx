import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ForgeFlowItem } from "@/hooks/caseGenerator";
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
import { Button } from "@/components/ui/button";
import {
  SearchIcon,
  CodeIcon,
  BookIcon,
  TestTubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from "@/components/icons";
import { FileQuestion, FileCheck } from "lucide-react";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";

interface AICaseGeneratorDashboardProps {
  caseGeneratorItems: ForgeFlowItem[];
  loading: boolean;
  dataFetchAttempted: boolean;
  hideMetrics?: boolean;
}

// Simple animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = useRef<number>();
  useEffect(() => {
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

const statusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return <CheckCircleIcon className="h-4 w-4 mr-1" />;
    case "in-progress":
      return <RefreshIcon className="h-4 w-4 mr-1 animate-spin" />;
    case "failed":
      return <XCircleIcon className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};

const AICaseGeneratorDashboard: React.FC<AICaseGeneratorDashboardProps> = ({
  caseGeneratorItems,
  loading,
  dataFetchAttempted,
  hideMetrics = false,
}) => {
  // Filter state
  const [activeFilter, setActiveFilter] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Calculate summary statistics
  const totalItems = caseGeneratorItems.length;
  const draftCount = caseGeneratorItems.filter((item) => (item.userStoriesStatus === "draft" || item.useCasesStatus === "draft" || item.testCasesStatus === "draft")).length;
  const completedCount = caseGeneratorItems.filter((item) => (item.userStoriesStatus === "completed" || item.useCasesStatus === "completed" || item.testCasesStatus === "completed")).length;

  // Animated stats
  const totalCount = useCountUp(totalItems);
  const draftCountUp = useCountUp(draftCount);
  const completedCountUp = useCountUp(completedCount);

  // Metric Card
  const StatusMetricCard = ({
    title,
    count,
    icon: Icon,
    colorClass,
    isActive,
    filterKey,
    onClick,
  }: {
    title: string;
    count: number;
    icon: any;
    colorClass: { bg: string; text: string };
    isActive?: boolean;
    filterKey?: string;
    onClick?: (key: string) => void;
  }) => (
    <Card
      className={`p-4 rounded border bg-white max-w-xs w-full mx-auto ${isActive ? "ring-2 ring-primary/20" : ""} ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick && filterKey && onClick(filterKey)}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-slate-700">{title}</h3>
          <span className="flex items-center justify-center h-6 w-6 rounded bg-slate-100">
            <Icon className="h-4 w-4 text-slate-500" />
          </span>
        </div>
        <h2 className="text-2xl text-slate-800 font-normal">{count}</h2>
      </div>
    </Card>
  );

  // Handle metric card clicks (for filtering)
  const handleMetricCardClick = (status: string) => {
    if (activeFilter === status) {
      setActiveFilter(null);
    } else {
      setActiveFilter(status);
    }
  };

  // Filtered items
  const getFilteredItems = () => {
    let filtered = caseGeneratorItems;
    if (activeFilter) {
      filtered = filtered.filter((item) => {
        const statuses = [item.userStoriesStatus, item.useCasesStatus, item.testCasesStatus].map(s => (s || "").toLowerCase());
        return statuses.includes(activeFilter.toLowerCase());
      });
    }
    if (searchQuery) {
      filtered = filtered.filter((item) => {
        return (
          (item.projectName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.reqId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.industry || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    return filtered;
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    if (!status)
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          <span className="text-sm font-medium">Pending</span>
        </div>
      );
    const s = status.toLowerCase();
    if (s === "completed") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (s === "in-progress") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">In Progress</span>
        </div>
      );
    } else if (s === "failed") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Failed</span>
        </div>
      );
    } else if (s === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-400"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else if (s === "re-draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">Re-Draft</span>
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl text-slate-800 mb-2">AI Case Generator Dashboard</h1>
        <p className="text-slate-500">Monitor the generation status of your AI cases</p>
      </div>
      {/* Status Metric Cards */}
      {!hideMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 justify-items-center">
          <StatusMetricCard
            title="Total Cases"
            count={totalCount}
            icon={SearchIcon}
            colorClass={{ bg: "bg-gradient-to-br from-blue-400 to-blue-600", text: "text-white" }}
          />
          <StatusMetricCard
            title="Draft"
            count={draftCountUp}
            icon={FileQuestion}
            filterKey="draft"
            isActive={activeFilter === "draft"}
            onClick={handleMetricCardClick}
            colorClass={{ bg: "bg-gradient-to-br from-amber-400 to-amber-600", text: "text-white" }}
          />
          <StatusMetricCard
            title="Completed"
            count={completedCountUp}
            icon={FileCheck}
            filterKey="completed"
            isActive={activeFilter === "completed"}
            onClick={handleMetricCardClick}
            colorClass={{ bg: "bg-gradient-to-br from-green-400 to-green-600", text: "text-white" }}
          />
        </div>
      )}
      {/* Show filter indicator if filter is active */}
      {activeFilter && (
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
          <div className="flex items-center">
            <span className="text-sm text-slate-700 mr-2">Filtered by status:</span>
            <Badge>{activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveFilter(null)} className="h-8 px-2">Clear filter</Button>
        </div>
      )}
      {/* Table Section */}
      <div className="bg-white rounded-2xl border shadow p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl text-slate-800 mb-1">Case Generator Analysis</h2>
            <p className="text-slate-500">View and manage your AI-powered requirement analysis</p>
          </div>
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search analysis..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2 rounded w-full bg-white border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-base"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="large" />
          </div>
        ) : dataFetchAttempted && getFilteredItems().length === 0 ? (
          <EmptyState
            title="No case analysis found"
            description="You haven't created any requirements to analyze yet. Start by creating a requirement and then generate cases for it."
            icon={<CodeIcon className="h-8 w-8 text-slate-400" />}
            actionLabel="Create Requirement"
            actionLink="/dashboard/requirements/new"
          />
        ) : (
          <div className="overflow-x-auto animate-fadeIn">
            <Table className="min-w-full rounded-xl overflow-hidden border">
              <TableHeader className="bg-slate-100 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Requirement ID</TableHead>
                  <TableHead className="whitespace-nowrap">Project</TableHead>
                  <TableHead className="whitespace-nowrap">Industry</TableHead>
                  <TableHead className="whitespace-nowrap">Created</TableHead>
                  <TableHead className="whitespace-nowrap">User Stories</TableHead>
                  <TableHead className="whitespace-nowrap">Use Cases</TableHead>
                  <TableHead className="whitespace-nowrap">Test Cases</TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getFilteredItems().map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-blue-100/60 transition-all duration-200 cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell className="whitespace-nowrap text-slate-700">{item.reqId || "N/A"}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-slate-800">{item.projectName}</TableCell>
                    <TableCell className="capitalize text-slate-700">{item.industry}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">{item.created}</TableCell>
                    <TableCell>{renderStatusBadge(item.userStoriesStatus)}</TableCell>
                    <TableCell>{renderStatusBadge(item.useCasesStatus)}</TableCell>
                    <TableCell>{renderStatusBadge(item.testCasesStatus)}</TableCell>
                    <TableCell>
                      <Link
                        to={`/dashboard/ai-cases?requirementId=${item.requirementId}`}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-full shadow hover:opacity-90 transition"
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

export default AICaseGeneratorDashboard;
