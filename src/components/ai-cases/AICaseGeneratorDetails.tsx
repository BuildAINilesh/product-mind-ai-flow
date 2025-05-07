import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserStory, UseCase, TestCase } from "@/hooks/useCaseGenerator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeftIcon,
  BookIcon,
  CodeIcon,
  TestTubeIcon,
  RefreshIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@/components/icons";
import Loader from "@/components/shared/Loader";

interface AICaseGeneratorDetailsProps {
  requirementId: string;
  requirement: {
    id: string;
    projectName: string;
    industry: string;
    created: string;
    description: string;
  } | null;
  userStories: UserStory[];
  useCases: UseCase[];
  testCases: TestCase[];
  isRequirementLoading: boolean;
  isGenerating: boolean;
  handleGenerate: (
    type?: "userStories" | "useCases" | "testCases"
  ) => Promise<void>;
}

const AICaseGeneratorDetails: React.FC<AICaseGeneratorDetailsProps> = ({
  requirementId,
  requirement,
  userStories,
  useCases,
  testCases,
  isRequirementLoading,
  isGenerating,
  handleGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("userStories");

  // Render status badge
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

  // Generate button handler
  const handleGenerateClick = (
    type?: "userStories" | "useCases" | "testCases"
  ) => {
    handleGenerate(type);
  };

  // Render item card (user story, use case, or test case)
  const renderItemCard = (
    item: UserStory | UseCase | TestCase,
    index: number
  ) => (
    <Card key={item.id} className="p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">
          {activeTab === "userStories"
            ? `User Story #${index + 1}`
            : activeTab === "useCases"
            ? `Use Case #${index + 1}`
            : `Test Case #${index + 1}`}
        </h3>
        {renderStatusBadge(item.status)}
      </div>
      <p className="text-slate-600 whitespace-pre-line">{item.content}</p>
    </Card>
  );

  if (isRequirementLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  if (!requirement) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircleIcon className="h-5 w-5" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Requirement not found. Please select a valid requirement.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            to="/dashboard/ai-cases"
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">AI Case Analysis</h1>
        </div>
        <Button
          variant="default"
          disabled={isGenerating}
          onClick={() => handleGenerateClick()}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader size="small" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <RefreshIcon className="h-4 w-4" />
              <span>Generate All</span>
            </>
          )}
        </Button>
      </div>

      {/* Requirement Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Requirement Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">ID</p>
            <p className="text-slate-900">{requirement.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Project</p>
            <p className="text-slate-900">{requirement.projectName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Industry</p>
            <p className="text-slate-900">{requirement.industry}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Created</p>
            <p className="text-slate-900">{requirement.created}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Requirement Text
          </p>
          <p className="text-slate-900 p-4 bg-slate-50 rounded-md">
            {requirement.description}
          </p>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger
            value="userStories"
            className="flex items-center space-x-2"
          >
            <BookIcon className="h-4 w-4" />
            <span>User Stories ({userStories.length})</span>
          </TabsTrigger>
          <TabsTrigger value="useCases" className="flex items-center space-x-2">
            <CodeIcon className="h-4 w-4" />
            <span>Use Cases ({useCases.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="testCases"
            className="flex items-center space-x-2"
          >
            <TestTubeIcon className="h-4 w-4" />
            <span>Test Cases ({testCases.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="userStories" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Stories</h2>
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => handleGenerateClick("userStories")}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader size="small" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshIcon className="h-4 w-4" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>

          {userStories.length > 0 ? (
            userStories.map((story, index) => renderItemCard(story, index))
          ) : (
            <div className="bg-slate-50 p-8 rounded-md text-center">
              <BookIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium mb-2">No User Stories Yet</h3>
              <p className="text-slate-500 mb-4">
                Generate user stories from the requirement to see them here.
              </p>
              <Button
                onClick={() => handleGenerateClick("userStories")}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate User Stories"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="useCases" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Use Cases</h2>
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => handleGenerateClick("useCases")}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader size="small" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshIcon className="h-4 w-4" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>

          {useCases.length > 0 ? (
            useCases.map((useCase, index) => renderItemCard(useCase, index))
          ) : (
            <div className="bg-slate-50 p-8 rounded-md text-center">
              <CodeIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium mb-2">No Use Cases Yet</h3>
              <p className="text-slate-500 mb-4">
                Generate use cases from the requirement to see them here.
              </p>
              <Button
                onClick={() => handleGenerateClick("useCases")}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Use Cases"}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="testCases" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Cases</h2>
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => handleGenerateClick("testCases")}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader size="small" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshIcon className="h-4 w-4" />
                  <span>Regenerate</span>
                </>
              )}
            </Button>
          </div>

          {testCases.length > 0 ? (
            testCases.map((testCase, index) => renderItemCard(testCase, index))
          ) : (
            <div className="bg-slate-50 p-8 rounded-md text-center">
              <TestTubeIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium mb-2">No Test Cases Yet</h3>
              <p className="text-slate-500 mb-4">
                Generate test cases from the requirement to see them here.
              </p>
              <Button
                onClick={() => handleGenerateClick("testCases")}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Test Cases"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICaseGeneratorDetails;
