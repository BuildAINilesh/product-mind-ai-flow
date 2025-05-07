
import { 
  LineChart, 
  BarChart3, 
  Lightbulb, 
  Activity, 
  Network,
  AlertTriangle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ResearchSourcesSection, { ResearchSource } from "./ResearchSourcesSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface MarketAnalysisData {
  market_trends?: string;
  target_audience?: string;
  demand_insights?: string;
  top_competitors?: string;
  market_gap_opportunity?: string;
  swot_analysis?: string;
  industry_benchmarks?: string;
  confidence_score?: number;
  research_sources?: string;
  status?: string;
}

interface MarketAnalysisContentProps {
  marketAnalysis: MarketAnalysisData;
  researchSources: ResearchSource[];
}

export const MarketAnalysisContent = ({ 
  marketAnalysis, 
  researchSources 
}: MarketAnalysisContentProps) => {
  const isMobile = useIsMobile();
  
  // Format section function to transform content with bullets
  const formatSection = (content?: string) => {
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
              <li key={index} className="text-sm md:text-base">{item}</li>
            ))}
        </ul>
      );
    }
    
    // If no bullet points, just return the text with paragraphs
    return content.split("\n").map((paragraph, index) => (
      paragraph ? <p key={index} className="mb-2 text-sm md:text-base">{paragraph}</p> : null
    ));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Market Trends Section */}
      <div>
        <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
          <LineChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Market Trends
        </h3>
        <div className="p-3 md:p-4 border rounded-lg">
          {formatSection(marketAnalysis.market_trends)}
        </div>
      </div>
      
      {/* Target Audience Section */}
      {marketAnalysis.target_audience && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <Network className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Target Audience
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.target_audience)}
          </div>
        </div>
      )}
      
      {/* Demand Insights Section */}
      {marketAnalysis.demand_insights && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Demand Insights
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.demand_insights)}
          </div>
        </div>
      )}
      
      {/* Top Competitors Section */}
      {marketAnalysis.top_competitors && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Top Competitors
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.top_competitors)}
          </div>
        </div>
      )}
      
      {/* Market Gap & Opportunity Section */}
      {marketAnalysis.market_gap_opportunity && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Market Gap & Opportunity
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.market_gap_opportunity)}
          </div>
        </div>
      )}
      
      {/* SWOT Analysis Section */}
      {marketAnalysis.swot_analysis && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            SWOT Analysis
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.swot_analysis)}
          </div>
        </div>
      )}
      
      {/* Industry Benchmarks Section */}
      {marketAnalysis.industry_benchmarks && (
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Industry Benchmarks
          </h3>
          <div className="p-3 md:p-4 border rounded-lg">
            {formatSection(marketAnalysis.industry_benchmarks)}
          </div>
        </div>
      )}
      
      {/* Confidence Score Display */}
      {marketAnalysis.confidence_score && (
        <div className="mt-4 p-3 md:p-4 border rounded-lg bg-muted/20">
          <h3 className="text-xs md:text-sm font-medium mb-2">Analysis Confidence Score</h3>
          <div className="flex items-center">
            <Progress value={marketAnalysis.confidence_score} className="h-2 flex-1" />
            <span className="ml-2 text-xs md:text-sm font-medium">{marketAnalysis.confidence_score}%</span>
          </div>
        </div>
      )}
      
      {/* Research Sources Section */}
      <ResearchSourcesSection 
        researchSources={researchSources}
        legacySources={marketAnalysis.research_sources}
      />
    </div>
  );
};

export default MarketAnalysisContent;
