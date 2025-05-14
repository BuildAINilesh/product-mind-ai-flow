import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BrainCircuit,
  Loader,
  Edit,
  Plus,
  Check,
  Play,
  Clock,
  FileText,
  BarChart,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AIBackground,
  AIBadge,
  AIGradientText,
} from "@/components/ui/ai-elements";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";

// Define a type for the analysis process step
type ProcessStep = {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  current?: number;
  total?: number;
};

// Define status key for localStorage
const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Progress tracking states
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProcessStep[]>([
    { name: "Generating search queries", status: "pending" },
    { name: "Searching the web", status: "pending", current: 0, total: 5 },
    { name: "Scraping content", status: "pending", current: 0, total: 9 },
    { name: "Summarizing research", status: "pending", current: 0, total: 9 },
    { name: "Creating market analysis", status: "pending" },
  ]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch the basic project info
      const { data: projectData, error: projectError } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) {
        throw projectError;
      }

      console.log("Data fetched from Supabase - Project:", projectData);
      setProject(projectData);

      // If project is completed, fetch the analysis data
      if (projectData.status === "Completed") {
        await fetchAnalysisData();
      }
    } catch (error) {
      console.error("Error fetching requirement:", error);
      toast({
        title: "Error",
        description: "Failed to load requirement details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Separate function to fetch analysis data
  const fetchAnalysisData = async () => {
    try {
      if (!id) return;

      console.log(
        "Fetching analysis data for requirement ID:",
        id,
        "with type:",
        typeof id
      );

      // First attempt: Try listing all records from the table to see what's there
      console.log(
        "DEBUG: Fetching ALL records from requirement_analysis table to inspect"
      );
      const { data: allRecords, error: listError } = await supabase
        .from("requirement_analysis")
        .select("id, requirement_id")
        .limit(10);

      console.log("All requirement_analysis records (first 10):", allRecords);
      console.log("List error (if any):", listError);

      // Second attempt: Try with explicit casting for UUID if that's the issue
      console.log("Executing regular query with the requirement ID");
      const { data: analysisData, error: analysisError } = await supabase
        .from("requirement_analysis")
        .select("*")
        .eq("requirement_id", id)
        .maybeSingle();

      // Log raw response before error handling
      console.log("Raw Supabase response:", {
        data: analysisData,
        error: analysisError,
      });

      if (analysisError) {
        console.error("Error fetching analysis:", analysisError);
        toast({
          title: "Warning",
          description: "Could not load analysis data.",
          variant: "destructive",
        });
      } else {
        console.log("Analysis data fetched from Supabase:", analysisData);

        // If null, try a different approach with a broader search
        if (!analysisData) {
          console.log(
            "No analysis data found. Trying broader search without maybeSingle..."
          );
          const { data: allMatches, error: matchError } = await supabase
            .from("requirement_analysis")
            .select("*")
            .eq("requirement_id", id);

          console.log(
            "All potential matches:",
            allMatches,
            "Error:",
            matchError
          );

          // Also try with a textual LIKE search in case of format issues
          console.log("Trying with partial ID match (LIKE query)...");
          // Extract first part of UUID for partial matching
          const partialId = id.toString().substring(0, 8);
          const { data: likeMatches, error: likeError } = await supabase
            .from("requirement_analysis")
            .select("*")
            .like("requirement_id", `${partialId}%`);

          console.log("Partial ID matches:", likeMatches, "Error:", likeError);

          // If we found something with the broader search, use it
          if (allMatches && allMatches.length > 0) {
            console.log("Found match using broader search!");
            setAnalysis(allMatches[0]);
          } else if (likeMatches && likeMatches.length > 0) {
            console.log("Found match using LIKE search!");
            setAnalysis(likeMatches[0]);
          }
        } else {
          setAnalysis(analysisData);
        }
      }
    } catch (error) {
      console.error("Error in fetchAnalysisData:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();

      // Check if there's an ongoing analysis process for this requirement
      checkOngoingAnalysisProcess();
    }
  }, [id]);

  // Function to check if there's an ongoing analysis process
  const checkOngoingAnalysisProcess = () => {
    if (!id) return;

    const inProgress =
      localStorage.getItem(ANALYSIS_STATUS_KEY + id) === "true";

    if (inProgress) {
      console.log("Found ongoing analysis process for requirement:", id);
      setAnalysisInProgress(true);

      // Restore progress steps and current step
      const savedSteps = localStorage.getItem(ANALYSIS_STEPS_KEY + id);
      const savedCurrentStep = localStorage.getItem(
        ANALYSIS_CURRENT_STEP_KEY + id
      );

      if (savedSteps) {
        try {
          setProgressSteps(JSON.parse(savedSteps));
        } catch (e) {
          console.error("Error parsing saved steps:", e);
        }
      }

      if (savedCurrentStep) {
        setCurrentStep(parseInt(savedCurrentStep, 10));
      }

      // Check if the market analysis has been completed
      checkMarketAnalysisStatus();

      // Auto-start the analysis process if it's marked as in-progress but not yet started
      // This handles the redirect from MarketSense
      const autoStartAnalysis = localStorage.getItem("autoStartAnalysis_" + id);
      if (autoStartAnalysis !== "started") {
        localStorage.setItem("autoStartAnalysis_" + id, "started");
        generateMarketAnalysis();
      }
    }
  };

  // Function to check if market analysis has been completed
  const checkMarketAnalysisStatus = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("market_analysis")
        .select("status")
        .eq("requirement_id", id)
        .maybeSingle();

      if (error) {
        console.error("Error checking market analysis status:", error);
        return;
      }

      console.log("Market analysis status data from Supabase:", data);
      if (data && data.status === "Completed") {
        console.log("Market analysis has been completed, updating UI");
        // Reset in-progress status
        localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
        localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
        localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);

        // Update steps to show all completed
        setProgressSteps((steps) =>
          steps.map((step) => ({ ...step, status: "completed" }))
        );
        setCurrentStep(progressSteps.length);

        // Wait a bit and then reset the UI
        setTimeout(() => {
          setAnalysisInProgress(false);
        }, 3000);
      }
    } catch (e) {
      console.error("Error checking market analysis:", e);
    }
  };

  // Function to update step status
  const updateStepStatus = (
    stepIndex,
    status,
    current = null,
    total = null
  ) => {
    setProgressSteps((prevSteps) => {
      const updatedSteps = prevSteps.map((step, index) => {
        if (index === stepIndex) {
          const updatedStep = { ...step, status };
          if (current !== null) updatedStep.current = current;
          if (total !== null) updatedStep.total = total;
          return updatedStep;
        }
        return step;
      });

      // Save to localStorage for persistence
      if (id) {
        localStorage.setItem(
          ANALYSIS_STEPS_KEY + id,
          JSON.stringify(updatedSteps)
        );
      }

      return updatedSteps;
    });
  };

  // Function to handle editing the requirement
  const handleEdit = () => {
    navigate(`/dashboard/requirements/edit/${id}`);
  };

  // Function to trigger AI analysis
  const triggerAnalysis = async () => {
    if (!id) return;

    try {
      setLoading(true);

      toast({
        title: "Processing",
        description: "Analyzing requirement...",
      });

      // Call the process-project function for full analysis
      const { data, error } = await supabase.functions.invoke(
        "process-project",
        {
          body: { projectId: id },
        }
      );

      if (error) {
        throw error;
      }

      // Update status to Completed
      const { error: updateError } = await supabase
        .from("requirements")
        .update({ status: "Completed" })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      // Refetch the project with updated data
      const { data: updatedProject, error: fetchError } = await supabase
        .from("requirements")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProject(updatedProject);

      // Fetch the newly created analysis
      await fetchAnalysisData();

      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });
    } catch (error) {
      console.error("Error performing AI analysis:", error);
      toast({
        title: "Error",
        description: "Failed to analyze requirement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to trigger AI market analysis with visual progress indicators
  const generateMarketAnalysis = async () => {
    if (!id) return;

    try {
      // Reset progress state and show progress UI
      setProgressSteps((prevSteps) =>
        prevSteps.map((step) => ({ ...step, status: "pending" }))
      );
      setCurrentStep(0);
      setAnalysisInProgress(true);

      // Set localStorage flags to indicate analysis is in progress
      localStorage.setItem(ANALYSIS_STATUS_KEY + id, "true");
      localStorage.setItem(
        ANALYSIS_STEPS_KEY + id,
        JSON.stringify(progressSteps)
      );
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, "0");

      // Step 1: Generate search queries
      updateStepStatus(0, "processing");
      const { data: queriesData, error: queriesError } =
        await supabase.functions.invoke("generate-market-queries", {
          body: {
            requirementId: id,
            industryType: project.industry_type,
            problemStatement: analysis?.problem_statement || null,
            proposedSolution: analysis?.proposed_solution || null,
            keyFeatures: analysis?.key_features || null,
          },
        });

      if (queriesError) throw queriesError;
      if (!queriesData.success)
        throw new Error(
          queriesData.message || "Failed to generate search queries"
        );

      console.log(
        "Generate market queries response from Supabase:",
        queriesData
      );

      // Get the total number of queries - Updated to use the correct table name
      const { data: queriesCount, error: countError } = await supabase
        .from("firecrawl_queries")
        .select("id", { count: "exact" })
        .eq("requirement_id", id);

      const totalQueries = queriesCount?.length || 5;
      updateStepStatus(1, "pending", 0, totalQueries); // Update the total for search queries

      updateStepStatus(0, "completed");
      setCurrentStep(1);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, "1");

      // Step 2: Process search queries
      updateStepStatus(1, "processing");
      const { data: processData, error: processError } =
        await supabase.functions.invoke("process-market-queries", {
          body: { requirementId: id },
        });

      if (processError) throw processError;
      if (!processData.success)
        throw new Error(
          processData.message || "Failed to process search queries"
        );

      console.log(
        "Process market queries response from Supabase:",
        processData
      );

      // Get count of market research sources
      const { data: sourcesCount, error: sourcesError } = await supabase
        .from("market_research_sources")
        .select("id", { count: "exact" })
        .eq("requirement_id", id);

      const totalSources = sourcesCount?.length || 9;
      updateStepStatus(2, "pending", 0, totalSources); // Update the total for scraping
      updateStepStatus(3, "pending", 0, totalSources); // Update the total for summarizing

      updateStepStatus(1, "completed", totalQueries, totalQueries);
      setCurrentStep(2);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, "2");

      // Step 3: Scrape research sources
      updateStepStatus(2, "processing");
      const { data: scrapeData, error: scrapeError } =
        await supabase.functions.invoke("scrape-research-urls", {
          body: { requirementId: id },
        });

      if (scrapeError) throw scrapeError;
      if (!scrapeData.success)
        throw new Error(
          scrapeData.message || "Failed to scrape research sources"
        );

      console.log("Scrape research URLs response from Supabase:", scrapeData);
      updateStepStatus(2, "completed", totalSources, totalSources);
      setCurrentStep(3);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, "3");

      // Step 4: Summarize research content
      updateStepStatus(3, "processing");
      const { data: summaryData, error: summaryError } =
        await supabase.functions.invoke("summarize-research-content", {
          body: { requirementId: id },
        });

      if (summaryError) throw summaryError;
      if (!summaryData.success)
        throw new Error(
          summaryData.message || "Failed to summarize research content"
        );

      console.log("Summarize research response from Supabase:", summaryData);
      // Check if there's more content to summarize
      if (summaryData.remaining && summaryData.remaining > 0) {
        // Continue summarizing if needed - update progress
        const processedCount = totalSources - summaryData.remaining;
        updateStepStatus(3, "processing", processedCount, totalSources);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(id, processedCount, totalSources);
      }

      updateStepStatus(3, "completed", totalSources, totalSources);
      setCurrentStep(4);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, "4");

      // Step 5: Generate market analysis
      updateStepStatus(4, "processing");
      const { data: analysisData, error: analysisError } =
        await supabase.functions.invoke("analyze-market", {
          body: { requirementId: id },
        });

      if (analysisError) throw analysisError;
      console.log("Market analysis response from Supabase:", analysisData);
      updateStepStatus(4, "completed");

      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);

      // Navigate to the market analysis results after a short delay
      setTimeout(() => {
        navigate(`/dashboard/market-sense?requirementId=${id}`);
      }, 1000);
    } catch (error) {
      console.error("Error in market analysis process:", error);
      // Mark current step as failed
      updateStepStatus(currentStep, "failed");

      toast({
        title: "Error",
        description: error.message || "Failed to complete market analysis",
        variant: "destructive",
      });

      // Keep localStorage flags so user can see the failed state
    }
  };

  // Helper function to continue summarizing content if needed
  const summarizeAdditionalContent = async (
    reqId,
    processedCount,
    totalCount
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "summarize-research-content",
        {
          body: { requirementId: reqId },
        }
      );

      if (error) throw error;
      if (!data.success)
        throw new Error(
          data.message || "Failed to summarize additional content"
        );

      console.log("Additional content summarization from Supabase:", data);

      // Update progress
      if (data.remaining && data.remaining > 0) {
        const newProcessedCount = totalCount - data.remaining;
        updateStepStatus(3, "processing", newProcessedCount, totalCount);

        // Continue recursively if there's still more to summarize
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(reqId, newProcessedCount, totalCount);
      } else {
        // All done
        updateStepStatus(3, "processing", totalCount, totalCount);
      }

      return data;
    } catch (error) {
      console.error("Error summarizing additional content:", error);
      throw error;
    }
  };

  // Render step indicator component
  const renderStepIndicator = (step, index) => {
    const isActive = index === currentStep;
    const getStatusIcon = () => {
      switch (step.status) {
        case "completed":
          return <Check className="h-4 w-4 text-green-500" />;
        case "processing":
          return <Loader className="h-4 w-4 animate-spin" />;
        case "failed":
          return <div className="h-4 w-4 rounded-full bg-red-500"></div>;
        default:
          return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
      }
    };

    // Calculate progress percentage
    let progressPercentage = 0;
    if (step.status === "completed") {
      progressPercentage = 100;
    } else if (step.status === "processing") {
      if (step.current !== undefined && step.total) {
        progressPercentage = Math.floor((step.current / step.total) * 100);
      } else {
        progressPercentage = isActive ? 50 : 0;
      }
    }

    return (
      <div key={index} className="mb-2">
        <div className="flex items-center mb-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
              step.status === "completed"
                ? "bg-green-100"
                : step.status === "processing"
                ? "bg-blue-100"
                : step.status === "failed"
                ? "bg-red-100"
                : "bg-gray-100"
            }`}
          >
            {getStatusIcon()}
          </div>
          <span
            className={`text-sm ${
              step.status === "completed"
                ? "text-green-700"
                : step.status === "processing"
                ? "text-blue-700 font-medium"
                : step.status === "failed"
                ? "text-red-700"
                : "text-gray-500"
            }`}
          >
            {step.name}
            {step.current !== undefined && step.total ? (
              <span className="ml-1 text-xs font-normal text-slate-500">
                ({step.current}/{step.total})
              </span>
            ) : null}
          </span>
        </div>
        {(step.status === "processing" || step.status === "completed") && (
          <Progress
            value={progressPercentage}
            className="h-1 mb-2"
            indicatorClassName={
              step.status === "completed" ? "bg-green-500" : "bg-blue-500"
            }
          />
        )}
      </div>
    );
  };

  // Function to navigate to MarketSense
  const navigateToMarketSense = async () => {
    if (!id) return;

    try {
      // First, check if a market analysis entry already exists
      const { data: existingAnalysis, error: checkError } = await supabase
        .from("market_analysis")
        .select("id, status")
        .eq("requirement_id", id)
        .maybeSingle();

      if (checkError) {
        console.error(
          "Error checking for existing market analysis:",
          checkError
        );
        toast({
          title: "Error",
          description: "Failed to check for existing market analysis.",
          variant: "destructive",
        });
        return;
      }

      console.log(
        "Existing market analysis data from Supabase:",
        existingAnalysis
      );
      // If no entry exists, create one
      if (!existingAnalysis) {
        const { data: newAnalysis, error } = await supabase
          .from("market_analysis")
          .insert({
            requirement_id: id,
            status: "Draft",
          })
          .select("id")
          .single();

        if (error) {
          console.error("Error creating market analysis entry:", error);
          toast({
            title: "Error",
            description: "Failed to create market analysis entry.",
            variant: "destructive",
          });
          return;
        }

        console.log("Created new market analysis in Supabase:", newAnalysis);
      } else {
        console.log("Using existing market analysis:", existingAnalysis);
      }

      // Add a small delay to ensure the database has processed the entry
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to the main MarketSense dashboard with the requirement ID as a URL parameter
      console.log("Navigating to MarketSense with requirementId:", id);
      navigate(`/dashboard/market-sense?requirementId=${id}`);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  // Handle refresh of the analysis data
  const handleRefreshAnalysis = () => {
    console.log("Refreshing analysis data...");
    fetchAnalysisData();
  };

  // Helper function to render the status badge for the requirement
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Completed
            </span>
          </div>
        );
      case "re_draft":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Re-Draft
            </span>
          </div>
        );
      case "draft":
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Draft
            </span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-500/10 border border-gray-200 dark:border-gray-600/20">
            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-400">
              Unknown
            </span>
          </div>
        );
    }
  };

  // Format the creation date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full mb-4" />
        <p className="text-muted-foreground">Loading requirement details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with page title and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/requirements")}
            className="h-9 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div>
            <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
              {project?.project_name}
              {project?.status && getStatusBadge(project.status)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {project?.req_id && (
                <span className="font-medium text-foreground/70 mr-2">
                  {project.req_id}
                </span>
              )}
              <span className="text-muted-foreground flex items-center gap-1 text-xs mt-1">
                <Clock className="h-3.5 w-3.5" /> Created{" "}
                {formatDate(project?.created_at)}
                {project?.company_name && (
                  <span> • {project.company_name}</span>
                )}
                {project?.industry_type && (
                  <span> • {project.industry_type}</span>
                )}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={loading}
            size="sm"
            className="h-9 gap-1.5"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>

          {project &&
            (project.status === "Draft" || project.status === "Re_Draft") && (
              <Button
                onClick={triggerAnalysis}
                disabled={loading}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white h-9 gap-1.5"
              >
                <BrainCircuit className="h-4 w-4" />
                Analyze
              </Button>
            )}

          {project && project.status === "Completed" && (
            <Button
              onClick={analysisInProgress ? null : navigateToMarketSense}
              variant="default"
              size="sm"
              disabled={analysisInProgress}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-9 gap-1.5"
            >
              <BarChart className="h-4 w-4" />
              MarketSense AI
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator for market analysis */}
      {analysisInProgress && (
        <Alert className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
          <AlertTitle className="flex items-center text-blue-800 dark:text-blue-300">
            <Loader className="h-4 w-4 animate-spin mr-2 text-blue-600" />
            Market Analysis in Progress
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            <div className="mt-3">{progressSteps.map(renderStepIndicator)}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              The analysis will continue processing even if you navigate away
              from this page. You can return at any time to check progress.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Notification for Re_Draft status */}
      {project && project.status === "Re_Draft" && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
          <AlertTitle className="flex items-center text-amber-800 dark:text-amber-300">
            <BrainCircuit className="h-4 w-4 mr-2" />
            Changes Detected
          </AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            <p>
              You've made changes to your requirement. Click the "Analyze"
              button to see the updated overview.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      {project && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              disabled={project.status !== "Completed"}
              className="flex items-center gap-1.5"
            >
              <BrainCircuit className="h-4 w-4" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Requirement Details</CardTitle>
                <CardDescription>
                  Basic information about this product requirement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Project Name
                    </h3>
                    <p className="text-base font-medium">
                      {project.project_name}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Company
                    </h3>
                    <p className="text-base">
                      {project.company_name || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Industry
                    </h3>
                    <p className="text-base capitalize">
                      {project.industry_type}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Status
                    </h3>
                    <p className="text-base">
                      {getStatusBadge(project.status)}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Project Idea
                  </h3>
                  <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <p className="whitespace-pre-line text-sm">
                      {project.project_idea}
                    </p>
                  </div>
                </div>

                {(project.status === "Draft" ||
                  project.status === "Re_Draft") && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={triggerAnalysis}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                    >
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generate an AI-powered analysis of this requirement
                      including problem statement, solution, and key features.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {project.status === "Completed" && (
              <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    Market Analysis
                  </CardTitle>
                  <CardDescription>
                    Generate AI-powered market insights for this requirement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Use MarketSense AI to analyze market trends, competition,
                    and opportunities for your project.
                  </p>
                  <Button
                    onClick={navigateToMarketSense}
                    disabled={analysisInProgress}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-1.5"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Launch MarketSense
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {project.status === "Completed" && (
              <RequirementAnalysisView
                project={project}
                analysis={analysis}
                loading={loading}
                onRefresh={handleRefreshAnalysis}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RequirementView;
