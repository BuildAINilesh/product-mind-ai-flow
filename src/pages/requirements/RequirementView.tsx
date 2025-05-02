
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Edit, Play, Check, Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";

// Define a type for the analysis process step
type ProcessStep = {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
};

// Define status key for localStorage
const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";
const ANALYSIS_TIMESTAMP_KEY = "marketAnalysis_timestamp_";
const MAX_WAIT_TIME_MS = 30 * 60 * 1000; // 30 minutes maximum wait time

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Progress tracking states
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProcessStep[]>([
    { name: "Generating search queries", status: "pending" },
    { name: "Searching the web", status: "pending" },
    { name: "Scraping content", status: "pending" },
    { name: "Summarizing research", status: "pending" },
    { name: "Creating market analysis", status: "pending" }
  ]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!id) {
          throw new Error("Requirement ID is missing");
        }
        
        setLoading(true);
        setError(null);
        
        console.log("Fetching requirement data for ID:", id);
        
        // Fetch the basic project info
        const { data: projectData, error: projectError } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (projectError) {
          console.error("Error fetching project data:", projectError);
          throw projectError;
        }

        if (!projectData) {
          console.warn("No project data found for ID:", id);
          setProject(null);
          setLoading(false);
          return;
        }

        console.log("Project data fetched successfully:", projectData);
        setProject(projectData);

        // If project is completed, fetch the analysis data
        if (projectData.status === "Completed") {
          console.log("Project is completed, fetching analysis data");
          
          // First try fetching from requirement_analysis table
          let { data: analysisData, error: analysisError } = await supabase
            .from('requirement_analysis')
            .select('*')
            .eq('requirement_id', id)
            .maybeSingle();

          if (analysisError) {
            console.error('Error fetching analysis from requirement_analysis:', analysisError);
            // If there's an error or no data, don't set an error yet - try the fallback
          }
          
          // If no analysis data found, check if there's any in the legacy format or a different table
          if (!analysisData) {
            console.log("No analysis data found in requirement_analysis table, trying alternative sources");
            
            // Try fetching from project_analysis table if it exists (as a fallback)
            ({ data: analysisData, error: analysisError } = await supabase
              .from('project_analysis')
              .select('*')
              .eq('project_id', id)
              .maybeSingle());
              
            if (analysisError) {
              console.error('Error fetching from fallback table:', analysisError);
            }
          }

          // If we have analysis data from either source, use it
          if (analysisData) {
            console.log("Analysis data fetched:", analysisData);
            setAnalysis(analysisData);
          } else {
            console.warn("No analysis data found for completed project:", id);
            // Create a synthesized analysis object from the project data
            // This helps display something useful even when the backend data is incomplete
            const synthesizedAnalysis = {
              requirement_id: id,
              project_overview: projectData.project_idea || null,
              problem_statement: null,
              proposed_solution: null,
              business_goals: null,
              target_audience: null,
              key_features: null,
              user_stories: null,
              competitive_landscape: null,
              constraints_assumptions: null,
              risks_mitigations: null,
              acceptance_criteria: null,
              appendices: null,
              analysis_confidence_score: null,
              created_at: projectData.created_at,
              updated_at: projectData.updated_at
            };
            setAnalysis(synthesizedAnalysis);
            
            toast({
              title: "Limited Data Available",
              description: "We're displaying the available project information. Some analysis details may be missing.",
              variant: "default",
            });
          }
        }
      } catch (err) {
        console.error('Error fetching requirement:', err);
        setError(err.message);
        toast({
          title: 'Error',
          description: 'Failed to load requirement details: ' + err.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
      
      // Check if there's an ongoing analysis process for this requirement
      checkOngoingAnalysisProcess();
    }
  }, [id, toast]);

  // Function to check if there's an ongoing analysis process
  const checkOngoingAnalysisProcess = () => {
    if (!id) return;
    
    const inProgress = localStorage.getItem(ANALYSIS_STATUS_KEY + id) === 'true';
    
    if (inProgress) {
      console.log("Found ongoing analysis process for requirement:", id);
      
      // Check if process has been running too long and might be stuck
      const startTimestamp = localStorage.getItem(ANALYSIS_TIMESTAMP_KEY + id);
      if (startTimestamp) {
        const elapsedTime = Date.now() - parseInt(startTimestamp, 10);
        
        if (elapsedTime > MAX_WAIT_TIME_MS) {
          // Process has been running too long, likely stuck
          console.log("Analysis process appears to be stuck (running for more than 30 minutes)");
          
          // Check current status in database before resetting
          checkMarketAnalysisStatus(true);
          return;
        }
      }
      
      setAnalysisInProgress(true);
      
      // Restore progress steps and current step
      const savedSteps = localStorage.getItem(ANALYSIS_STEPS_KEY + id);
      const savedCurrentStep = localStorage.getItem(ANALYSIS_CURRENT_STEP_KEY + id);
      
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
  const checkMarketAnalysisStatus = async (isForceCheck = false) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('market_analysis')
        .select('status')
        .eq('requirement_id', id)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking market analysis status:", error);
        return;
      }
      
      if (data && data.status === 'Completed') {
        console.log("Market analysis has been completed, updating UI");
        // Reset in-progress status
        localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
        localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
        localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);
        localStorage.removeItem(ANALYSIS_TIMESTAMP_KEY + id);
        
        // Update steps to show all completed
        setProgressSteps(steps => steps.map(step => ({ ...step, status: "completed" })));
        setCurrentStep(progressSteps.length);
        
        // Wait a bit and then reset the UI
        setTimeout(() => {
          setAnalysisInProgress(false);
        }, 3000);
        
        return true;
      } else if (isForceCheck && currentStep === 3) {
        // If we're checking a potentially stuck process and it's on the summarizing step
        console.log("Attempting to resume stalled summarization process");
        resetSummarizationStep();
        return false;
      }
      
      return false;
    } catch (e) {
      console.error("Error checking market analysis:", e);
      return false;
    }
  };
  
  // Function to reset and restart a stuck summarization process
  const resetSummarizationStep = async () => {
    if (!id) return;
    
    try {
      toast({
        title: "Resuming Analysis",
        description: "The summarization process appeared to be stuck. Attempting to resume...",
      });
      
      // Reset the current step's status
      updateStepStatus(3, "processing");
      
      // Call summarize API to continue processing
      const { data, error } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: id }
      });
      
      if (error) {
        throw error;
      }
      
      // Continue with next steps if summarization is complete or has fewer remaining items
      const hasProgressMade = data?.totalSummarized > 0;
      
      if (hasProgressMade) {
        console.log(`Summarization has processed ${data.totalSummarized} items`);
        
        // If there's more content to summarize, continue
        if (data.remaining && data.remaining > 0) {
          await summarizeAdditionalContent(id);
        }
        
        // Continue to the next step
        updateStepStatus(3, "completed");
        setCurrentStep(4);
        localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '4');
        
        // Generate market analysis
        await analyzeMarketData();
      } else {
        // If no progress was made, the process might be truly stuck
        updateStepStatus(3, "failed");
        toast({
          title: "Process Stuck",
          description: "Unable to resume analysis. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting summarization step:', error);
      updateStepStatus(3, "failed");
      toast({
        title: "Error",
        description: "Failed to resume the analysis process.",
        variant: "destructive",
      });
    }
  };

  // Function to update step status
  const updateStepStatus = (stepIndex, status) => {
    setProgressSteps(prevSteps => {
      const updatedSteps = prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      );
      
      // Save to localStorage for persistence
      if (id) {
        localStorage.setItem(ANALYSIS_STEPS_KEY + id, JSON.stringify(updatedSteps));
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
      const { data, error } = await supabase.functions.invoke('process-project', {
        body: { projectId: id }
      });
      
      if (error) {
        throw error;
      }
      
      // Update status to Completed
      const { error: updateError } = await supabase
        .from('requirements')
        .update({ status: 'Completed' })
        .eq('id', id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Refetch the project with updated data
      const { data: updatedProject, error: fetchError } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      setProject(updatedProject);

      // Fetch the newly created analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('requirement_analysis')
        .select('*')
        .eq('requirement_id', id)
        .maybeSingle();

      if (analysisError) {
        console.error('Error fetching analysis:', analysisError);
      } else {
        setAnalysis(analysisData);
      }
      
      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });
      
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to analyze requirement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to analyze market data directly (used in reset process)
  const analyzeMarketData = async () => {
    try {
      updateStepStatus(4, "processing");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-market', {
        body: { requirementId: id }
      });
      
      if (analysisError) throw analysisError;
      updateStepStatus(4, "completed");
      
      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);
      localStorage.removeItem(ANALYSIS_TIMESTAMP_KEY + id);
      
      // Navigate to the market analysis results after a short delay
      setTimeout(() => {
        navigate(`/dashboard/market-sense?requirementId=${id}`);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error in market analysis process:', error);
      updateStepStatus(4, "failed");
      
      toast({
        title: "Error",
        description: error.message || "Failed to complete market analysis",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Function to trigger AI market analysis with visual progress indicators
  const generateMarketAnalysis = async () => {
    if (!id) return;
    
    try {
      // Reset progress state and show progress UI
      setProgressSteps(prevSteps => prevSteps.map(step => ({ ...step, status: "pending" })));
      setCurrentStep(0);
      setAnalysisInProgress(true);
      
      // Set localStorage flags to indicate analysis is in progress
      localStorage.setItem(ANALYSIS_STATUS_KEY + id, 'true');
      localStorage.setItem(ANALYSIS_STEPS_KEY + id, JSON.stringify(progressSteps));
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '0');
      localStorage.setItem(ANALYSIS_TIMESTAMP_KEY + id, Date.now().toString());
      
      // Step 1: Generate search queries
      updateStepStatus(0, "processing");
      const { data: queriesData, error: queriesError } = await supabase.functions.invoke('generate-market-queries', {
        body: { 
          requirementId: id,
          industryType: project.industry_type,
          problemStatement: analysis?.problem_statement || null,
          proposedSolution: analysis?.proposed_solution || null,
          keyFeatures: analysis?.key_features || null
        }
      });
      
      if (queriesError) throw queriesError;
      if (!queriesData.success) throw new Error(queriesData.message || "Failed to generate search queries");
      
      updateStepStatus(0, "completed");
      setCurrentStep(1);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '1');
      
      // Step 2: Process search queries
      updateStepStatus(1, "processing");
      const { data: processData, error: processError } = await supabase.functions.invoke('process-market-queries', {
        body: { requirementId: id }
      });
      
      if (processError) throw processError;
      if (!processData.success) throw new Error(processData.message || "Failed to process search queries");
      
      updateStepStatus(1, "completed");
      setCurrentStep(2);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '2');
      
      // Step 3: Scrape research sources
      updateStepStatus(2, "processing");
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-research-urls', {
        body: { requirementId: id }
      });
      
      if (scrapeError) throw scrapeError;
      if (!scrapeData.success) throw new Error(scrapeData.message || "Failed to scrape research sources");
      
      updateStepStatus(2, "completed");
      setCurrentStep(3);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '3');
      
      // Step 4: Summarize research content
      updateStepStatus(3, "processing");
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: id }
      });
      
      if (summaryError) throw summaryError;
      if (!summaryData.success) throw new Error(summaryData.message || "Failed to summarize research content");
      
      // Check if there's more content to summarize
      if (summaryData.remaining && summaryData.remaining > 0) {
        // Continue summarizing if needed
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(id);
      }
      
      updateStepStatus(3, "completed");
      setCurrentStep(4);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + id, '4');
      
      // Step 5: Generate market analysis
      updateStepStatus(4, "processing");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-market', {
        body: { requirementId: id }
      });
      
      if (analysisError) throw analysisError;
      updateStepStatus(4, "completed");
      
      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);
      localStorage.removeItem(ANALYSIS_TIMESTAMP_KEY + id);
      
      // Navigate to the market analysis results after a short delay
      setTimeout(() => {
        navigate(`/dashboard/market-sense?requirementId=${id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error in market analysis process:', error);
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
  const summarizeAdditionalContent = async (reqId) => {
    try {
      const { data, error } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: reqId }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || "Failed to summarize additional content");
      
      // Continue recursively if there's still more to summarize
      if (data.remaining && data.remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(reqId);
      }
      
      return data;
    } catch (error) {
      console.error('Error summarizing additional content:', error);
      throw error;
    }
  };

  // Add function to cancel ongoing analysis
  const cancelAnalysis = () => {
    if (!id) return;
    
    // Clear all analysis state and localStorage
    localStorage.removeItem(ANALYSIS_STATUS_KEY + id);
    localStorage.removeItem(ANALYSIS_STEPS_KEY + id);
    localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + id);
    localStorage.removeItem(ANALYSIS_TIMESTAMP_KEY + id);
    localStorage.removeItem("autoStartAnalysis_" + id);
    
    setAnalysisInProgress(false);
    toast({
      title: "Analysis Cancelled",
      description: "Market analysis process has been cancelled.",
    });
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
    
    // Calculate progress percentage - only for active step
    const progressPercentage = isActive && step.status === "processing" ? 50 : 
                              step.status === "completed" ? 100 : 0;
    
    return (
      <div key={index} className="mb-2">
        <div className="flex items-center mb-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
            step.status === "completed" ? "bg-green-100" :
            step.status === "processing" ? "bg-blue-100" :
            step.status === "failed" ? "bg-red-100" : "bg-gray-100"
          }`}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm ${
            step.status === "completed" ? "text-green-700" :
            step.status === "processing" ? "text-blue-700 font-medium" :
            step.status === "failed" ? "text-red-700" : "text-gray-500"
          }`}>
            {step.name}
          </span>
        </div>
        {(step.status === "processing" || step.status === "completed") && (
          <Progress 
            value={progressPercentage}
            className="h-1 mb-2" 
            indicatorClassName={step.status === "completed" ? "bg-green-500" : "bg-blue-500"}
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
        .from('market_analysis')
        .select('id, status')
        .eq('requirement_id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing market analysis:', checkError);
        toast({
          title: "Error",
          description: "Failed to check for existing market analysis.",
          variant: "destructive",
        });
        return;
      }
      
      // If no entry exists, create one
      if (!existingAnalysis) {
        const { error } = await supabase
          .from('market_analysis')
          .insert({
            requirement_id: id,
            status: 'Draft'
          });
          
        if (error) {
          console.error('Error creating market analysis entry:', error);
          toast({
            title: "Error",
            description: "Failed to create market analysis entry.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Navigate to the main MarketSense dashboard with the requirement ID as a URL parameter
      console.log("Navigating to MarketSense with requirementId:", id);
      navigate(`/dashboard/market-sense?requirementId=${id}`);
      
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error Loading Requirement</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard/requirements')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Requirements
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard/requirements')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleEdit} 
            disabled={loading || !project}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          {project && (project.status === "Draft" || project.status === "Re_Draft") && (
            <Button 
              onClick={triggerAnalysis} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {loading ? "Processing..." : "Analyze"}
            </Button>
          )}
          
          {project && project.status === "Completed" && (
            <Button 
              onClick={analysisInProgress ? null : navigateToMarketSense}
              variant="default"
              disabled={analysisInProgress}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              MarketSense AI
            </Button>
          )}
        </div>
      </div>

      {/* Progress indicator for market analysis */}
      {analysisInProgress && (
        <Alert className="mb-4">
          <AlertTitle className="flex items-center">
            <Loader className="h-4 w-4 animate-spin mr-2" />
            Market Analysis in Progress
          </AlertTitle>
          <AlertDescription>
            <div className="mt-3">
              {progressSteps.map(renderStepIndicator)}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                The analysis will continue processing even if you navigate away from this page.
                You can return at any time to check progress.
              </p>
              
              <Button
                variant="outline"
                size="sm"
                onClick={cancelAnalysis}
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Show a loading state if data is loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full" />
        </div>
      ) : (
        <>
          <RequirementAnalysisView project={project} analysis={analysis} loading={loading} />
          
          {/* Market Analysis Generation Card (only show if not already in progress) */}
          {project && project.status === "Completed" && !analysisInProgress && (
            <div className="mt-6 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <h3 className="text-lg font-medium mb-2">Generate Market Analysis</h3>
              <p className="text-muted-foreground mb-4">
                Use AI to analyze market trends, competition, and opportunities for your project.
              </p>
              <Button
                onClick={generateMarketAnalysis}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Play className="h-4 w-4 mr-2" />
                Generate Market Analysis
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequirementView;
