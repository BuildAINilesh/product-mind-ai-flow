import React from "react";
import { Link } from "react-router-dom";
import { ForgeFlowItem } from "@/hooks/useCaseGenerator";
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
} from "@/components/icons";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";

interface AICaseGeneratorDashboardProps {
  caseGeneratorItems: ForgeFlowItem[];
  loading: boolean;
  dataFetchAttempted: boolean;
}

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

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    if (status === "completed") {
      return <Badge variant="success">Completed</Badge>;
    } else if (status === "in-progress") {
      return <Badge variant="warning">In Progress</Badge>;
    } else if (status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Case Generator</h1>
        <p className="text-slate-500">
          AI-powered generation of user stories, use cases, and test cases for
          your requirements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <SearchIcon className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium">Total Requirements</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{totalItems}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BookIcon className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium">User Stories</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{completedUserStories}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CodeIcon className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Use Cases</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{completedUseCases}</h2>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TestTubeIcon className="h-6 w-6 text-amber-600" />
            <span className="text-sm font-medium">Test Cases</span>
          </div>
          <h2 className="text-3xl font-bold mt-2">{completedTestCases}</h2>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">
            Case Generator Analyses
          </h2>
          <p className="text-slate-500 mb-4">
            View and manage your AI-powered requirement analyses
          </p>

          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search analyses..."
                className="pl-10 pr-4 py-2 border rounded-md w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size="large" />
            </div>
          ) : dataFetchAttempted && caseGeneratorItems.length === 0 ? (
            <EmptyState
              title="No case analyses yet"
              description="Select a requirement to generate user stories, use cases, and test cases."
              icon={<CodeIcon className="h-12 w-12" />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>User Stories</TableHead>
                  <TableHead>Use Cases</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseGeneratorItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.projectName}</TableCell>
                    <TableCell>{item.industry}</TableCell>
                    <TableCell>{item.created}</TableCell>
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICaseGeneratorDashboard;
