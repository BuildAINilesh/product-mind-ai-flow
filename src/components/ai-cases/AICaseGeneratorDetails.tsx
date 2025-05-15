import React, { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs } from "@/components/ui/tabs";
import Loader from "@/components/shared/Loader";
import RequirementDetails from "./RequirementDetails";
import { UserStory, UseCase, TestCase } from "@/hooks/caseGenerator";
import AICaseGeneratorHeader from "./header/AICaseGeneratorHeader";
import AICaseTabNavigation from "./tabs/AICaseTabNavigation";
import AICaseTabContent from "./tabs/AICaseTabContent";
import { validateGenerationDependencies } from "./utils/generationValidation";

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
  triggerAutoGenerate?: () => void;
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
  triggerAutoGenerate,
}) => {
  const [activeTab, setActiveTab] = useState<string>("userStories");

  // Handle generation for a specific type
  const handleGenerateClick = (
    type?: "userStories" | "useCases" | "testCases"
  ) => {
    // Check for dependencies using our utility function
    if (!validateGenerationDependencies(type, statusData)) {
      return;
    }

    handleGenerate(type);
  };

  // Handle "Generate All" button
  const handleGenerateAll = () => {
    // Use triggerAutoGenerate if provided, otherwise fall back to handleGenerate
    if (triggerAutoGenerate) {
      triggerAutoGenerate();
    } else {
      handleGenerate();
    }
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
      <AICaseGeneratorHeader
        isGenerating={isGenerating}
        handleGenerateAll={handleGenerateAll}
        requirementId={requirementId}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <AICaseTabNavigation
          activeTab={activeTab}
          userStoriesStatus={statusData.userStoriesStatus}
          useCasesStatus={statusData.useCasesStatus}
          testCasesStatus={statusData.testCasesStatus}
        />

        <AICaseTabContent
          userStories={userStories}
          useCases={useCases}
          testCases={testCases}
          statusData={statusData}
          isGenerating={isGenerating}
          handleGenerateClick={handleGenerateClick}
        />
      </Tabs>
    </div>
  );
};

export default AICaseGeneratorDetails;
