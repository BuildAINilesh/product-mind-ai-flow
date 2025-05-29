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

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Improved function to fetch analysis data
  const fetchAnalysisData = async () => {
    try {
      if (!id) return;

      console.log("Fetching analysis data for requirement ID:", id);
      setAnalysisLoading(true);

      // First try direct query
      const { data: analysisData, error: analysisError } = await supabase
        .from("requirement_analysis")
        .select("*")
        .eq("requirement_id", id)
        .single();

      if (analysisError) {
        console.error("Error with single query:", analysisError);

        // Try without single() to see if multiple records exist
        const { data: multipleData, error: multipleError } = await supabase
          .from("requirement_analysis")
          .select("*")
          .eq("requirement_id", id);

        if (multipleError) {
          console.error("Error with multiple query:", multipleError);
          throw multipleError;
        }

        if (multipleData && multipleData.length > 0) {
          console.log(
            "Found analysis with multiple results, using first one:",
            multipleData[0]
          );
          setAnalysis(multipleData[0]);
          return;
        }
      } else if (analysisData) {
        console.log("Analysis data fetched successfully:", analysisData);
        setAnalysis(analysisData);
        return;
      }

      console.log("No analysis data found with direct query");
      setAnalysis(null);
    } catch (error) {
      console.error("Error in fetchAnalysisData:", error);
      toast({
        title: "Warning",
        description: "Could not load analysis data.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  // Add a new effect to update UI when analysis is completed
  useEffect(() => {
    // When project is updated and status changes to "Completed"
    if (project?.status === "Completed") {
      fetchAnalysisData();
    }
  }, [project?.status]);

  // Function to handle editing the requirement
  const handleEdit = () => {
    navigate(`/dashboard/requirements/edit/${id}`);
  };

  // Function to trigger AI analysis
  const triggerAnalysis = async () => {
    if (!project) return;

    try {
      console.log("Starting analysis for requirement:", id);
      setAnalysisLoading(true);

      // Skip checking if requirement capture is complete - it should already be complete
      console.log(
        "Directly triggering analysis without checking completion stage..."
      );

      // Show a toast to inform the user that analysis is in progress
      toast({
        title: "Analysis Started",
        description:
          "AI is analyzing your requirement. This may take a moment...",
      });

      // Update the flow tracking to show analysis is in progress
      await supabase
        .from("requirement_flow_tracking")
        .update({
          current_stage: "analysis",
          analysis_status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", id);

      let analysisSuccessful = false;
      let errorMessage = "";

      try {
        // First attempt - try using the edge function
        console.log("Trying to use edge function...");
        const { data, error } = await supabase.functions.invoke(
          "process-project",
          {
            body: { projectId: id },
          }
        );

        if (error) {
          console.error("Edge function error:", error);
          throw new Error(error.message);
        }

        if (data && data.success) {
          console.log("Analysis completed successfully via edge function");
          analysisSuccessful = true;
        } else {
          errorMessage = data?.error || "Unknown error during analysis";
          console.error("Edge function returned error:", errorMessage);
          throw new Error(errorMessage);
        }
      } catch (funcError) {
        console.error("Error during edge function call:", funcError);
        throw funcError;
      }

      // Update UI based on the analysis result
      if (analysisSuccessful) {
        toast({
          title: "Analysis Complete",
          description: "AI analysis has been successfully completed!",
        });

        // Step 1: Update the project status in the database
        await supabase
          .from("requirements")
          .update({
            status: "Completed",
            last_updated: new Date().toISOString(),
          })
          .eq("id", id);

        // Step 2: Update the flow tracking
        await supabase
          .from("requirement_flow_tracking")
          .update({
            analysis_status: "complete",
            updated_at: new Date().toISOString(),
          })
          .eq("requirement_id", id);

        // Step 3: Fetch fresh project data and update state
        const { data: freshProject } = await supabase
          .from("requirements")
          .select("*")
          .eq("id", id)
          .single();

        if (freshProject) {
          setProject(freshProject);

          // Step 4: Add a small delay before fetching analysis to ensure DB consistency
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Step 5: Fetch and set fresh analysis data
          const { data: freshAnalysis } = await supabase
            .from("requirement_analysis")
            .select("*")
            .eq("requirement_id", id)
            .single();

          if (freshAnalysis) {
            setAnalysis(freshAnalysis);
          }
        }
      } else {
        toast({
          title: "Analysis Failed",
          description: errorMessage || "Failed to complete the analysis",
          variant: "destructive",
        });

        // Update the flow tracking to show analysis failed
        await supabase
          .from("requirement_flow_tracking")
          .update({
            analysis_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("requirement_id", id);
      }
    } catch (error) {
      console.error("Error in triggerAnalysis:", error);
      toast({
        title: "Error",
        description: "Failed to process the requirement: " + error.message,
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Function to navigate to Market Sense
  const navigateToMarketSense = () => {
    navigate(`/dashboard/market-sense?requirementId=${id}`);
  };

  // Function to handle refresh of analysis data
  const handleRefreshAnalysis = () => {
    fetchAnalysisData();
  };

  // Function to render a badge for the status
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "in progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Play className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    } as const;
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader className="h-8 w-8 animate-spin mr-2" />
          <p>Loading requirement details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Requirement not found</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => navigate("/dashboard/requirements")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requirements
        </Button>
      </div>
    );
  }

  // Render tabs for the project overview and detailed view
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/requirements")}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mr-4">{project.project_name}</h1>
        {getStatusBadge(project.status)}
        <div className="ml-auto">
          <Button onClick={handleEdit} variant="outline" className="mr-2">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">ID: </span>
                <span className="text-sm text-gray-600">{project.req_id}</span>
              </div>
              <div>
                <span className="font-medium">Status: </span>
                {getStatusBadge(project.status)}
              </div>
              <div>
                <span className="font-medium">Created: </span>
                <span className="text-sm text-gray-600">
                  {formatDate(project.created_at)}
                </span>
              </div>
              <div>
                <span className="font-medium">Updated: </span>
                <span className="text-sm text-gray-600">
                  {formatDate(project.last_updated)}
                </span>
              </div>
              <div>
                <span className="font-medium">Industry: </span>
                <span className="text-sm text-gray-600">
                  {project.industry_type || "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{project.project_idea}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        {project.status === "Completed" && analysis ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                <AIGradientText>AI Analysis Results</AIGradientText>
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefreshAnalysis}
                  disabled={analysisLoading}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button onClick={navigateToMarketSense}>
                  <BarChart className="mr-2 h-4 w-4" />
                  Go to Market Sense
                </Button>
              </div>
            </div>

            <div className="w-full">
              <RequirementAnalysisView
                project={project}
                analysis={analysis}
                loading={analysisLoading}
                onRefresh={handleRefreshAnalysis}
              />
            </div>
          </div>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Generate an AI analysis of your requirement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="max-w-2xl">
                  <AIBadge className="mb-2">AI-Powered</AIBadge>
                  <p className="mb-4">
                    Let AI analyze your requirement to extract key details,
                    identify the problem statement, and propose a solution. This
                    will help structure your project for further analysis.
                  </p>
                </div>
                <Button
                  onClick={triggerAnalysis}
                  disabled={analysisLoading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  {analysisLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RequirementView;
