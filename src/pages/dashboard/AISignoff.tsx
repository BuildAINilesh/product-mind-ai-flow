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
  ArrowRight,
  Clock,
  BarChart3,
  FileCheck,
  FileQuestion,
  FileCheck2,
  FileClock,
  FileX,
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
import { Separator } from "@/components/ui/separator";
import { LucideIcon } from "lucide-react";
import { capitalizeWords } from "@/utils/formatters";

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

  // Modify the state to include isLoading flag for metrics
  const [statusCounts, setStatusCounts] = useState({
    draft: 0,
    ready: 0,
    signed_off: 0,
    rejected: 0,
    isLoading: true,
  });

  // Add state for the active filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  // Replace the previous useEffect with this one to fetch counts from the database
  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setStatusCounts((prev) => ({ ...prev, isLoading: true }));

        console.log(
          "Fetching user-specific records from requirement_brd table for counting"
        );

        if (!user || !user.id) {
          console.log("No user found, showing empty state");
          setStatusCounts({
            draft: 0,
            ready: 0,
            signed_off: 0,
            rejected: 0,
            isLoading: false,
          });
          return;
        }

        // Get all records for current user only
        const { data: userRequirements, error: userReqError } = await supabase
          .from("requirements")
          .select("id")
          .eq("user_id", user.id);

        if (userReqError) {
          console.error("Error fetching user requirements:", userReqError);
          setStatusCounts({
            draft: 0,
            ready: 0,
            signed_off: 0,
            rejected: 0,
            isLoading: false,
          });
          return;
        }

        // If user has no requirements, return zeros
        if (!userRequirements || userRequirements.length === 0) {
          console.log("User has no requirements, showing empty state");
          setStatusCounts({
            draft: 0,
            ready: 0,
            signed_off: 0,
            rejected: 0,
            isLoading: false,
          });
          return;
        }

        // Get requirement IDs for this user
        const userRequirementIds = userRequirements.map((req) => req.id);

        // Get BRDs for only this user's requirements
        const { data: allRecords, error: fetchError } = await supabase
          .from("requirement_brd")
          .select("*")
          .in("requirement_id", userRequirementIds);

        if (fetchError) {
          console.error("Error fetching user BRDs:", fetchError);
          setStatusCounts({
            draft: 0,
            ready: 0,
            signed_off: 0,
            rejected: 0,
            isLoading: false,
          });
          return;
        }

        console.log(
          `Successfully fetched ${
            allRecords?.length || 0
          } BRD records for this user`
        );

        // Count different statuses
        const counts = {
          draft: 0,
          ready: 0,
          signed_off: 0,
          rejected: 0,
        };

        if (allRecords && allRecords.length > 0) {
          // Count by status
          allRecords.forEach((record) => {
            const status = (record.status || "").toLowerCase().trim();

            if (status === "draft") {
              counts.draft++;
            } else if (status === "ready") {
              counts.ready++;
            } else if (status === "signed_off") {
              counts.signed_off++;
            } else if (status === "rejected") {
              counts.rejected++;
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
          draft: 0,
          ready: 0,
          signed_off: 0,
          rejected: 0,
          isLoading: false,
        });
      }
    };

    fetchStatusCounts();
  }, [user, signoffItems]);

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

      // Also update the requirement status to Completed
      const { error: reqUpdateError } = await supabase
        .from("requirements")
        .update({
          status: "Completed",
          last_updated: new Date().toISOString(),
        })
        .eq("id", requirementId);

      if (reqUpdateError) {
        console.error("Error updating requirement status:", reqUpdateError);
      }

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
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (normalizedStatus === "pending" || normalizedStatus === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else if (normalizedStatus === "rejected") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Rejected</span>
        </div>
      );
    } else if (normalizedStatus === "review" || normalizedStatus === "ready") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">Ready for Review</span>
        </div>
      );
    } else if (normalizedStatus === "error") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
        <span className="text-sm font-medium">{capitalizeWords(status)}</span>
      </div>
    );
  };

  // Check if the BRD can be generated
  const canGenerateBRD = () => {
    if (!requirementId || isRequirementLoading) return false;

    // Allow generation if there's no signoff record yet or status is draft
    if (!signoffDetails) return true;

    const status = signoffDetails.status.toLowerCase();
    return status === "draft" || status === "error";
  };

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Update the StatusMetricCard to include loading state
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
    filterKey: string;
    isActive: boolean;
    onClick: (key: string) => void;
  }) => (
    <Card
      className={`p-6 rounded-lg shadow-sm bg-white ${
        isActive ? `ring-2 ring-primary/50` : ""
      } max-w-xs w-full mx-auto cursor-pointer`}
      onClick={() => onClick(filterKey)}
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

  // Add function to handle metric card clicks
  const handleMetricCardClick = (status: string) => {
    if (activeFilter === status) {
      setActiveFilter(null); // Toggle off the filter if clicked again
    } else {
      setActiveFilter(status);
    }
  };

  // Add function to filter signoff items based on status
  const getFilteredSignoffItems = () => {
    if (!activeFilter || !signoffItems || signoffItems.length === 0) {
      return signoffItems;
    }

    return signoffItems.filter((item) => {
      const status = item.status?.toLowerCase() || "";
      return status === activeFilter.toLowerCase();
    });
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Approve BRD
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  This BRD will be approved and marked as signed off.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="comment"
                    className="text-sm font-medium text-foreground"
                  >
                    Approver Comments (Optional)
                  </label>
                  <Textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add any comments about your approval..."
                    className="h-32 resize-none border-border"
                  />
                </div>
              </div>
              <DialogFooter className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSignOffDialogOpen(false)}
                  disabled={isSubmitting}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSignOffBRD}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Reject BRD
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Please provide a reason for rejecting this BRD.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="rejection-reason"
                    className="text-sm font-medium text-foreground flex items-center"
                  >
                    Rejection Reason{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea
                    id="rejection-reason"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Explain why this BRD needs revision..."
                    className="h-32 resize-none border-border"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectDialogOpen(false)}
                  disabled={isSubmitting}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectBRD}
                  disabled={isSubmitting || !commentText.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
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
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              AI Signoff Details
            </h1>
            <p className="text-muted-foreground">
              Review and manage AI signoff for this requirement
            </p>
          </div>
          <div>{renderStatusBadge(signoffDetails?.status || "Pending")}</div>
        </div>

        <Separator className="my-6" />

        {/* Requirement Info Card */}
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="bg-background/50 pb-2">
            <CardTitle className="flex items-center text-xl font-semibold">
              <FileText className="h-5 w-5 text-primary mr-2" />
              Requirement Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    Requirement ID
                  </span>
                  <span className="font-medium text-foreground">
                    {requirement?.req_id || "N/A"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    Project Name
                  </span>
                  <span className="font-medium text-foreground">
                    {requirement?.project_name || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    Created Date
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(requirement?.created_at)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground mb-1">
                    Industry
                  </span>
                  <span className="font-medium text-foreground">
                    {capitalizeWords(requirement?.industry_type) || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-background/50 flex justify-end pt-4 pb-4 border-t border-border">
            <Button
              onClick={handleGenerateBRD}
              disabled={isGeneratingBRD || !canGenerateBRD()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
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
        <Card className="overflow-hidden border-border shadow-sm">
          <CardHeader className="bg-background/50 pb-2">
            <CardTitle className="flex items-center text-xl font-semibold">
              <ClipboardCheck className="h-5 w-5 text-primary mr-2" />
              Signoff Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {signoffDetails ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    {renderStatusBadge(signoffDetails.status)}
                  </div>

                  {signoffDetails.status === "signed_off" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      <span>
                        Signed off by{" "}
                        {signoffDetails.reviewer_comments ? "Admin" : "Unknown"}{" "}
                        on {formatDate(signoffDetails.updated_at)}
                      </span>
                    </div>
                  )}
                </div>

                {signoffDetails.reviewer_comments && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 text-foreground">
                      Reviewer Comments:
                    </h4>
                    <div className="bg-muted/30 p-4 rounded-md border border-border">
                      <p className="text-foreground">
                        {signoffDetails.reviewer_comments}
                      </p>
                    </div>
                  </div>
                )}

                {!signoffDetails.reviewer_comments && (
                  <div className="text-muted-foreground italic">
                    No reviewer comments available.
                  </div>
                )}
              </div>
            ) : (
              <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Signoff Data Available</AlertTitle>
                <AlertDescription>
                  This requirement has not been submitted for AI signoff yet.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Summary Card - Only show if we have signoff details */}
        {signoffDetails && (
          <Card className="overflow-hidden border-border shadow-sm">
            <CardHeader className="bg-background/50 pb-2">
              <CardTitle className="flex items-center text-xl font-semibold">
                <BarChart3 className="h-5 w-5 text-primary mr-2" />
                AI Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-md border border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Confidence Score
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {signoffDetails.signoff_score
                      ? `${Math.round(signoffDetails.signoff_score * 100)}%`
                      : "N/A"}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-md border border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Test Cases
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {brdData?.test_cases?.length || "0"}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-md border border-border">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Processing Time
                  </div>
                  <div className="text-2xl font-semibold text-foreground">
                    {signoffDetails.created_at && signoffDetails.updated_at
                      ? `${Math.round(
                          (new Date(signoffDetails.updated_at).getTime() -
                            new Date(signoffDetails.created_at).getTime()) /
                            1000
                        )}s`
                      : "N/A"}
                  </div>
                </div>
              </div>

              {signoffDetails.status === "ready" && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={openSignOffDialog}
                    className="mr-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve BRD
                  </Button>
                  <Button
                    onClick={openRejectDialog}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject BRD
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  } else {
    // Show dashboard when no requirementId is provided
    console.log(
      "Rendering AISignoffDashboard with items:",
      signoffItems.length
    );
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            AI Signoff Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor the status of your BRDs across all projects
          </p>
        </div>

        {/* Status Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 justify-items-center">
          <StatusMetricCard
            title="Draft"
            count={statusCounts.draft}
            icon={FileClock}
            isLoading={statusCounts.isLoading}
            filterKey="draft"
            isActive={activeFilter === "draft"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-amber-400 to-amber-600",
              text: "text-white",
              border: "border-amber-300",
            }}
            description="BRDs being prepared"
          />
          <StatusMetricCard
            title="Ready for Review"
            count={statusCounts.ready}
            icon={FileQuestion}
            isLoading={statusCounts.isLoading}
            filterKey="ready"
            isActive={activeFilter === "ready"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-blue-400 to-blue-600",
              text: "text-white",
              border: "border-blue-300",
            }}
            description="Awaiting approval"
          />
          <StatusMetricCard
            title="Approved"
            count={statusCounts.signed_off}
            icon={FileCheck2}
            isLoading={statusCounts.isLoading}
            filterKey="signed_off"
            isActive={activeFilter === "signed_off"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-green-400 to-green-600",
              text: "text-white",
              border: "border-green-300",
            }}
            description="Successfully signed off"
          />
          <StatusMetricCard
            title="Rejected"
            count={statusCounts.rejected}
            icon={FileX}
            isLoading={statusCounts.isLoading}
            filterKey="rejected"
            isActive={activeFilter === "rejected"}
            onClick={handleMetricCardClick}
            colorClass={{
              bg: "bg-gradient-to-br from-red-400 to-red-600",
              text: "text-white",
              border: "border-red-300",
            }}
            description="Needs revision"
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
                {activeFilter.charAt(0).toUpperCase() +
                  activeFilter.slice(1).replace("_", " ")}
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

        {/* Signoff items table */}
        <div className="bg-white/80 rounded-3xl shadow-2xl p-6 md:p-10 animate-fadeIn">
          <AISignoffDashboard
            signoffItems={getFilteredSignoffItems()}
            loading={loading}
            dataFetchAttempted={dataFetchAttempted}
            hideMetrics={true}
          />
        </div>
      </div>
    );
  }
};

export default AISignoff;
