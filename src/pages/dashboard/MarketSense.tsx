import { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LineChart, Lightbulb, Check, AlertTriangle, BarChart3, Search, FileText, Loader, BarChart, Activity, Network } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AICard, AIBackground, AIBadge, AIGradientText } from "@/components/ui/ai-elements";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define constants for sessionStorage keys
const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";
const ANALYSIS_STARTED_KEY = "market_analysis_started_";

// Define a type for the analysis process step
type ProcessStep = {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
};

const MarketSense = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [requirement, setRequirement] = useState(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [allMarketAnalyses, setAllMarketAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  
  // Analysis progress tracking states
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressSteps, setProgressSteps] = useState<ProcessStep[]>([
    { name: "Generating search queries", status: "pending" },
    { name: "Searching the web", status: "pending" },
    { name: "Scraping content", status: "pending" },
    { name: "Summarizing research", status: "pending" },
    { name: "Creating market analysis", status: "pending" }
  ]);
  
  // Get requirementId from URL params
  const requirementId = searchParams.get('requirementId');
  
  console.log("Current requirementId:", requirementId);
  
  // Fetch all market analyses when no specific requirementId is provided
  useEffect(() => {
    const fetchAllMarketAnalyses = async () => {
      if (requirementId) return; // Skip if we have a specific requirementId
      
      setLoading(true);
      setError(null);
      try {
        // Fix the query to use the correct join syntax and column names
        const { data, error } = await supabase
          .from('market_analysis')
          .select(`
            *,
            requirements:requirement_id (
              id,
              req_id,
              project_name,
              industry_type,
              created_at,
              status
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log("Fetched market analyses:", data);
        setAllMarketAnalyses(data.filter(item => item.requirements)); // Filter out any items without requirement data
        setDataFetchAttempted(true);
        
      } catch (error) {
        console.error("Error fetching market analyses:", error);
        setError("Failed to load market analyses. Please try again.");
        toast.error("Failed to load market analyses");
        setDataFetchAttempted(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllMarketAnalyses();
  }, [requirementId]);
  
  // Fetch requirement details and market analysis data when a specific requirementId is provided
  useEffect(() => {
    const fetchData = async () => {
      if (!requirementId) {
        console.log("No requirementId provided");
        return;
      }
      
      console.log("Fetching data for requirementId:", requirementId);
      setLoading(true);
      setError(null);
      try {
        // Check if the analysis should be started automatically
        // This happens if the user clicked "Generate Market Analysis" from the RequirementView
        const autoStartAnalysis = sessionStorage.getItem(ANALYSIS_STARTED_KEY + requirementId) === 'true';
        
        // Check if there's an ongoing analysis process for this requirement
        const isProcessing = sessionStorage.getItem(ANALYSIS_STATUS_KEY + requirementId) === 'true';
        if (isProcessing || autoStartAnalysis) {
          console.log("Found ongoing analysis process or auto-start flag");
          // Setup the UI to show progress
          checkOngoingAnalysisProcess();
          
          // Remove the auto-start flag if it exists
          if (autoStartAnalysis) {
            sessionStorage.removeItem(ANALYSIS_STARTED_KEY + requirementId);
          }
        }
        
        // Fetch the requirement
        const { data: reqData, error: reqError } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', requirementId)
          .single();
          
        if (reqError) {
          console.error("Error fetching requirement:", reqError);
          throw reqError;
        }
        
        console.log("Requirement data:", reqData);
        setRequirement(reqData);
        
        // Fetch the requirement analysis
        const { data: analysisData, error: analysisError } = await supabase
          .from('requirement_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (analysisError && analysisError.code !== 'PGRST116') {
          console.error("Error fetching requirement analysis:", analysisError);
          throw analysisError;
        }
        
        console.log("Requirement analysis data:", analysisData);
        setRequirementAnalysis(analysisData || null);
        
        // Fetch market analysis if it exists
        const { data: marketData, error: marketError } = await supabase
          .from('market_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (marketError && marketError.code !== 'PGRST116') {
          console.error("Error fetching market analysis:", marketError);
          throw marketError;
        }
        
        console.log("Market analysis data:", marketData);
        setDataFetchAttempted(true);
        
        // If market analysis exists, set it
        if (marketData) {
          setMarketAnalysis(marketData);
        } else {
          // If market analysis doesn't exist, create a draft entry
          console.log("Creating new market analysis draft");
          const { data: newMarketData, error: createError } = await supabase
            .from('market_analysis')
            .insert({
              requirement_id: requirementId,
              status: 'Draft'
            })
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating market analysis:", createError);
            throw createError;
          }
          
          console.log("Created new market analysis:", newMarketData);
          setMarketAnalysis(newMarketData);
          
          toast.success("New market analysis draft has been created");
        }
        
        // If auto-start flag was set, start the analysis automatically
        if (autoStartAnalysis && !isProcessing) {
          // Wait a bit to make sure UI is ready
          setTimeout(() => {
            console.log("Auto-starting market analysis");
            handleGenerateAnalysis();
          }, 1000);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load project data. The requirement might not exist.");
        toast.error("Failed to load project data. The requirement might not exist.");
        setDataFetchAttempted(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [requirementId]);
  
  // Check if there's an ongoing analysis and restore its state
  const checkOngoingAnalysisProcess = () => {
    if (!requirementId) return;
    
    const inProgress = sessionStorage.getItem(ANALYSIS_STATUS_KEY + requirementId) === 'true';
    
    if (inProgress) {
      console.log("Found ongoing analysis process for requirement:", requirementId);
      setAnalysisInProgress(true);
      
      // Restore progress steps and current step
      const savedSteps = sessionStorage.getItem(ANALYSIS_STEPS_KEY + requirementId);
      const savedCurrentStep = sessionStorage.getItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      
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
      
      // If already in progress, check the current status
      checkMarketAnalysisStatus();
    }
  };
  
  // Periodically check if the market analysis has been completed
  useEffect(() => {
    if (!requirementId || !analysisInProgress) return;
    
    const checkAnalysisCompletion = async () => {
      try {
        const { data, error } = await supabase
          .from('market_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (error) {
          console.error("Error checking market analysis:", error);
          return;
        }
        
        if (data && data.market_trends && data.status === 'Completed') {
          console.log("Market analysis has been completed, updating UI");
          setMarketAnalysis(data);
          
          // Reset in-progress status
          sessionStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
          sessionStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
          sessionStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
          
          // Update steps to show all completed
          setProgressSteps(steps => steps.map(step => ({ ...step, status: "completed" })));
          setCurrentStep(progressSteps.length);
          
          // Wait a bit and then reset the UI
          setTimeout(() => {
            setAnalysisInProgress(false);
            // Refresh the page to show the completed analysis
            if (!marketAnalysis?.market_trends) {
              window.location.reload();
            }
          }, 3000);
        }
      } catch (e) {
        console.error("Error polling for market analysis completion:", e);
      }
    };
    
    // Poll every 10 seconds
    const interval = setInterval(checkAnalysisCompletion, 10000);
    
    return () => clearInterval(interval);
  }, [requirementId, analysisInProgress, progressSteps.length, marketAnalysis?.market_trends]);
  
  // Check market analysis status and update the UI accordingly
  const checkMarketAnalysisStatus = async () => {
    if (!requirementId) return;
    
    try {
      const { data, error } = await supabase
        .from('market_analysis')
        .select('status')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking market analysis status:", error);
        return;
      }
      
      if (data && data.status === 'Completed') {
        console.log("Market analysis has been completed, updating UI");
        // Reset in-progress status
        sessionStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
        sessionStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
        sessionStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
        
        // Update steps to show all completed
        setProgressSteps(steps => steps.map(step => ({ ...step, status: "completed" })));
        setCurrentStep(progressSteps.length);
        
        // Wait a bit and then reset the UI
        setTimeout(() => {
          setAnalysisInProgress(false);
          window.location.reload();
        }, 3000);
      }
    } catch (e) {
      console.error("Error checking market analysis:", e);
    }
  };
  
  // Update step status and save to sessionStorage
  const updateStepStatus = (stepIndex, status) => {
    setProgressSteps(prevSteps => {
      const updatedSteps = prevSteps.map((step, index) => 
        index === stepIndex ? { ...step, status } : step
      );
      
      // Save to sessionStorage for persistence
      if (requirementId) {
        sessionStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(updatedSteps));
      }
      
      return updatedSteps;
    });
  };
  
  // Handle generate analysis button click - initiate the analysis process
  const handleGenerateAnalysis = async () => {
    if (!requirementId) {
      toast.error("No requirement selected for analysis");
      return;
    }
    
    try {
      // Reset progress state and show progress UI
      setProgressSteps(prevSteps => prevSteps.map(step => ({ ...step, status: "pending" })));
      setCurrentStep(0);
      setAnalysisInProgress(true);
      
      // Set sessionStorage flags to indicate analysis is in progress
      sessionStorage.setItem(ANALYSIS_STATUS_KEY + requirementId, 'true');
      sessionStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(progressSteps));
      sessionStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '0');
      
      // Step 1: Generate search queries
      updateStepStatus(0, "processing");
      const { data: queriesData, error: queriesError } = await supabase.functions.invoke('generate-market-queries', {
        body: { 
          requirementId: requirementId,
          industryType: requirement.industry_type,
          problemStatement: requirementAnalysis?.problem_statement || null,
          proposedSolution: requirementAnalysis?.proposed_solution || null,
          keyFeatures: requirementAnalysis?.key_features || null
        }
      });
      
      if (queriesError) {
        console.error("Error generating queries:", queriesError);
        throw queriesError;
      }
      
      if (!queriesData.success) {
        console.error("Query generation failed:", queriesData.message);
        throw new Error(queriesData.message || "Failed to generate search queries");
      }
      
      console.log("Queries generated successfully:", queriesData);
      updateStepStatus(0, "completed");
      setCurrentStep(1);
      sessionStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '1');
      
      // Step 2: Process search queries
      updateStepStatus(1, "processing");
      const { data: processData, error: processError } = await supabase.functions.invoke('process-market-queries', {
        body: { requirementId: requirementId }
      });
      
      if (processError) {
        console.error("Error processing queries:", processError);
        throw processError;
      }
      
      if (!processData.success) {
        console.error("Query processing failed:", processData.message);
        throw new Error(processData.message || "Failed to process search queries");
      }
      
      console.log("Queries processed successfully:", processData);
      updateStepStatus(1, "completed");
      setCurrentStep(2);
      sessionStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '2');
      
      // Step 3: Scrape research sources
      updateStepStatus(2, "processing");
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-research-urls', {
        body: { requirementId: requirementId }
      });
      
      if (scrapeError) throw scrapeError;
      if (!scrapeData.success) throw new Error(scrapeData.message || "Failed to scrape research sources");
      
      updateStepStatus(2, "completed");
      setCurrentStep(3);
      sessionStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '3');
      
      // Step 4: Summarize research content
      updateStepStatus(3, "processing");
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: requirementId }
      });
      
      if (summaryError) throw summaryError;
      if (!summaryData.success) throw new Error(summaryData.message || "Failed to summarize research content");
      
      // Check if there's more content to summarize
      if (summaryData.remaining && summaryData.remaining > 0) {
        // Continue summarizing if needed
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(requirementId);
      }
      
      updateStepStatus(3, "completed");
      setCurrentStep(4);
      sessionStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '4');
      
      // Step 5: Generate market analysis
      updateStepStatus(4, "processing");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-market', {
        body: { requirementId: requirementId }
      });
      
      if (analysisError) throw analysisError;
      updateStepStatus(4, "completed");
      
      // Refresh the market analysis data
      const { data: updatedMarketData } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .maybeSingle();
      
      if (updatedMarketData) {
        setMarketAnalysis(updatedMarketData);
      }
      
      // Clear sessionStorage flags since process is complete
      sessionStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      sessionStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      sessionStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      
      // Reset analysis in progress state after a short delay
      setTimeout(() => {
        setAnalysisInProgress(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error in market analysis process:', error);
      // Mark current step as failed
      updateStepStatus(currentStep, "failed");
      
      toast.error(error.message || "Failed to complete market analysis");
      
      // Keep sessionStorage flags so user can see the failed state
    }
  };
  
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
  
  const navigateToMarketSense = async () => {
    // Your existing code here
  };

  const formatSection = (content) => {
    if (!content) return "No data available";
    
    // Check if content contains bullet points
    if (content.includes("•") || content.includes("-")) {
      // Convert string with bullet points to an array of points
      return (
        <ul className="list-disc pl-5 space-y-1">
          {content.split(/[•\-]\s+/)
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map((item, index) => (
              <li key={index}>{item}</li>
            ))}
        </ul>
      );
    }
    
    // If no bullet points, just return the text with paragraphs
    return content.split("\n").map((paragraph, index) => (
      paragraph ? <p key={index} className="mb-2">{paragraph}</p> : null
    ));
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (!status) return <AIBadge variant="neural">Draft</AIBadge>;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <AIBadge variant="complete">Completed</AIBadge>;
      case "analyzing":
        return <AIBadge variant="analyzing">Analyzing</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      default:
        return <AIBadge variant="neural">Draft</AIBadge>;
    }
  };
  
  // Handle "View Analysis" button click
  const handleViewAnalysis = (analysisRequirementId) => {
    console.log("Navigating to analysis for requirement:", analysisRequirementId);
    // Navigate to the specific market analysis view
    navigate(`/dashboard/market-sense?requirementId=${analysisRequirementId}`);
  };
  
  // Filter market analyses based on search query
  const filteredAnalyses = allMarketAnalyses.filter(analysis => 
    analysis?.requirements?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    analysis?.requirements?.req_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis?.requirements?.industry_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If we're loading and no data fetch has been attempted yet, show a loading indicator
  if (loading && !dataFetchAttempted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="ml-2">Loading data...</p>
      </div>
    );
  }
  
  // If there's an error and we have a requirementId, show the error
  if (error && requirementId) {
    return (
      <div className="space-y-6">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
              <p className="text-muted-foreground mt-1">AI-powered market analysis</p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market Analyses
            </Button>
          </div>
        </AIBackground>
        
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>
              We encountered a problem while loading the market analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
            >
              Back to Market Analyses
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If no requirementId is provided, show a list of all market analyses
  if (!requirementId) {
    return (
      <div className="space-y-6">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
              <p className="text-muted-foreground mt-1">AI-powered market analysis for your product requirements</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/dashboard/requirements')}
                variant="outline"
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Requirements
              </Button>
            </div>
          </div>
        </AIBackground>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
            <p className="ml-2">Loading data...</p>
          </div>
        ) : (
          <AICard>
            <CardHeader>
              <CardTitle>Market Analyses</CardTitle>
              <CardDescription>
                View and manage your AI-powered market analyses for all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search market analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-[300px]">Project</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnalyses.length > 0 ? (
                      filteredAnalyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium">{analysis.requirements?.req_id || 'N/A'}</TableCell>
                          <TableCell>{analysis.requirements?.project_name || 'Unknown Project'}</TableCell>
                          <TableCell>{analysis.requirements?.industry_type || 'N/A'}</TableCell>
                          <TableCell>{new Date(analysis.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {getStatusBadge(analysis.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleViewAnalysis(analysis.requirement_id)}
                              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                            >
                              View Analysis
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-muted-foreground/60" />
                            <p>No market analyses found. Try a different search or analyze a requirement.</p>
                            <Button 
                              className="mt-2"
                              variant="outline"
                              onClick={() => navigate('/dashboard/requirements')}
                            >
                              Go to Requirements
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </AICard>
        )}
      </div>
    );
  }

  // Single requirement view (when requirementId is provided and requirement exists)
  // Make sure requirement exists before trying to access its properties
  if (!requirement && dataFetchAttempted) {
    return (
      <div className="space-y-6">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
              <p className="text-muted-foreground mt-1">AI-powered market analysis</p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market Analyses
            </Button>
          </div>
        </AIBackground>
        
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Requirement Not Found</CardTitle>
            <CardDescription>
              We couldn't find the requirement you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The requirement with ID {requirementId} could not be found or you don't have permission to access it.</p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
            >
              Back to Market Analyses
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show loading state if still loading or requirement not loaded yet
  if (loading || !requirement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="ml-2">Loading data...</p>
      </div>
    );
  }

  // Single requirement view (when requirementId is provided and requirement exists)
  // Display all market analysis sections on a single scrollable page
  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">AI-powered market analysis for {requirement.project_name}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/market-sense')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Market Analyses
            </Button>
            
            {(!marketAnalysis?.market_trends || marketAnalysis?.status === 'Draft') && !analysisInProgress && (
              <Button 
                onClick={handleGenerateAnalysis}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <LineChart className="mr-2 h-4 w-4" />
                Generate Market Analysis
              </Button>
            )}
          </div>
        </div>
      </AIBackground>
      
      {/* Progress indicator for market analysis */}
      {analysisInProgress && (
        <Alert className="mb-4">
