
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, CodeIcon, TestTubeIcon } from "lucide-react";
import StatusBadge from "../StatusBadge";

interface AICaseTabNavigationProps {
  activeTab: string;
  userStoriesStatus: string;
  useCasesStatus: string;
  testCasesStatus: string;
}

const AICaseTabNavigation: React.FC<AICaseTabNavigationProps> = ({
  activeTab,
  userStoriesStatus,
  useCasesStatus,
  testCasesStatus,
}) => {
  return (
    <TabsList className="mb-4">
      <TabsTrigger
        value="userStories"
        className="flex items-center space-x-2"
      >
        <BookIcon className="h-4 w-4" />
        <span>User Stories</span>
        {userStoriesStatus !== "Draft" && (
          <span className="ml-2 text-xs">
            <StatusBadge status={userStoriesStatus} />
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger value="useCases" className="flex items-center space-x-2">
        <CodeIcon className="h-4 w-4" />
        <span>Use Cases</span>
        {useCasesStatus !== "Draft" && (
          <span className="ml-2 text-xs">
            <StatusBadge status={useCasesStatus} />
          </span>
        )}
      </TabsTrigger>
      <TabsTrigger
        value="testCases"
        className="flex items-center space-x-2"
      >
        <TestTubeIcon className="h-4 w-4" />
        <span>Test Cases</span>
        {testCasesStatus !== "Draft" && (
          <span className="ml-2 text-xs">
            <StatusBadge status={testCasesStatus} />
          </span>
        )}
      </TabsTrigger>
    </TabsList>
  );
};

export default AICaseTabNavigation;
