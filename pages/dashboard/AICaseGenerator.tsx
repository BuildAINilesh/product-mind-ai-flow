import { useSearchParams } from "react-router-dom";
import { useCaseGenerator } from "@/hooks/caseGenerator";
import AICaseGeneratorDashboard from "@/components/ai-cases/AICaseGeneratorDashboard";
import AICaseGeneratorDetails from "@/components/ai-cases/AICaseGeneratorDetails";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  FileText,
  FileCheck,
  FileQuestion,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NotFoundDisplay } from "@/components/market-sense/NotFoundDisplay";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/shared/Loader";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

// Create a type for the database record
type CaseGeneratorRecord = {
  id: string;
  requirement_id: string;
  created_at: string;
  updated_at: string;
  user_stories_status: "Draft" | "Completed" | "Re_Draft";
  use_cases_status: "Draft" | "Completed" | "Re_Draft";
  test_cases_status: "Draft" | "Completed" | "Re_Draft";
  // Include other specific fields as needed instead of using index signature
  project_name?: string;
  project_description?: string;
  industry_type?: string;
};

// Create a type that extends our existing ForgeFlowItem with the database fields
type CaseGeneratorItem = {
  user_stories_status?: string;
  use_cases_status?: string;
  test_cases_status?: string;
  // Include other specific fields as needed instead of using index signature
  id?: string;
  requirement_id?: string;
  created_at?: string;
  updated_at?: string;
  project_name?: string;
  project_description?: string;
  industry_type?: string;
};

