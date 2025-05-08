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
  CheckCircle2,
  XCircle,
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
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BrdPdfDocument from "@/components/signoff/BrdPdfDocument";

const AISignoff = () => {
  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingBRD, setIsGeneratingBRD] = useState<boolean>(false);
  const [brdData, setBrdData] = useState<BRDData | null>(null);
  const [isBrdLoading, setIsBrdLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Sign-off modal state
  const [signOffDialogOpen, setSignOffDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          // Create a type for the raw DB data
          type RequirementBrdRow = {
            id: string;
            requirement_id: string;
            project_overview?: string;
            problem_statement?: string;
            proposed_solution?: string;
            key_features?: string;
            business_goals?: string;
            target_audience?: string;
            market_research_summary?: string;
            validation_summary?: string;
            user_stories_summary?: string | string[];
            use_cases_summary?: string | string[];
            total_tests?: number;
            functional_tests?: number;
            edge_tests?: number;
            negative_tests?: number;
            integration_tests?: number;
            risks_and_mitigations?: string | string[];
            final_recommendation?: string;
            ai_signoff_confidence?: number;
            status?: "draft" | "ready" | "signed_off" | "rejected" | "error";
            approver_name?: string | null;
            approver_comment?: string | null;
            signed_off_at?: string | null;
            created_at: string;
            updated_at?: string;
          };

          // Cast raw data to our defined type
          const rawData = data as RequirementBrdRow;

          // Fetch test cases for this requirement
          const { data: testCasesData, error: testCasesError } = await supabase
            .from("test_cases")
            .select("*")
            .eq("requirement_id", requirementId);

          if (testCasesError) {
            console.error("Error fetching test cases:", testCasesError);
          }

          // Map test cases to match the TestCase interface
          const testCases =
            testCasesData?.map((testCase) => ({
              id: testCase.id,
              test_type: testCase.type || "Functional", // Map 'type' to 'test_type'
              title: testCase.test_title,
              test_title: testCase.test_title,
              description: testCase.steps,
              expected_result: testCase.expected_result,
            })) || [];

          // Process the raw data, handling string and JSON conversions
          const brd: BRDData = {
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
            approver_name: rawData.approver_name,
            approver_comment: rawData.approver_comment,
            signed_off_at: rawData.signed_off_at,
            created_at: rawData.created_at,
            updated_at: rawData.updated_at || rawData.created_at,
            test_cases: testCases || [],
          };

          setBrdData(brd);
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

      // If it's already an array, return it
      if (Array.isArray(field)) {
        return field;
      }

      // If it's a string that looks like JSON (starts with [ and ends with ]), try to parse it
      if (typeof field === "string") {
        if (field.trim().startsWith("[") && field.trim().endsWith("]")) {
          try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) {
              return parsed;
            }
          } catch (e) {
            // Try again with some cleaning in case there are escaped quotes
            try {
              // Remove escape characters that might be causing issues
              const cleanedText = field
                .replace(/\\"/g, '"') // Replace escaped quotes
                .replace(/\\n/g, " "); // Replace newlines

              // Try to parse again
              const parsed = JSON.parse(cleanedText);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            } catch (innerError) {
              console.error(
                "Error parsing array field after cleaning:",
                innerError
              );
            }
          }
        }

        // If parsing failed or it's not a JSON string, split by newlines
        return field
          .split(/\n|•/)
          .filter((item) => item.trim().length > 0)
          .map((item) => item.trim());
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
      // First, check if there's already a BRD record
      let brdId;
      if (signoffDetails) {
        brdId = signoffDetails.id;
      } else {
        // Create new record with draft status
        const { data, error } = await supabase
          .from("requirement_brd")
          .insert({
            requirement_id: requirementId,
            status: "draft",
          })
          .select("id")
          .single();

        if (error) throw error;
        brdId = data.id;
      }

      // Call the Supabase edge function to generate the BRD
      console.log("Calling generate-final-brd function with:", {
        projectId: requirementId,
      });

      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("generate-final-brd", {
          body: JSON.stringify({
            projectId: requirementId,
          }),
        });

      // Log the response for debugging
      console.log("Edge function response:", functionData, functionError);

      if (functionError) {
        throw new Error(
          `Function error: ${functionError.message || "Unknown error"}`
        );
      }

      if (!functionData) {
        throw new Error("No data returned from function");
      }

      toast({
        title: "Success",
        description: "BRD generated successfully",
        variant: "default",
      });

      // Refresh the data to show updated status and content
      refreshData();
    } catch (error: unknown) {
      console.error("Error generating BRD:", error);
      const errorMessage =
        error instanceof PostgrestError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to generate BRD";

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
      // Set status back to draft temporarily
      const { error: updateError } = await supabase
        .from("requirement_brd")
        .update({
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", brdData.id);

      if (updateError) throw updateError;

      // Call the Supabase edge function to regenerate the BRD
      console.log("Calling generate-final-brd function for regeneration:", {
        projectId: requirementId,
        regenerate: true,
      });

      const { data: functionData, error: functionError } =
        await supabase.functions.invoke("generate-final-brd", {
          body: JSON.stringify({
            projectId: requirementId,
            regenerate: true,
          }),
        });

      // Log the response for debugging
      console.log(
        "Edge function regeneration response:",
        functionData,
        functionError
      );

      if (functionError) {
        throw new Error(
          `Function error: ${functionError.message || "Unknown error"}`
        );
      }

      if (!functionData) {
        throw new Error("No data returned from function");
      }

      toast({
        title: "Success",
        description: "BRD regenerated successfully",
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
          : "Failed to regenerate BRD";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBRD(false);
    }
  };

  // Open Sign-off dialog
  const openSignOffDialog = () => {
    setCommentText("");
    setSignOffDialogOpen(true);
  };

  // Open Reject dialog
  const openRejectDialog = () => {
    setCommentText("");
    setRejectDialogOpen(true);
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("requirement_brd")
        .update({
          status: "signed_off",
          approver_name:
            user?.user_metadata?.full_name || user?.email || "Unknown User",
          approver_comment: commentText.trim() || null,
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

      // Close the dialog and refresh data
      setSignOffDialogOpen(false);
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
    } finally {
      setIsSubmitting(false);
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

    if (!commentText.trim()) {
      toast({
        title: "Required Field",
        description: "Please provide a reason for rejecting the BRD",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("requirement_brd")
        .update({
          status: "rejected",
          approver_name:
            user?.user_metadata?.full_name || user?.email || "Unknown User",
          approver_comment: commentText.trim(),
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

      // Close the dialog and refresh data
      setRejectDialogOpen(false);
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
    } finally {
      setIsSubmitting(false);
    }
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

    // Allow generation if there's no signoff record yet or status is draft
    if (!signoffDetails) return true;

    const status = signoffDetails.status.toLowerCase();
    return status === "draft" || status === "error";
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
        <>
          <BRDDisplay
            brdData={brdData}
            projectName={requirement?.project_name}
            onRegenerate={handleRegenerateBRD}
            onExport={() => {}}
            onSignOff={
              brdData.status === "ready" ? openSignOffDialog : undefined
            }
            onReject={brdData.status === "ready" ? openRejectDialog : undefined}
          />

          {/* Sign-off Dialog */}
          <Dialog open={signOffDialogOpen} onOpenChange={setSignOffDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Approve BRD</DialogTitle>
                <DialogDescription>
                  This BRD will be approved and marked as signed off.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="space-y-1">
                  <label htmlFor="comment" className="text-sm font-medium">
                    Approver Comments (Optional)
                  </label>
                  <Textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add any comments about your approval..."
                    className="h-24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSignOffDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSignOffBRD}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rejection Dialog */}
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reject BRD</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this BRD.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="space-y-1">
                  <label
                    htmlFor="rejection-reason"
                    className="text-sm font-medium"
                  >
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="rejection-reason"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Explain why this BRD needs revision..."
                    className="h-24"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectBRD}
                  disabled={isSubmitting || !commentText.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
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
                  Generating BRD...
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
