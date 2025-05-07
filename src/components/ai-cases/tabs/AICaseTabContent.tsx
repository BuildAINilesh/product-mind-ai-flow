
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import CaseContentTab from "../CaseContentTab";
import { BookIcon, CodeIcon, TestTubeIcon } from "lucide-react";

interface AICaseTabContentProps {
  userStories: Array<{ id: string; content: string; status: string }>;
  useCases: Array<{ id: string; content: string; status: string }>;
  testCases: Array<{ id: string; content: string; status: string }>;
  statusData: {
    userStoriesStatus: string;
    useCasesStatus: string;
    testCasesStatus: string;
  };
  isGenerating: boolean;
  handleGenerateClick: (
    type?: "userStories" | "useCases" | "testCases"
  ) => void;
}

const AICaseTabContent: React.FC<AICaseTabContentProps> = ({
  userStories,
  useCases,
  testCases,
  statusData,
  isGenerating,
  handleGenerateClick,
}) => {
  return (
    <>
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
          isGenerating={isGenerating && statusData.userStoriesStatus === "Completed"}
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
          isGenerating={isGenerating && statusData.useCasesStatus === "Completed"}
          onGenerate={() => handleGenerateClick("testCases")}
        />
      </TabsContent>
    </>
  );
};

export default AICaseTabContent;
