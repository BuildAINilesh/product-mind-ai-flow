
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LineChart, Lightbulb, Check, AlertTriangle, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AICard, AIBackground, AIGradientText } from "@/components/ui/ai-elements";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

const MarketSense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  
  const [requirement, setRequirement] = useState(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState(null);
  const [marketAnalysis, setMarketAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Get requirementId from location state or from URL params
  const requirementId = location.state?.requirementId || null;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!requirementId) return;
      
      setLoading(true);
      try {
        // Fetch the requirement
        const { data: reqData, error: reqError } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', requirementId)
          .single();
          
        if (reqError) throw reqError;
        setRequirement(reqData);
        
        // Fetch the requirement analysis
        const { data: analysisData, error: analysisError } = await supabase
          .from('requirement_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (analysisError && analysisError.code !== 'PGRST116') throw analysisError;
        setRequirementAnalysis(analysisData || null);
        
        // Fetch market analysis if it exists
        const { data: marketData, error: marketError } = await supabase
          .from('market_analysis')
          .select('*')
          .eq('requirement_id', requirementId)
          .maybeSingle();
          
        if (marketError && marketError.code !== 'PGRST116') throw marketError;
        
        // If market analysis doesn't exist, create a draft entry
        if (!marketData) {
          const { data: newMarketData, error: createError } = await supabase
            .from('market_analysis')
            .insert({
              requirement_id: requirementId,
              status: 'Draft',
            })
            .select()
            .single();
            
          if (createError) throw createError;
          setMarketAnalysis(newMarketData);
          
          toast({
            title: "Draft Created",
            description: "New market analysis draft has been created",
          });
        } else {
          setMarketAnalysis(marketData);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [requirementId, toast]);
  
  const handleGenerateAnalysis = async () => {
    if (!requirementId) {
      toast({
        title: "Error",
        description: "No requirement selected for analysis",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    toast({
      title: "Processing",
      description: "Generating market analysis...",
    });
    
    try {
      // Call the analyze-market edge function
      const { data, error } = await supabase.functions.invoke('analyze-market', {
        body: { requirementId }
      });
      
      if (error) throw error;
      
      // Fetch the newly generated market analysis
      const { data: marketData, error: marketError } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('requirement_id', requirementId)
        .maybeSingle();
        
      if (marketError) throw marketError;
      
      setMarketAnalysis(marketData);
      toast({
        title: "Success",
        description: "Market analysis generated successfully",
      });
      
    } catch (error) {
      console.error("Error generating market analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate market analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
        <p className="ml-2">Loading project data...</p>
      </div>
    );
  }
  
  if (!requirementId || !requirement) {
    return (
      <div className="space-y-4">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">AI-powered market analysis for your product requirements</p>
          </div>
        </AIBackground>
        
        <Card>
          <CardHeader>
            <CardTitle>No Project Selected</CardTitle>
            <CardDescription>
              Please select a requirement from the requirements page to analyze.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/requirements")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Requirements
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">AI-powered market analysis for {requirement?.project_name}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {(!marketAnalysis?.market_trends || marketAnalysis?.status === 'Draft') && (
              <Button 
                onClick={handleGenerateAnalysis} 
                disabled={analyzing}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <LineChart className="mr-2 h-4 w-4" />
                    Generate Market Analysis
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </AIBackground>
      
      {marketAnalysis?.market_trends ? (
        <Tabs defaultValue="market-trends">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-4">
            <TabsTrigger value="market-trends">Trends</TabsTrigger>
            <TabsTrigger value="demand-insights">Demand</TabsTrigger>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
            <TabsTrigger value="swot">SWOT</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market-trends">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>Current trends in the {requirement.industry_type} market</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.market_trends)}
              </CardContent>
            </AICard>
          </TabsContent>
          
          <TabsContent value="demand-insights">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Demand Insights</CardTitle>
                  <CardDescription>Analysis of potential demand and customer needs</CardDescription>
                </div>
                <LineChart className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.demand_insights)}
              </CardContent>
            </AICard>
          </TabsContent>
          
          <TabsContent value="competitors">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Top Competitors</CardTitle>
                  <CardDescription>Key players and their strengths in this market</CardDescription>
                </div>
                <Lightbulb className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.top_competitors)}
              </CardContent>
            </AICard>
          </TabsContent>
          
          <TabsContent value="opportunity">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Market Gap & Opportunity</CardTitle>
                  <CardDescription>The specific gap this project addresses</CardDescription>
                </div>
                <Check className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.market_gap_opportunity)}
              </CardContent>
            </AICard>
          </TabsContent>
          
          <TabsContent value="swot">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>SWOT Analysis</CardTitle>
                  <CardDescription>Strengths, Weaknesses, Opportunities, and Threats</CardDescription>
                </div>
                <AlertTriangle className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.swot_analysis)}
              </CardContent>
            </AICard>
          </TabsContent>
          
          <TabsContent value="benchmarks">
            <AICard>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Industry Benchmarks</CardTitle>
                  <CardDescription>Key performance indicators for this industry</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {formatSection(marketAnalysis.industry_benchmarks)}
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  Analysis confidence score: {marketAnalysis.confidence_score}%
                </div>
              </CardFooter>
            </AICard>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>
              {marketAnalysis?.status === "Draft" ? 
                "Your market analysis is in draft state. Generate a comprehensive analysis to understand market trends, competition, and opportunities." :
                "Generate a comprehensive market analysis for your project to understand market trends, competition, and opportunities."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <LineChart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-medium">
                {marketAnalysis?.status === "Draft" ? "Draft Market Analysis" : "No Market Analysis Yet"}
              </h3>
              <p className="text-muted-foreground max-w-md">
                Use AI to generate an in-depth market analysis for your {requirement.project_name} project
                in the {requirement.industry_type} industry.
              </p>
              {marketAnalysis?.status === "Draft" && (
                <Badge variant="outline" className="px-2 py-1">Draft</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <Button 
              onClick={handleGenerateAnalysis} 
              disabled={analyzing}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <LineChart className="mr-2 h-4 w-4" />
                  Generate Market Analysis
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MarketSense;