const AICaseGenerator = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");
  const [error, setError] = useState<string | null>(null);
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState<boolean>(false);

  // Add state for metrics and filtering
  const [statusCounts, setStatusCounts] = useState({
    requirements: 0,
    completedUserStories: 0,
    completedUseCases: 0,
    completedTestCases: 0,
    isLoading: true,
  });

  // Add state for the active filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  console.log("AICaseGenerator - received requirementId:", requirementId);

  // Always call the hook, regardless of whether requirementId exists
  const {
    caseGeneratorItems,
    loading,
    requirement,
    userStories,
    useCases,
    testCases,
    isRequirementLoading,
    isGenerating,
    dataFetchAttempted,
    handleGenerate,
    statusData,
  } = useCaseGenerator(requirementId);

  // Auto-generation should only happen when explicitly triggered, not on navigation
  useEffect(() => {
    const autoGenerateOnNav = async () => {
      if (!shouldAutoGenerate || !requirementId) return;

      if (
        dataFetchAttempted &&
        !isRequirementLoading &&
        requirement &&
        userStories.length === 0 &&
        useCases.length === 0 &&
        testCases.length === 0
      ) {
        console.log(
          "Auto-generating case data for requirement with auto-generate flag"
        );
        handleGenerate();
        // Reset the flag after triggering generation
        setShouldAutoGenerate(false);
      }
    };

    autoGenerateOnNav();
  }, [
    requirementId,
    dataFetchAttempted,
    isRequirementLoading,
    requirement,
    userStories.length,
    useCases.length,
    testCases.length,
    handleGenerate,
    shouldAutoGenerate,
  ]);

  // Add useEffect to fetch status counts
  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setStatusCounts((prev) => ({ ...prev, isLoading: true }));

        console.log(
          "Fetching user-specific case generator records for counting"
        );

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("No user found, showing empty state");
          setStatusCounts({
            requirements: 0,
            completedUserStories: 0,
            completedUseCases: 0,
            completedTestCases: 0,
            isLoading: false,
          });
          return;
        }

        // Get all requirements for current user only
        const { data: userRequirements, error: userReqError } = await supabase
          .from("requirements")
          .select("id")
          .eq("user_id", user.id);

        if (userReqError) {
          console.error("Error fetching user requirements:", userReqError);
          setStatusCounts({
            requirements: 0,
            completedUserStories: 0,
            completedUseCases: 0,
            completedTestCases: 0,
            isLoading: false,
          });
          return;
        }

        // If user has no requirements, return zeros
        if (!userRequirements || userRequirements.length === 0) {
          console.log("User has no requirements, showing empty state");
          setStatusCounts({
            requirements: 0,
            completedUserStories: 0,
            completedUseCases: 0,
            completedTestCases: 0,
            isLoading: false,
          });
          return;
        }

        // Get requirement IDs for this user
        const userRequirementIds = userRequirements.map((req) => req.id);

        // Get all case generator records for this user's requirements
        const { data: allRecords, error: fetchError } = await supabase
          .from("case_generator")
          .select("*")
          .in("requirement_id", userRequirementIds);

        if (fetchError) {
          console.error("Error fetching case generator records:", fetchError);
          setStatusCounts({
            requirements: 0,
            completedUserStories: 0,
            completedUseCases: 0,
            completedTestCases: 0,
            isLoading: false,
          });
          return;
        }

        console.log(
          `Successfully fetched ${
            allRecords?.length || 0
          } case generator records for this user`
        );

        // Count metrics
        const counts = {
          requirements: allRecords?.length || 0,
          completedUserStories: 0,
          completedUseCases: 0,
          completedTestCases: 0,
        };

        if (allRecords && allRecords.length > 0) {
          // Count completed items
          allRecords.forEach((record) => {
            if (record.user_stories_status?.toLowerCase() === "completed") {
              counts.completedUserStories++;
            }

            if (record.use_cases_status?.toLowerCase() === "completed") {
              counts.completedUseCases++;
            }

            if (record.test_cases_status?.toLowerCase() === "completed") {
              counts.completedTestCases++;
            }
          });
        }

        console.log("Final counts from database for this user:", counts);

        setStatusCounts({
          ...counts,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error in fetchStatusCounts:", error);
        setStatusCounts({
          requirements: 0,
          completedUserStories: 0,
          completedUseCases: 0,
          completedTestCases: 0,
          isLoading: false,
        });
      }
    };

    fetchStatusCounts();
  }, [caseGeneratorItems]);

  // Status Metric Card component
  const StatusMetricCard = ({
    title,
    count,
    icon: Icon,
    colorClass,
    description,
    isLoading,
    filterKey,
    isActive,
    onClick,
  }: {
    title: string;
    count: number;
    icon: LucideIcon;
    colorClass: {
      bg: string;
      text: string;
      border: string;
    };
    description: string;
    isLoading: boolean;
    filterKey?: string;
    isActive?: boolean;
    onClick?: (key: string) => void;
  }) => (
    <Card
      className={`p-6 rounded-lg shadow-sm bg-white ${
        isActive ? `ring-2 ring-primary/50` : ""
      } max-w-xs w-full mx-auto ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick && filterKey && onClick(filterKey)}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <span
            className={`flex items-center justify-center h-6 w-6 rounded-full ${colorClass.bg}`}
          >
            <Icon className={`h-3.5 w-3.5 ${colorClass.text}`} />
          </span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-9">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <h2 className="text-3xl font-bold">{count}</h2>
        )}
      </div>
    </Card>
  );

  // Handle metric card clicks (for filtering)
  const handleMetricCardClick = (status: string) => {
    if (activeFilter === status) {
      setActiveFilter(null); // Toggle off the filter if clicked again
    } else {
      setActiveFilter(status);
    }
  };

  // Function to get filtered items based on status
  const getFilteredCaseGeneratorItems = () => {
    if (
      !activeFilter ||
      !caseGeneratorItems ||
      caseGeneratorItems.length === 0
    ) {
      return caseGeneratorItems;
    }

    return caseGeneratorItems.filter((item) => {
      const caseItem = item as CaseGeneratorItem;

      if (activeFilter === "user_stories") {
        return caseItem.user_stories_status?.toLowerCase() === "completed";
      } else if (activeFilter === "use_cases") {
        return caseItem.use_cases_status?.toLowerCase() === "completed";
      } else if (activeFilter === "test_cases") {
        return caseItem.test_cases_status?.toLowerCase() === "completed";
      }
      return true;
    });
  };

  // Render appropriate view based on requirementId
  if (requirementId) {
    console.log("Rendering AICaseGeneratorDetails");

    // Only show NotFoundDisplay if we've attempted to fetch data and found nothing
    if (dataFetchAttempted && !isRequirementLoading && !requirement) {
      console.log("Requirement not found, showing NotFoundDisplay");
      return <NotFoundDisplay requirementId={requirementId} />;
    }

    // Loading state
    if (isRequirementLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader size="large" />
          <p className="mt-4 text-slate-500">Loading requirement details...</p>
        </div>
      );
    }

    return (
      <AICaseGeneratorDetails
        requirementId={requirementId}
        requirement={requirement}
        userStories={userStories}
        useCases={useCases}
        testCases={testCases}
        isRequirementLoading={isRequirementLoading}
        isGenerating={isGenerating}
        statusData={statusData}
        handleGenerate={handleGenerate}
        // Pass down the function to enable auto-generation
        triggerAutoGenerate={() => setShouldAutoGenerate(true)}
      />
    );
  } else {
    // Show dashboard when no requirementId is provided
    console.log("Rendering AICaseGeneratorDashboard");
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            AI Case Generator Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor the generation of user stories, use cases, and test cases
            across all projects
          </p>
        </div>

        {/* Status Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 justify-items-center">
          <StatusMetricCard
            title="Total Requirements"
            count={statusCounts.requirements}
            icon={FileText}
            isLoading={statusCounts.isLoading}
            colorClass={{
              bg: "bg-gradient-to-br from-blue-400 to-blue-600",
              text: "text-white",
              border: "border-blue-300",
            }}
            description="All requirements in system"
          />
          <StatusMetricCard
            title="Completed User Stories"
            count={statusCounts.completedUserStories}
            icon={FileCheck}
            isLoading={statusCounts.isLoading}
            filterKey="user_stories"
            isActive={activeFilter === "user_stories"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-green-400 to-green-600",
              text: "text-white",
              border: "border-green-300",
            }}
            description="User stories completed"
          />
          <StatusMetricCard
            title="Completed Use Cases"
            count={statusCounts.completedUseCases}
            icon={FileQuestion}
            isLoading={statusCounts.isLoading}
            filterKey="use_cases"
            isActive={activeFilter === "use_cases"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-amber-400 to-amber-600",
              text: "text-white",
              border: "border-amber-300",
            }}
            description="Use cases completed"
          />
          <StatusMetricCard
            title="Completed Test Cases"
            count={statusCounts.completedTestCases}
            icon={ClipboardList}
            isLoading={statusCounts.isLoading}
            filterKey="test_cases"
            isActive={activeFilter === "test_cases"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-purple-400 to-purple-600",
              text: "text-white",
              border: "border-purple-300",
            }}
            description="Test cases completed"
          />
        </div>

        {/* Show filter indicator if filter is active */}
        {activeFilter && (
          <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md border border-border">
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                Filtered by:
              </span>
              <Badge>
                {activeFilter === "user_stories"
                  ? "Completed User Stories"
                  : activeFilter === "use_cases"
                  ? "Completed Use Cases"
                  : "Completed Test Cases"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveFilter(null)}
              className="h-8 px-2"
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* Case Generator items table */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-6 md:p-10 animate-fadeIn">
          <AICaseGeneratorDashboard
            caseGeneratorItems={getFilteredCaseGeneratorItems()}
            loading={loading}
            dataFetchAttempted={dataFetchAttempted}
            hideMetrics={true}
          />
        </div>
      </div>
    );
  }
};

export default AICaseGenerator;
