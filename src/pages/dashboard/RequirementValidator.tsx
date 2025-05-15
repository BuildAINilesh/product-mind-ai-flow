import { useSearchParams } from "react-router-dom";
import { useValidation } from "@/hooks/validation"; // Updated import path
import ValidationDashboard from "@/components/validator/ValidationDashboard";
import ValidationDetails from "@/components/validator/ValidationDetails";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  FileCheck,
  ScrollText,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Loader from "@/components/shared/Loader";
import { supabase } from "@/integrations/supabase/client";
import { LucideIcon } from "lucide-react";
import { NotFoundDisplay } from "@/components/market-sense/NotFoundDisplay";

const RequirementValidator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");

  // Add state for metrics and filtering
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    draft: 0,
    completed: 0,
    isLoading: true,
  });

  // Add state for the active filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  console.log("RequirementValidator - received requirementId:", requirementId);

  const {
    validations,
    loading,
    requirement,
    requirementAnalysis,
    validationData,
    isRequirementLoading,
    isValidating,
    dataFetchAttempted,
    error,
    handleValidate,
  } = useValidation(requirementId);

  // Add useEffect to fetch status counts from requirement_validation table
  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setStatusCounts((prev) => ({ ...prev, isLoading: true }));

        console.log("Fetching user-specific validation records for counting");

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.log("No user found, showing empty state");
          setStatusCounts({
            total: 0,
            draft: 0,
            completed: 0,
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
            total: 0,
            draft: 0,
            completed: 0,
            isLoading: false,
          });
          return;
        }

        // If user has no requirements, return zeros
        if (!userRequirements || userRequirements.length === 0) {
          console.log("User has no requirements, showing empty state");
          setStatusCounts({
            total: 0,
            draft: 0,
            completed: 0,
            isLoading: false,
          });
          return;
        }

        // Get requirement IDs for this user
        const userRequirementIds = userRequirements.map((req) => req.id);

        // Get all validation records for this user's requirements only
        const { data: allRecords, error: fetchError } = await supabase
          .from("requirement_validation")
          .select("*")
          .in("requirement_id", userRequirementIds);

        if (fetchError) {
          console.error("Error fetching validation records:", fetchError);
          setStatusCounts({
            total: 0,
            draft: 0,
            completed: 0,
            isLoading: false,
          });
          return;
        }

        console.log(
          `Successfully fetched ${
            allRecords?.length || 0
          } validation records for this user`
        );

        // Count metrics
        const counts = {
          total: allRecords?.length || 0,
          draft: 0,
          completed: 0,
        };

        if (allRecords && allRecords.length > 0) {
          // Count by status
          allRecords.forEach((record) => {
            const status = (record.status || "").toLowerCase().trim();

            if (status === "draft") {
              counts.draft++;
            } else if (status === "completed") {
              counts.completed++;
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
          total: 0,
          draft: 0,
          completed: 0,
          isLoading: false,
        });
      }
    };

    fetchStatusCounts();
  }, [validations]);

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

  // Function to get filtered validation items based on status
  const getFilteredValidationItems = () => {
    if (!activeFilter || !validations || validations.length === 0) {
      return validations;
    }

    return validations.filter((item) => {
      const status = (item.status || "").toLowerCase().trim();
      return status === activeFilter.toLowerCase();
    });
  };

  // If requirementId is provided, but we've tried to fetch and got an error or no data found
  if (
    requirementId &&
    dataFetchAttempted &&
    !isRequirementLoading &&
    (error || !requirement)
  ) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate("/dashboard/market-sense")}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            Back to Market Sense
          </Button>
        </div>

        <Alert variant="destructive" className="my-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || `Requirement with ID ${requirementId} not found`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If requirementId is provided and we have data, show the validation view for that requirement
  if (requirementId) {
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
      <ValidationDetails
        requirementId={requirementId}
        requirement={requirement}
        validationData={validationData}
        isRequirementLoading={isRequirementLoading}
        isValidating={isValidating}
        error={error}
        handleValidate={handleValidate}
      />
    );
  }

  // Show validations dashboard when no requirementId is provided
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Requirement Validation Dashboard
        </h1>
        <p className="text-muted-foreground">
          Monitor the validation status of your requirements
        </p>
      </div>

      {/* Status Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 justify-items-center">
        <StatusMetricCard
          title="Total Requirements"
          count={statusCounts.total}
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
          title="Draft Validations"
          count={statusCounts.draft}
          icon={ScrollText}
          isLoading={statusCounts.isLoading}
          filterKey="draft"
          isActive={activeFilter === "draft"}
          onClick={handleMetricCardClick}
          colorClass={{
            bg: "bg-gradient-to-br from-amber-400 to-amber-600",
            text: "text-white",
            border: "border-amber-300",
          }}
          description="Validations in progress"
        />
        <StatusMetricCard
          title="Completed Validations"
          count={statusCounts.completed}
          icon={CheckCircle2}
          isLoading={statusCounts.isLoading}
          filterKey="completed"
          isActive={activeFilter === "completed"}
          onClick={handleMetricCardClick}
          colorClass={{
            bg: "bg-gradient-to-br from-green-400 to-green-600",
            text: "text-white",
            border: "border-green-300",
          }}
          description="Successfully validated"
        />
      </div>

      {/* Show filter indicator if filter is active */}
      {activeFilter && (
        <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md border border-border">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-2">
              Filtered by status:
            </span>
            <Badge>
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
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

      {/* Validation items table */}
      <div className="bg-white/80 rounded-3xl shadow-2xl p-6 md:p-10 animate-fadeIn">
        <ValidationDashboard
          validations={getFilteredValidationItems()}
          loading={loading}
          dataFetchAttempted={dataFetchAttempted}
          hideMetrics={true}
        />
      </div>
    </div>
  );
};

export default RequirementValidator;
