import React from "react";
import ForgeFlowDashboard from "@/components/forgeflow/ForgeFlowDashboard";
import { ForgeFlowItem } from "@/hooks/useForgeFlow";

const ForgeFlowDirectTest: React.FC = () => {
  // Mock data
  const mockItems: ForgeFlowItem[] = [
    {
      id: "FF-001",
      requirementId: "REQ-25-01",
      projectName: "AI GoalPilot",
      industry: "HR",
      created: "5/6/2023",
      userStoriesStatus: "completed",
      useCasesStatus: "completed",
      testCasesStatus: "in-progress",
    },
    {
      id: "FF-002",
      requirementId: "REQ-25-02",
      projectName: "MeNova",
      industry: "healthcare",
      created: "5/6/2023",
      userStoriesStatus: "completed",
      useCasesStatus: "in-progress",
      testCasesStatus: "pending",
    },
  ];

  return (
    <div>
      <h1>ForgeFlow Direct Test</h1>
      <p>
        This page directly renders the ForgeFlowDashboard component with mock
        data.
      </p>
      <div className="mt-4">
        <ForgeFlowDashboard
          forgeflowItems={mockItems}
          loading={false}
          dataFetchAttempted={true}
        />
      </div>
    </div>
  );
};

export default ForgeFlowDirectTest;
