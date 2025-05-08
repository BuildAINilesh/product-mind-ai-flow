import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AISignoffDashboard from "@/components/signoff/AISignoffDashboard";
import BRDDisplay, { BRDData } from "@/components/signoff/BRDDisplay";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  FileText,
  ClipboardCheck,
  Calendar,
  User,
  Building,
  FileOutput,
  Loader2,
} from "lucide-react";
import { NotFoundDisplay } from "@/components/market-sense/NotFoundDisplay";
import { useSignoff } from "@/hooks/useSignoff";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";

const AISignoff = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingBRD, setIsGeneratingBRD] = useState<boolean>(false);
  const [brdData, setBrdData] = useState<BRDData | null>(null);
  const [isBrdLoading, setIsBrdLoading] = useState<boolean>(false);
  const { toast } = useToast();

  console.log("AISignoff - received requirementId:", requirementId);

  // Get the signoff data via our hook
  const {
    signoffItems,
    loading,
    requirement,
    signoffDetails,
    isRequirementLoading,
    dataFetchAttempted,
    refreshData,
  } = useSignoff(requirementId);

  // Force a refresh when the component mounts
  useEffect(() => {
    console.log("AISignoff component mounted, refreshing data");
    refreshData();
  }, [refreshData]);

  // Fetch BRD data when requirementId is available or signoffDetails change
  useEffect(() => {
    const fetchBRDData = async () => {
      if (!requirementId) return;

      setIsBrdLoading(true);
      try {
        const { data, error } = await supabase
          .from("requirement_brd")
          .select("*")
          .eq("requirement_id", requirementId)
          .single();

        if (error) throw error;

        if (data) {
          // Cast raw data to any to avoid TypeScript errors
          const rawData = data as any;

          // Create BRD data with proper typing
          const brdData: BRDData = {
            id: rawData.id,
            requirement_id: rawData.requirement_id,
            project_overview: rawData.project_overview || "",
            problem_statement: rawData.problem_statement || "",
            proposed_solution: rawData.proposed_solution || "",
            key_features: rawData.key_features || "",
            business_goals: rawData.business_goals || "",
            target_audience: rawData.target_audience || "",
            market_research_summary: rawData.market_research_summary || "",
            validation_summary: rawData.validation_summary || "",
            user_stories_summary: parseArrayField(rawData.user_stories_summary),
            use_cases_summary: parseArrayField(rawData.use_cases_summary),
            total_tests: rawData.total_tests || 0,
            functional_tests: rawData.functional_tests || 0,
            edge_tests: rawData.edge_tests || 0,
            negative_tests: rawData.negative_tests || 0,
            integration_tests: rawData.integration_tests || 0,
            risks_and_mitigations: parseArrayField(
              rawData.risks_and_mitigations
            ),
            final_recommendation: rawData.final_recommendation || "",
            ai_signoff_confidence: rawData.ai_signoff_confidence || 0,
            status: rawData.status || "draft",
            approver_name: rawData.approver_name || null,
            approver_comment: rawData.approver_comment || null,
            signed_off_at: rawData.signed_off_at || null,
            created_at: rawData.created_at,
            updated_at: rawData.updated_at || rawData.created_at,
          };

          setBrdData(brdData);
        }
      } catch (error) {
        console.error("Error fetching BRD data:", error);
        // Don't set an error if the record simply doesn't exist yet
        if ((error as PostgrestError).code !== "PGRST116") {
          setError("Failed to load BRD data");
        }
      } finally {
        setIsBrdLoading(false);
      }
    };

    // Helper function to parse array fields that might be strings
    const parseArrayField = (field: unknown): string[] => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          console.error("Error parsing array field:", e);
        }
      }
      return [];
    };

    if (
      signoffDetails?.status === "ready" ||
      signoffDetails?.status === "signed_off" ||
      signoffDetails?.status === "rejected"
    ) {
      fetchBRDData();
    } else {
      setBrdData(null);
    }
  }, [requirementId, signoffDetails]);

  // Handle BRD Generation
  const handleGenerateBRD = async () => {
    if (!requirementId) {
      toast({
        title: "Error",
        description: "Requirement ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingBRD(true);

    try {
      // If there's already a signoff record, update it, otherwise create one
      if (signoffDetails) {
        // Update existing record
        const { error } = await supabase
          .from("requirement_brd")
          .update({
            status: "ready",
            updated_at: new Date().toISOString(),
          })
          .eq("id", signoffDetails.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase.from("requirement_brd").insert({
          requirement_id: requirementId,
          status: "ready",
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "BRD generation initiated successfully",
        variant: "default",
      });

      // Refresh the data to show updated status
      refreshData();
    } catch (error: unknown) {
      console.error("Error generating BRD:", error);
      const errorMessage =
        error instanceof PostgrestError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to initiate BRD generation";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBRD(false);
    }
  };

  // Handle BRD Regeneration
  const handleRegenerateBRD = async () => {
    if (!requirementId || !brdData) {
      toast({
        title: "Error",
        description: "Cannot regenerate BRD: missing data",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingBRD(true);

    try {
      const { error } = await supabase
        .from("requirement_brd")
        .update({
          status: "ready", // This triggers regeneration
          updated_at: new Date().toISOString(),
        })
        .eq("id", brdData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "BRD regeneration initiated successfully",
        variant: "default",
      });

      // Refresh the data
      refreshData();
    } catch (error: unknown) {
      console.error("Error regenerating BRD:", error);
      const errorMessage =
        error instanceof PostgrestError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to initiate BRD regeneration";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBRD(false);
    }
  };

  // Handle BRD Sign-off
  const handleSignOffBRD = async () => {
    if (!requirementId || !brdData) {
      toast({
        title: "Error",
        description: "Cannot sign off BRD: missing data",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("requirement_brd")
        .update({
          status: "signed_off",
          approver_name: "Current User", // Replace with actual user data
          signed_off_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", brdData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "BRD signed off successfully",
        variant: "default",
      });

      // Refresh the data
      refreshData();
    } catch (error: unknown) {
      console.error("Error signing off BRD:", error);
      const errorMessage =
        error instanceof PostgrestError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to sign off BRD";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle BRD Rejection
  const handleRejectBRD = async () => {
    if (!requirementId || !brdData) {
      toast({
        title: "Error",
        description: "Cannot reject BRD: missing data",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would open a modal to collect rejection reason
    const rejectionComment = "Needs revision"; // Placeholder for demo

    try {
      const { error } = await supabase
        .from("requirement_brd")
        .update({
          status: "rejected",
          approver_name: "Current User", // Replace with actual user data
          approver_comment: rejectionComment,
          signed_off_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", brdData.id);

      if (error) throw error;

      toast({
        title: "BRD Rejected",
        description: "The BRD has been rejected and sent back for revision",
        variant: "default",
      });

      // Refresh the data
      refreshData();
    } catch (error: unknown) {
      console.error("Error rejecting BRD:", error);
      const errorMessage =
        error instanceof PostgrestError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to reject BRD";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle BRD Export
  const handleExportBRD = () => {
    toast({
      title: "Export Initiated",
      description: "BRD export functionality would go here",
      variant: "default",
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="warning">Pending</Badge>;

    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "approved" || normalizedStatus === "signed_off") {
      return <Badge variant="success">Approved</Badge>;
    } else if (normalizedStatus === "pending" || normalizedStatus === "draft") {
      return <Badge variant="warning">Pending</Badge>;
    } else if (normalizedStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (normalizedStatus === "review" || normalizedStatus === "ready") {
      return <Badge variant="secondary">Under Review</Badge>;
    } else if (normalizedStatus === "error") {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  // Check if the BRD can be generated
  const canGenerateBRD = () => {
    if (!requirementId || isRequirementLoading) return false;

    // Allow generation if status is draft or if there's no signoff record yet
    return !signoffDetails || signoffDetails.status.toLowerCase() === "draft";
  };

  // Render appropriate view based on requirementId
  if (requirementId) {
    // Only show NotFoundDisplay if we've attempted to fetch data and found nothing
    if (dataFetchAttempted && !isRequirementLoading && !requirement) {
      console.log("Requirement not found, showing NotFoundDisplay");
      return <NotFoundDisplay requirementId={requirementId} />;
    }

    // Loading state
    if (isRequirementLoading || isBrdLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader size="large" />
          <p className="mt-4 text-slate-500">Loading requirement details...</p>
        </div>
      );
    }

    // If we have BRD data and it's in viewable state, show the BRD display
    if (
      brdData &&
      (brdData.status === "ready" ||
        brdData.status === "signed_off" ||
        brdData.status === "rejected")
    ) {
      return (
        <BRDDisplay
          brdData={brdData}
          projectName={requirement?.project_name}
          onRegenerate={handleRegenerateBRD}
          onExport={handleExportBRD}
          onSignOff={brdData.status === "ready" ? handleSignOffBRD : undefined}
          onReject={brdData.status === "ready" ? handleRejectBRD : undefined}
        />
      );
    }

    // Default view showing requirement info and BRD generation button
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">AI Signoff Details</h1>
          <p className="text-slate-500">
            Review and manage AI signoff for this requirement
          </p>
        </div>

        {/* Requirement Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Requirement Information</CardTitle>
              {renderStatusBadge(signoffDetails?.status || "Pending")}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">ID:</span>
                <span>{requirement?.req_id || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">Created:</span>
                <span>
                  {requirement?.created_at
                    ? new Date(requirement.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">Project:</span>
                <span>{requirement?.project_name || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">Industry:</span>
                <span>{requirement?.industry_type || "N/A"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleGenerateBRD}
              disabled={isGeneratingBRD || !canGenerateBRD()}
              className="bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
            >
              {isGeneratingBRD ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileOutput className="h-4 w-4 mr-2" />
                  Generate Final BRD
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Signoff Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Signoff Details</CardTitle>
          </CardHeader>
          <CardContent>
            {signoffDetails ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <ClipboardCheck className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="font-medium mr-2">Status:</span>
                  {renderStatusBadge(signoffDetails.status)}
                </div>
                {signoffDetails.reviewer_comments && (
                  <div>
                    <h4 className="font-medium mb-2">Reviewer Comments:</h4>
                    <p className="bg-slate-50 p-3 rounded-md border border-slate-200">
                      {signoffDetails.reviewer_comments}
                    </p>
                  </div>
                )}
                {!signoffDetails.reviewer_comments && (
                  <div className="text-slate-500 italic">
                    No reviewer comments available.
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Signoff Data Available</AlertTitle>
                <AlertDescription>
                  This requirement has not been submitted for AI signoff yet.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } else {
    // Show dashboard when no requirementId is provided
    console.log(
      "Rendering AISignoffDashboard with items:",
      signoffItems.length
    );
    return (
      <AISignoffDashboard
        signoffItems={signoffItems}
        loading={loading}
        dataFetchAttempted={dataFetchAttempted}
      />
    );
  }
};

export default AISignoff;
