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
}

// Simple animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = useRef<number>();
  useEffect(() => {
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
}) => {
  console.log("AICaseGeneratorDashboard rendering with props:", {
    itemsCount: caseGeneratorItems.length,
    loading,
    dataFetchAttempted,
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
    if (!status) return (
      <Badge variant="secondary">Pending</Badge>
    );
    const s = status.toLowerCase();
    if (s === "completed") {
      return (
        <Badge className="bg-green-500/90 text-white flex items-center gap-1 px-3 py-1 rounded-full shadow">
          {statusIcon(s)} Completed
        </Badge>
      );
    } else if (s === "in-progress") {
      return (
        <Badge className="bg-yellow-400/90 text-white flex items-center gap-1 px-3 py-1 rounded-full shadow">
          {statusIcon(s)} In Progress
        </Badge>
      );
    } else if (s === "failed") {
      return (
        <Badge className="bg-red-500/90 text-white flex items-center gap-1 px-3 py-1 rounded-full shadow">
          {statusIcon(s)} Failed
        </Badge>
      );
    } else if (s === "draft") {
      return (
        <Badge className="bg-gray-300/90 text-gray-700 flex items-center gap-1 px-3 py-1 rounded-full shadow">
          Draft
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-purple-100 animate-gradient-x p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight drop-shadow-lg">AI Case Generator</h1>
        <p className="text-lg text-slate-500">AI-powered generation of user stories, use cases, and test cases for your requirements</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 justify-items-center">
        {/* Total Requirements */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-blue-400 transition-all duration-200 group animate-fadeIn max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow group-hover:scale-100 transition">
              <SearchIcon className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Total Requirements</span>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-900 animate-countup">{totalCount}</h2>
        </Card>
        {/* User Stories */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-purple-400 transition-all duration-200 group animate-fadeIn max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow group-hover:scale-100 transition">
              <BookIcon className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">User Stories</span>
          </div>
          <h2 className="text-3xl font-extrabold text-purple-900 animate-countup">{userStoriesCount}</h2>
        </Card>
        {/* Use Cases */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 group animate-fadeIn max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow group-hover:scale-100 transition">
              <CodeIcon className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Use Cases</span>
          </div>
          <h2 className="text-3xl font-extrabold text-green-900 animate-countup">{useCasesCount}</h2>
        </Card>
        {/* Test Cases */}
        <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-orange-400 transition-all duration-200 group animate-fadeIn max-w-xs w-full mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow group-hover:scale-100 transition">
              <TestTubeIcon className="h-6 w-6 text-white" />
            </span>
            <span className="text-base font-semibold text-slate-700">Test Cases</span>
          </div>
          <h2 className="text-3xl font-extrabold text-orange-900 animate-countup">{testCasesCount}</h2>
        </Card>
      </div>
      {/* Table Section */}
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Case Generator Analysis</h2>
            <p className="text-slate-500">View and manage your AI-powered requirement analysis</p>
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
            title="No case analysis yet"
            description="Select a requirement to generate user stories, use cases, and test cases."
            icon={<CodeIcon className="h-12 w-12" />}
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
                  <TableHead className="whitespace-nowrap">User Stories</TableHead>
                  <TableHead className="whitespace-nowrap">Use Cases</TableHead>
                  <TableHead className="whitespace-nowrap">Test Cases</TableHead>
                  <TableHead className="whitespace-nowrap">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseGeneratorItems.map((item, idx) => (
                  <TableRow key={item.id} className="hover:bg-blue-100/60 transition-all duration-200 cursor-pointer animate-fadeIn" style={{ animationDelay: `${idx * 40}ms` }}>
                    <TableCell className="whitespace-nowrap font-mono text-blue-900 font-semibold">{item.reqId || "N/A"}</TableCell>
                    <TableCell className="max-w-[180px] truncate font-semibold text-slate-800 flex items-center gap-3">
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-lg shadow ${projectColors[idx % projectColors.length]}`}>{item.projectName?.[0] || "P"}</span>
                      {item.projectName}
                    </TableCell>
                    <TableCell className="capitalize text-slate-700">{item.industry}</TableCell>
                    <TableCell className="whitespace-nowrap text-slate-500">{item.created}</TableCell>
                    <TableCell>{renderStatusBadge(item.userStoriesStatus)}</TableCell>
                    <TableCell>{renderStatusBadge(item.useCasesStatus)}</TableCell>
                    <TableCell>{renderStatusBadge(item.testCasesStatus)}</TableCell>
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
