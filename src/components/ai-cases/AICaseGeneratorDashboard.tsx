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
import {
  SearchIcon,
  CodeIcon,
  BookIcon,
  TestTubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshIcon,
} from "@/components/icons";
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

const projectColors = [
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-green-400 to-green-600",
  "bg-gradient-to-br from-pink-400 to-pink-600",
  "bg-gradient-to-br from-orange-400 to-orange-600",
];

const AICaseGeneratorDashboard: React.FC<AICaseGeneratorDashboardProps> = ({
  caseGeneratorItems,
  loading,
  dataFetchAttempted,
  hideMetrics = false,
}) => {
  console.log("AICaseGeneratorDashboard rendering with props:", {
    itemsCount: caseGeneratorItems.length,
    loading,
    dataFetchAttempted,
    hideMetrics,
  });

  // Calculate summary statistics
  const totalItems = caseGeneratorItems.length;

  const completedUserStories = caseGeneratorItems.filter(
    (item) => item.userStoriesStatus === "completed"
  ).length;

  const completedUseCases = caseGeneratorItems.filter(
    (item) => item.useCasesStatus === "completed"
  ).length;

  const completedTestCases = caseGeneratorItems.filter(
    (item) => item.testCasesStatus === "completed"
  ).length;

  // Animated stats
  const totalCount = useCountUp(totalItems);
  const userStoriesCount = useCountUp(completedUserStories);
  const useCasesCount = useCountUp(completedUseCases);
  const testCasesCount = useCountUp(completedTestCases);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-purple-100 animate-gradient-x p-6">
      {/* Stats Cards - Only show if hideMetrics is false */}
      {!hideMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 justify-items-center">
          {/* Total Requirements */}
          <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Requirements
                </h3>
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                  <SearchIcon className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <h2 className="text-3xl font-bold">{totalCount}</h2>
            </div>
          </Card>

          {/* User Stories */}
          <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  User Stories
                </h3>
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600">
                  <BookIcon className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <h2 className="text-3xl font-bold">{userStoriesCount}</h2>
            </div>
          </Card>

          {/* Use Cases */}
          <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Use Cases
                </h3>
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600">
                  <CodeIcon className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <h2 className="text-3xl font-bold">{useCasesCount}</h2>
            </div>
          </Card>

          {/* Test Cases */}
          <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Test Cases
                </h3>
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
                  <TestTubeIcon className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <h2 className="text-3xl font-bold">{testCasesCount}</h2>
            </div>
          </Card>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Case Generator Analysis
            </h2>
            <p className="text-slate-500">
              View and manage your AI-powered requirement analysis
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search analysis..."
              className="pl-12 pr-4 py-3 rounded-full w-full bg-white/70 border border-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow transition text-base"
            />
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader size="large" />
          </div>
        ) : dataFetchAttempted && caseGeneratorItems.length === 0 ? (
          <EmptyState
            title="No case analysis found"
            description="You haven't created any requirements to analyze yet. Start by creating a requirement and then generate cases for it."
            icon={<CodeIcon className="h-8 w-8 text-slate-400" />}
            actionLabel="Create Requirement"
            actionLink="/dashboard/requirements/new"
          />
        ) : (
          <div className="overflow-x-auto animate-fadeIn">
            <Table className="min-w-full rounded-2xl overflow-hidden">
              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="whitespace-nowrap">
                    Requirement ID
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Project</TableHead>
                  <TableHead className="whitespace-nowrap">Industry</TableHead>
                  <TableHead className="whitespace-nowrap">Created</TableHead>
                  <TableHead className="whitespace-nowrap">
                    User Stories
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Use Cases</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Test Cases
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseGeneratorItems.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-blue-100/60 transition-all duration-200 cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell className="whitespace-nowrap font-mono text-blue-900 font-semibold">
                      {item.reqId || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate font-semibold text-slate-800 flex items-center gap-3">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow ${
                          projectColors[idx % projectColors.length]
                        }`}
                      >
                        {item.projectName?.[0] || "P"}
                      </span>
                      {item.projectName}
                    </TableCell>
                    <TableCell className="capitalize text-slate-700">
                      {item.industry}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">
                      {item.created}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(item.userStoriesStatus)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(item.useCasesStatus)}
                    </TableCell>
                    <TableCell>
                      {renderStatusBadge(item.testCasesStatus)}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/dashboard/ai-cases?requirementId=${item.requirementId}`}
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

export default AICaseGeneratorDashboard;
