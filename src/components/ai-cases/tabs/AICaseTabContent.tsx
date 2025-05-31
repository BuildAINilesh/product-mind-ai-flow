
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import CaseContentTab from "../CaseContentTab";
import CasePendingGeneration from "../CasePendingGeneration";
import DatabaseUserStoryCard from "../DatabaseUserStoryCard";
import { UseCase, TestCase, StatusData } from "@/hooks/caseGenerator";
import { DatabaseUserStory } from "@/services/userStoriesService";
import { FileText, FileQuestion, ClipboardList } from "lucide-react";

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
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">User Stories</h3>
                <p className="text-sm text-slate-600">
                  Generated user stories with actors and acceptance criteria
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{userStories.length}</span>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  {userStories.length === 1 ? 'Story' : 'Stories'}
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {userStories.map((userStory, index) => (
                <DatabaseUserStoryCard
                  key={userStory.id}
                  userStory={userStory}
                  index={index}
                />
              ))}
            </div>
          </div>
        ) : (
          <CasePendingGeneration
            icon={FileText}
            title="User Stories"
            isGenerating={isGenerating}
            onGenerate={() => handleGenerateClick("userStories")}
          />
        )}
      </TabsContent>

      {/* Use Cases Tab */}
      <TabsContent value="useCases" className="space-y-4">
        <CaseContentTab
          title="Use Cases"
          icon={FileQuestion}
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
          title="Test Cases"
          icon={ClipboardList}
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
