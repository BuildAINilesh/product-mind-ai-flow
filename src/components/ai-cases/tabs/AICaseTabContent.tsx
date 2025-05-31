
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import CaseContentTab from "../CaseContentTab";
import CasePendingGeneration from "../CasePendingGeneration";
import DatabaseUserStoryCard from "../DatabaseUserStoryCard";
import { UseCase, TestCase, StatusData } from "@/hooks/caseGenerator";
import { DatabaseUserStory } from "@/services/userStoriesService";

interface AICaseTabContentProps {
  userStories: DatabaseUserStory[];
  useCases: UseCase[];
  testCases: TestCase[];
  statusData: StatusData;
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
      {/* User Stories Tab */}
      <TabsContent value="userStories" className="space-y-4">
        {userStories.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Stories</h3>
              <span className="text-sm text-slate-500">
                {userStories.length} {userStories.length === 1 ? 'story' : 'stories'}
              </span>
            </div>
            {userStories.map((userStory, index) => (
              <DatabaseUserStoryCard
                key={userStory.id}
                userStory={userStory}
                index={index}
              />
            ))}
          </div>
        ) : (
          <CasePendingGeneration
            type="userStories"
            status={statusData.userStoriesStatus}
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateClick("userStories")}
          />
        )}
      </TabsContent>

      {/* Use Cases Tab */}
      <TabsContent value="useCases" className="space-y-4">
        <CaseContentTab
          items={useCases}
          type="useCases"
          status={statusData.useCasesStatus}
          isGenerating={isGenerating}
          onGenerate={() => handleGenerateClick("useCases")}
        />
      </TabsContent>

      {/* Test Cases Tab */}
      <TabsContent value="testCases" className="space-y-4">
        <CaseContentTab
          items={testCases}
          type="testCases"
          status={statusData.testCasesStatus}
          isGenerating={isGenerating}
          onGenerate={() => handleGenerateClick("testCases")}
        />
      </TabsContent>
    </>
  );
};

export default AICaseTabContent;
