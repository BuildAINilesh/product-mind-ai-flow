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
import { ArrowLeft, LineChart, Lightbulb, Check, AlertTriangle, BarChart3, Search, FileText, Loader, Activity, Network } from "lucide-react";
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

// Define constants for localStorage keys
const ANALYSIS_STATUS_KEY = "marketAnalysis_status_";
const ANALYSIS_STEPS_KEY = "marketAnalysis_steps_";
const ANALYSIS_CURRENT_STEP_KEY = "marketAnalysis_currentStep_";

// Define a type for the analysis process step
type ProcessStep = {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  current?: number;
  total?: number;
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
    { name: "Searching the web", status: "pending", current: 0, total: 5 },
    { name: "Scraping content", status: "pending", current: 0, total: 9 },
    { name: "Summarizing research", status: "pending", current: 0, total: 9 },
    { name: "Creating market analysis", status: "pending" }
  ]);
  
  // Get requirementId from URL params
  const requirementId = searchParams.get('requirementId');
  
  console.log("Current requirementId:", requirementId);
  
  useEffect(() => {
    const fetchAllMarketAnalyses = async () => {
      if (requirementId) return; // Skip if we have a specific requirementId
      
      setLoading(true);
      setError(null);
      try {
        // Using an alternative approach with separate queries to get market analyses and requirement details
        const { data: marketData, error: marketError } = await supabase
          .from('market_analysis')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (marketError) throw marketError;

        // Get an array of requirement IDs from market_analysis table
        const requirementIds = marketData.map(item => item.requirement_id).filter(Boolean);
        
        // If we have requirement IDs, fetch the corresponding requirements
        if (requirementIds.length > 0) {
          const { data: requirementsData, error: reqError } = await supabase
            .from('requirements')
            .select('*')
            .in('id', requirementIds);
          
          if (reqError) throw reqError;
          
          // Map the requirements data to each market analysis entry
          const combinedData = marketData.map(marketItem => {
            const matchingRequirement = requirementsData.find(req => req.id === marketItem.requirement_id);
            return {
              ...marketItem,
              requirements: matchingRequirement || null
            };
          });
          
          console.log("Fetched and combined market analyses:", combinedData);
          setAllMarketAnalyses(combinedData.filter(item => item.requirements)); // Filter out any items without requirement data
        } else {
          setAllMarketAnalyses([]);
        }
        
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
        // Check if there's an ongoing analysis process for this requirement
        const isProcessing = localStorage.getItem(ANALYSIS_STATUS_KEY + requirementId) === 'true';
        if (isProcessing) {
          console.log("Found ongoing analysis process");
          // Instead of redirecting, setup the UI to show progress
          checkOngoingAnalysisProcess();
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
  
  useEffect(() => {
    if (!requirementId) return;
    
    // Only poll if analysis is in progress
    if (!analysisInProgress) return;
    
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
          localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
          localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
          localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
          
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
        localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
        localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
        localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
        
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
  
  const updateStepStatus = (stepIndex, status, current = null, total = null) => {
    setProgressSteps(prevSteps => {
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
      if (requirementId) {
        localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(updatedSteps));
      }
      
      return updatedSteps;
    });
  };
  
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
      
      // Set localStorage flags to indicate analysis is in progress
      localStorage.setItem(ANALYSIS_STATUS_KEY + requirementId, 'true');
      localStorage.setItem(ANALYSIS_STEPS_KEY + requirementId, JSON.stringify(progressSteps));
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '0');
      
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
      
      if (queriesError) throw queriesError;
      if (!queriesData.success) throw new Error(queriesData.message || "Failed to generate search queries");
      
      // Get the total number of queries - Updated to use the correct table name
      const { data: queriesCount, error: countError } = await supabase
        .from("firecrawl_queries")
        .select("id", { count: "exact" })
        .eq("requirement_id", requirementId);
        
      const totalQueries = queriesCount?.length || 5;
      updateStepStatus(1, "pending", 0, totalQueries); // Update the total for search queries
      
      updateStepStatus(0, "completed");
      setCurrentStep(1);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '1');
      
      // Step 2: Process search queries
      updateStepStatus(1, "processing");
      const { data: processData, error: processError } = await supabase.functions.invoke('process-market-queries', {
        body: { requirementId: requirementId }
      });
      
      if (processError) throw processError;
      if (!processData.success) throw new Error(processData.message || "Failed to process search queries");
      
      // Get count of market research sources
      const { data: sourcesCount, error: sourcesError } = await supabase
        .from("market_research_sources")
        .select("id", { count: "exact" })
        .eq("requirement_id", requirementId);
        
      const totalSources = sourcesCount?.length || 9;
      updateStepStatus(2, "pending", 0, totalSources); // Update the total for scraping
      updateStepStatus(3, "pending", 0, totalSources); // Update the total for summarizing
      
      updateStepStatus(1, "completed", totalQueries, totalQueries);
      setCurrentStep(2);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '2');
      
      // Step 3: Scrape research sources
      updateStepStatus(2, "processing");
      const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-research-urls', {
        body: { requirementId: requirementId }
      });
      
      if (scrapeError) throw scrapeError;
      if (!scrapeData.success) throw new Error(scrapeData.message || "Failed to scrape research sources");
      
      updateStepStatus(2, "completed", totalSources, totalSources);
      setCurrentStep(3);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '3');
      
      // Step 4: Summarize research content
      updateStepStatus(3, "processing");
      const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: requirementId }
      });
      
      if (summaryError) throw summaryError;
      if (!summaryData.success) throw new Error(summaryData.message || "Failed to summarize research content");
      
      // Check if there's more content to summarize
      if (summaryData.remaining && summaryData.remaining > 0) {
        // Continue summarizing if needed - update progress
        const processedCount = totalSources - summaryData.remaining;
        updateStepStatus(3, "processing", processedCount, totalSources);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(requirementId, processedCount, totalSources);
      }
      
      updateStepStatus(3, "completed", totalSources, totalSources);
      setCurrentStep(4);
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, '4');
      
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
      
      // Clear localStorage flags since process is complete
      localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      
      // Reset analysis in progress state after a short delay
      setTimeout(() => {
        setAnalysisInProgress(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error in market analysis process:', error);
      // Mark current step as failed
      updateStepStatus(currentStep, "failed");
      
      toast.error(error.message || "Failed to complete market analysis");
      
      // Keep localStorage flags so user can see the failed state
    }
  };
  
  const summarizeAdditionalContent = async (reqId, processedCount, totalCount) => {
    try {
      const { data, error } = await supabase.functions.invoke('summarize-research-content', {
        body: { requirementId: reqId }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.message || "Failed to summarize additional content");
      
      // Update progress
      if (data.remaining && data.remaining > 0) {
        const newProcessedCount = totalCount - data.remaining;
        updateStepStatus(3, "processing", newProcessedCount, totalCount);
        
        // Continue recursively if there's still more to summarize
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
        await summarizeAdditionalContent(reqId, newProcessedCount, totalCount);
      } else {
        // All done
        updateStepStatus(3, "processing", totalCount, totalCount);
      }
      
      return data;
    } catch (error) {
      console.error('Error summarizing additional content:', error);
      throw error;
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
            {step.current !== undefined && step.total ? 
              <span className="ml-1 text-xs font-normal text-slate-500">
                ({step.current}/{step.total})
              </span> : null}
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
  
  const navigateToMarketSense = async (requirementId) => {
    try {
      // Check if a market analysis entry already exists
      const { data: existingAnalysis, error: checkError } = await supabase
        .from('market_analysis')
        .select('id, status')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing market analysis:', checkError);
        toast.error("Failed to check for existing market analysis.");
        return;
      }
      
      // If no entry exists, create one
      if (!existingAnalysis) {
        const { data: newAnalysis, error } = await supabase
          .from('market_analysis')
          .insert({
            requirement_id: requirementId,
            status: 'Draft'
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating market analysis entry:', error);
          toast.error("Failed to create market analysis entry.");
          return;
        }
        
        console.log('Successfully created market analysis entry:', newAnalysis);
      } else {
        console.log('Using existing market analysis:', existingAnalysis);
      }
      
      // Add a small delay to ensure the database has processed the entry
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to the MarketSense dashboard with the requirement ID
      navigate(`/dashboard/market-sense?requirementId=${requirementId}`);
      
    } catch (err) {
      console.error('Error:', err);
      toast.error("Something went wrong.");
    }
  };

  // Function to check for ongoing analysis process
  const checkOngoingAnalysisProcess = () => {
    if (!requirementId) return;
    
    try {
      // Retrieve saved process data from localStorage
      const currentStepSaved = localStorage.getItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);
      const stepsSaved = localStorage.getItem(ANALYSIS_STEPS_KEY + requirementId);
      
      if (currentStepSaved && stepsSaved) {
        // Parse the saved data
        const parsedCurrentStep = parseInt(currentStepSaved);
        const parsedSteps = JSON.parse(stepsSaved);
        
        // Update the state with the saved data
        setCurrentStep(parsedCurrentStep);
        setProgressSteps(parsedSteps);
        setAnalysisInProgress(true);
        
        // Check if the analysis has been completed in the database
        checkMarketAnalysisStatus();
      }
    } catch (error) {
      console.error("Error checking ongoing analysis:", error);
    }
  };
  
  // Format section function to transform content with bullets
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
            <p>The requirement with ID "{requirementId}" could not be found. It may have been deleted or you may not have access to it.</p>
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
  
  // Main view for a specific requirement with its market analysis
  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">AI-powered market analysis for {requirement?.project_name}</p>
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
      
      {/* Requirement info card */}
      <AICard>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                {requirement?.req_id} - {requirement?.project_name}
                {marketAnalysis?.status && (
                  <Badge variant={marketAnalysis.status === 'Completed' ? 'success' : 'outline'}>
                    {marketAnalysis.status}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Industry: {requirement?.industry_type}
              </CardDescription>
            </div>
            
            {!marketAnalysis?.market_trends && !analysisInProgress && (
              <Button
                onClick={handleGenerateAnalysis}
                disabled={!requirementAnalysis || analyzing}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Generate Market Analysis
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress UI when analysis is in progress */}
          {analysisInProgress && (
            <div className="mb-6 p-4 border rounded-lg bg-accent/10">
              <h3 className="text-lg font-medium mb-3">Analysis in Progress</h3>
              <div className="space-y-1">
                {progressSteps.map((step, index) => renderStepIndicator(step, index))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Please don't navigate away from this page. The analysis process may take a few minutes to complete.
              </p>
            </div>
          )}
          
          {/* Display market analysis if available */}
          {marketAnalysis?.market_trends && (
            <div className="space-y-6">
              {/* Market Trends Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Market Trends
                </h3>
                <div className="p-4 border rounded-lg">
                  {formatSection(marketAnalysis.market_trends)}
                </div>
              </div>
              
              {/* Target Audience Section */}
              {marketAnalysis.target_audience && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Network className="h-5 w-5 text-primary" />
                    Target Audience
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.target_audience)}
                  </div>
                </div>
              )}
              
              {/* Demand Insights Section */}
              {marketAnalysis.demand_insights && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Demand Insights
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.demand_insights)}
                  </div>
                </div>
              )}
              
              {/* Top Competitors Section */}
              {marketAnalysis.top_competitors && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Top Competitors
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.top_competitors)}
                  </div>
                </div>
              )}
              
              {/* Market Gap & Opportunity Section */}
              {marketAnalysis.market_gap_opportunity && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Market Gap & Opportunity
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.market_gap_opportunity)}
                  </div>
                </div>
              )}
              
              {/* SWOT Analysis Section */}
              {marketAnalysis.swot_analysis && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    SWOT Analysis
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.swot_analysis)}
                  </div>
                </div>
              )}
              
              {/* Industry Benchmarks Section */}
              {marketAnalysis.industry_benchmarks && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Industry Benchmarks
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.industry_benchmarks)}
                  </div>
                </div>
              )}
              
              {/* Confidence Score Display */}
              {marketAnalysis.confidence_score && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/20">
                  <h3 className="text-sm font-medium mb-2">Analysis Confidence Score</h3>
                  <div className="flex items-center">
                    <Progress value={marketAnalysis.confidence_score} className="h-2 flex-1" />
                    <span className="ml-2 text-sm font-medium">{marketAnalysis.confidence_score}%</span>
                  </div>
                </div>
              )}
              
              {/* Research Sources Section */}
              {marketAnalysis.research_sources && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Research Sources
                  </h3>
                  <div className="p-4 border rounded-lg">
                    {formatSection(marketAnalysis.research_sources)}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Display a message if no analysis and we're not in progress */}
          {!marketAnalysis?.market_trends && !analysisInProgress && (
            <Alert variant="default" className="bg-muted/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No market analysis available</AlertTitle>
              <AlertDescription>
                Click the "Generate Market Analysis" button to start the AI-powered market analysis process.
                This will research current market trends, competition, and strategic recommendations for this requirement.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </AICard>
    </div>
  );
};

export default MarketSense;
