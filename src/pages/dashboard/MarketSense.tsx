
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, BarChartHorizontal, LineChart, PieChart, Search, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Mock data for industry trends
const industryTrends = [
  { name: "AI Integration", growth: 78, competitors: 12 },
  { name: "Cloud Services", growth: 65, competitors: 24 },
  { name: "Mobile First", growth: 42, competitors: 18 },
  { name: "Voice Interface", growth: 35, competitors: 8 },
  { name: "Blockchain", growth: 28, competitors: 6 }
];

// Mock data for competitors
const competitors = [
  { 
    name: "TechFlow", 
    strengths: ["User experience", "Integration capabilities", "Support"], 
    weaknesses: ["High cost", "Complex setup"] 
  },
  { 
    name: "ReqMaster", 
    strengths: ["Affordable", "Simple to use"], 
    weaknesses: ["Limited features", "Poor scalability", "Slow updates"] 
  },
  { 
    name: "DevSync", 
    strengths: ["Advanced analytics", "Strong community"], 
    weaknesses: ["Learning curve", "Performance issues"] 
  }
];

const MarketSense = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      toast({
        description: "Your market intelligence report is ready to view.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">MarketSense</h1>
          <p className="text-muted-foreground">
            AI-powered market analysis and competitor insights
          </p>
        </div>
        {!showResults && (
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>Analyzing<span className="animate-pulse">...</span></>
            ) : (
              <>
                <Search className="h-4 w-4" /> 
                Run Market Analysis
              </>
            )}
          </Button>
        )}
      </div>

      {!showResults ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChartHorizontal className="h-8 w-8 text-primary" />
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-semibold mb-2">Market Intelligence</h3>
                <p className="text-muted-foreground">
                  Analyze market trends, discover competitor strengths and weaknesses, 
                  and get AI-powered insights to guide your product decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Industry Trends Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Industry Trends
              </CardTitle>
              <CardDescription>
                Current market growth areas and adoption trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {industryTrends.map((trend) => (
                  <div key={trend.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{trend.name}</span>
                      <span className="font-medium">{trend.growth}% growth</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${trend.growth}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {trend.competitors} competitors in this space
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Analysis Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" /> Competitor Analysis
              </CardTitle>
              <CardDescription>
                Strengths and weaknesses of market competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitors.map((competitor) => (
                  <div key={competitor.name} className="space-y-3">
                    <h4 className="font-semibold">{competitor.name}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-600 mb-1">Strengths</h5>
                        <ul className="text-sm space-y-1">
                          {competitor.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-red-600 mb-1">Weaknesses</h5>
                        <ul className="text-sm space-y-1">
                          {competitor.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketSense;
