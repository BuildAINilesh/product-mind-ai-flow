import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserStory, UseCase, TestCase } from "@/hooks/useCaseGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeftIcon, BookIcon, CodeIcon, TestTubeIcon, RefreshCw } from "lucide-react";
import Loader from "@/components/shared/Loader";
import RequirementDetails from "./RequirementDetails";
import CaseContentTab from "./CaseContentTab";
import StatusBadge from "./StatusBadge";

interface AICaseGeneratorDetailsProps {
  requirementId: string;
  requirement: {
    id: string;
    projectName: string;
    industry: string;
    created: string;
    description: string;
    req_id?: string;
  } | null;
  userStories: UserStory[];
  useCases: UseCase[];
  testCases: TestCase[];
  isRequirementLoading: boolean;
  isGenerating: boolean;
  statusData: {
    userStoriesStatus: string;
    useCasesStatus: string;
    testCasesStatus: string;
  };
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
  statusData,
  handleGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("userStories");

  // Handle generation for a specific type
  const handleGenerateClick = (
    type?: "userStories" | "useCases" | "testCases"
  ) => {
    handleGenerate(type);
  };

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
              <RefreshCw className="h-4 w-4" />
              <span>Generate All</span>
            </>
          )}
        </Button>
      </div>

      {/* Requirement Info */}
      <RequirementDetails requirement={requirement} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger
            value="userStories"
            className="flex items-center space-x-2"
          >
            <BookIcon className="h-4 w-4" />
            <span>User Stories</span>
            {statusData.userStoriesStatus !== "Draft" && (
              <span className="ml-2 text-xs">
                <StatusBadge status={statusData.userStoriesStatus} />
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="useCases" className="flex items-center space-x-2">
            <CodeIcon className="h-4 w-4" />
            <span>Use Cases</span>
            {statusData.useCasesStatus !== "Draft" && (
              <span className="ml-2 text-xs">
                <StatusBadge status={statusData.useCasesStatus} />
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="testCases"
            className="flex items-center space-x-2"
          >
            <TestTubeIcon className="h-4 w-4" />
            <span>Test Cases</span>
            {statusData.testCasesStatus !== "Draft" && (
              <span className="ml-2 text-xs">
                <StatusBadge status={statusData.testCasesStatus} />
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="userStories" className="mt-4">
          <CaseContentTab
            title="User Stories"
            icon={BookIcon}
            status={statusData.userStoriesStatus}
            items={userStories}
            type="userStories"
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateClick("userStories")}
          />
        </TabsContent>

        <TabsContent value="useCases" className="mt-4">
          <CaseContentTab
            title="Use Cases"
            icon={CodeIcon}
            status={statusData.useCasesStatus}
            items={useCases}
            type="useCases"
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateClick("useCases")}
          />
        </TabsContent>

        <TabsContent value="testCases" className="mt-4">
          <CaseContentTab
            title="Test Cases"
            icon={TestTubeIcon}
            status={statusData.testCasesStatus}
            items={testCases}
            type="testCases"
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateClick("testCases")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICaseGeneratorDetails;
