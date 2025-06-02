import { 
  LineChart, 
  BarChart3, 
  Lightbulb, 
  Activity, 
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
  
  // Helper to always render content as bullet points, splitting only at proper boundaries
  const renderPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Split at:
    // - Newlines
    // - Lines starting with •, -, or number+dot (e.g., 1. 2. etc)
    // - But do NOT split on dashes or bullets in the middle of a sentence
    const points = content
      .split(/(?:\r?\n|^\s*[•\-\d+\.]+\s+)/gm)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    return (
      <ul className="list-disc pl-5 space-y-1">
        {points.map((item, idx) => (
          <li key={idx} className="text-sm md:text-base">{item}</li>
        ))}
      </ul>
    );
  };

  // Helper to render SWOT as four sub-sections
  const renderSwotPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Try to split by headings (case-insensitive)
    const swotSections = {
      Strengths: '',
      Weaknesses: '',
      Opportunities: '',
      Threats: '',
    };
    // Regex to match headings
    const regex = /(Strengths?|Weaknesses?|Opportunities?|Threats?)\s*[:\-]?/gi;
    let last = null;
    let match;
    let lastIndex = 0;
    let result;
    // Find all headings and their positions
    const matches = [];
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        label: match[0].replace(/[:\-]/g, '').trim(),
        index: match.index,
      });
    }
    // If no headings found, fallback to normal points
    if (matches.length === 0) {
      return renderPoints(content);
    }
    // Extract content for each heading
    for (let i = 0; i < matches.length; i++) {
      const label = matches[i].label;
      const start = matches[i].index + matches[i].label.length;
      const end = i + 1 < matches.length ? matches[i + 1].index : content.length;
      const sectionText = content.slice(start, end).trim();
      // Normalize label
      let key = label.toLowerCase();
      if (key.startsWith('strength')) key = 'Strengths';
      else if (key.startsWith('weakness')) key = 'Weaknesses';
      else if (key.startsWith('opportunit')) key = 'Opportunities';
      else if (key.startsWith('threat')) key = 'Threats';
      else continue;
      swotSections[key] = sectionText;
    }
    // Render each section if present
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(swotSections).map(([label, text]) =>
          text ? (
            <div key={label}>
              <div className="font-semibold text-indigo-700 mb-1">{label}</div>
              {renderPoints(text)}
            </div>
          ) : null
        )}
      </div>
    );
  };

  // Helper to render Market Trends with special splitting for Firstly, Secondly, First, Second, etc. and bold the ordinal word
  const renderMarketTrendsPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Regex to split at Firstly, Secondly, Thirdly, Fourthly, Lastly, Finally, First, Second, Third, etc. (case-insensitive, at start or after period/newline)
    const splitRegex = /(?:^|\.|\n)\s*(Firstly|Secondly|Thirdly|Fourthly|Fifthly|Sixthly|Seventhly|Eighthly|Ninthly|Tenthly|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Lastly|Finally)\b/gi;
    const ordinalRegex = /^(Firstly|Secondly|Thirdly|Fourthly|Fifthly|Sixthly|Seventhly|Eighthly|Ninthly|Tenthly|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Lastly|Finally)\b/i;
    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = splitRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push(content.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }
    if (lastIndex < content.length) {
      matches.push(content.slice(lastIndex).trim());
    }
    // Remove empty points and join marker with following text
    const points = matches
      .map(str => str.replace(/^\.*\s*/, ''))
      .filter(Boolean)
      .map(str => str.replace(/\s+/g, ' '));
    // If we found at least 2 points, use this split, else fallback
    if (points.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((item, idx) => {
            const match = item.match(ordinalRegex);
            if (match) {
              const ordinal = match[0];
              const rest = item.slice(ordinal.length).trim();
              return (
                <li key={idx} className="text-sm md:text-base"><span className="font-bold">{ordinal}</span>{rest ? ' ' + rest : ''}</li>
              );
            }
            return <li key={idx} className="text-sm md:text-base">{item}</li>;
          })}
        </ul>
      );
    }
    // fallback
    return renderPoints(content);
  };

  // Helper to render Demand Insights with special splitting for Furthermore, Additionally, etc. and bold the marker
  const renderDemandInsightsPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Regex to split at Furthermore, Additionally, Moreover, Overall, In summary, In addition, Also, Finally, Lastly, etc.
    const splitRegex = /(?:^|\.|\n)\s*(Furthermore|Additionally|Moreover|Overall|In summary|In addition|Also|Finally|Lastly)\b/gi;
    const markerRegex = /^(Furthermore|Additionally|Moreover|Overall|In summary|In addition|Also|Finally|Lastly)\b/i;
    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = splitRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push(content.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }
    if (lastIndex < content.length) {
      matches.push(content.slice(lastIndex).trim());
    }
    // Remove empty points and join marker with following text
    const points = matches
      .map(str => str.replace(/^\.*\s*/, ''))
      .filter(Boolean)
      .map(str => str.replace(/\s+/g, ' '));
    // If we found at least 2 points, use this split, else fallback
    if (points.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((item, idx) => {
            const match = item.match(markerRegex);
            if (match) {
              const marker = match[0];
              const rest = item.slice(marker.length).trim();
              return (
                <li key={idx} className="text-sm md:text-base"><span className="font-bold">{marker}</span>{rest ? ' ' + rest : ''}</li>
              );
            }
            return <li key={idx} className="text-sm md:text-base">{item}</li>;
          })}
        </ul>
      );
    }
    // fallback
    return renderPoints(content);
  };

  // Helper to render Top Competitors with special splitting for marker phrases and bold the marker
  const renderTopCompetitorsPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Regex to split at marker phrases (case-insensitive, at start or after period/newline)
    const splitRegex = /(?:^|\.|\n)\s*(Additionally|Moreover|Brands like|Major Competitors|Competitors such|Another competitor|Companies like|However)\b/gi;
    const markerRegex = /^(Additionally|Moreover|Brands like|Major Competitors|Competitors such|Another competitor|Companies like|However)\b/i;
    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = splitRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push(content.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }
    if (lastIndex < content.length) {
      matches.push(content.slice(lastIndex).trim());
    }
    // Remove empty points and join marker with following text
    const points = matches
      .map(str => str.replace(/^\.*\s*/, ''))
      .filter(Boolean)
      .map(str => str.replace(/\s+/g, ' '));
    // If we found at least 2 points, use this split, else fallback
    if (points.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((item, idx) => {
            const match = item.match(markerRegex);
            if (match) {
              const marker = match[0];
              const rest = item.slice(marker.length).trim();
              return (
                <li key={idx} className="text-sm md:text-base"><span className="font-bold">{marker}</span>{rest ? ' ' + rest : ''}</li>
              );
            }
            return <li key={idx} className="text-sm md:text-base">{item}</li>;
          })}
        </ul>
      );
    }
    // fallback
    return renderPoints(content);
  };

  // Helper to render Market Gap & Opportunity with special splitting for marker phrases and bold the marker
  const renderMarketGapPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Regex to split at marker phrases (case-insensitive, at start or after period/newline)
    const splitRegex = /(?:^|\.|\n)\s*(Additionally|Moreover|While|Furthermore|However|Overall|In summary|In addition|Also|Finally|Lastly)\b/gi;
    const markerRegex = /^(Additionally|Moreover|While|Furthermore|However|Overall|In summary|In addition|Also|Finally|Lastly)\b/i;
    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = splitRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push(content.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }
    if (lastIndex < content.length) {
      matches.push(content.slice(lastIndex).trim());
    }
    // Remove empty points and join marker with following text
    const points = matches
      .map(str => str.replace(/^\.*\s*/, ''))
      .filter(Boolean)
      .map(str => str.replace(/\s+/g, ' '));
    // If we found at least 2 points, use this split, else fallback
    if (points.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((item, idx) => {
            const match = item.match(markerRegex);
            if (match) {
              const marker = match[0];
              const rest = item.slice(marker.length).trim();
              return (
                <li key={idx} className="text-sm md:text-base"><span className="font-bold">{marker}</span>{rest ? ' ' + rest : ''}</li>
              );
            }
            return <li key={idx} className="text-sm md:text-base">{item}</li>;
          })}
        </ul>
      );
    }
    // fallback
    return renderPoints(content);
  };

  // Helper to render Industry Benchmarks with special splitting for marker phrases and bold the marker
  const renderIndustryBenchmarksPoints = (content?: string) => {
    if (!content) return <ul className="list-disc pl-5 space-y-1"><li>No data available</li></ul>;
    // Regex to split at marker phrases (case-insensitive, at start or after period/newline)
    const splitRegex = /(?:^|\.|\n)\s*(Finally|Additionally|Moreover|Furthermore|However|Overall|In summary|In addition|Also|Lastly)\b/gi;
    const markerRegex = /^(Finally|Additionally|Moreover|Furthermore|However|Overall|In summary|In addition|Also|Lastly)\b/i;
    const matches = [];
    let lastIndex = 0;
    let match;
    while ((match = splitRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        matches.push(content.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index;
    }
    if (lastIndex < content.length) {
      matches.push(content.slice(lastIndex).trim());
    }
    // Remove empty points and join marker with following text
    const points = matches
      .map(str => str.replace(/^\.*\s*/, ''))
      .filter(Boolean)
      .map(str => str.replace(/\s+/g, ' '));
    // If we found at least 2 points, use this split, else fallback
    if (points.length > 1) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((item, idx) => {
            const match = item.match(markerRegex);
            if (match) {
              const marker = match[0];
              const rest = item.slice(marker.length).trim();
              return (
                <li key={idx} className="text-sm md:text-base"><span className="font-bold">{marker}</span>{rest ? ' ' + rest : ''}</li>
              );
            }
            return <li key={idx} className="text-sm md:text-base">{item}</li>;
          })}
        </ul>
      );
    }
    // fallback
    return renderPoints(content);
  };

  // Prepare the 6 sections in order
  const sectionData = [
    {
      key: 'market_trends',
      label: 'Market Trends',
      icon: <LineChart className="h-5 w-5 text-blue-500" />,
      border: 'border-blue-400',
      bg: 'bg-white/80',
      content: marketAnalysis.market_trends,
    },
    {
      key: 'demand_insights',
      label: 'Demand Insights',
      icon: <Activity className="h-5 w-5 text-green-500" />,
      border: 'border-green-400',
      bg: 'bg-white/80',
      content: marketAnalysis.demand_insights,
    },
    {
      key: 'top_competitors',
      label: 'Top Competitors',
      icon: <BarChart3 className="h-5 w-5 text-pink-500" />,
      border: 'border-pink-400',
      bg: 'bg-white/80',
      content: marketAnalysis.top_competitors,
    },
    {
      key: 'market_gap_opportunity',
      label: 'Market Gap & Opportunity',
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      border: 'border-yellow-400',
      bg: 'bg-white/80',
      content: marketAnalysis.market_gap_opportunity,
    },
    {
      key: 'swot_analysis',
      label: 'SWOT Analysis',
      icon: <Activity className="h-5 w-5 text-indigo-500" />,
      border: 'border-indigo-400',
      bg: 'bg-indigo-50/60',
      content: marketAnalysis.swot_analysis,
    },
    {
      key: 'industry_benchmarks',
      label: 'Industry Benchmarks',
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
      border: 'border-orange-400',
      bg: 'bg-white/80',
      content: marketAnalysis.industry_benchmarks,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 2x3 Grid for the 6 sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionData.slice(0, 2).map((section, idx) => (
          <div key={section.key} className={`border-l-4 ${section.border} ${section.bg} rounded-lg shadow p-4 min-h-[180px]`}>
            {section.content && (
              <>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">{section.icon}{section.label}</h3>
                <div className="pl-1">
                  {section.key === 'market_trends'
                    ? renderMarketTrendsPoints(section.content)
                    : section.key === 'demand_insights'
                      ? renderDemandInsightsPoints(section.content)
                      : renderPoints(section.content)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionData.slice(2, 4).map((section, idx) => (
          <div key={section.key} className={`border-l-4 ${section.border} ${section.bg} rounded-lg shadow p-4 min-h-[180px]`}>
            {section.content && (
              <>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">{section.icon}{section.label}</h3>
                <div className="pl-1">
                  {section.key === 'top_competitors'
                    ? renderTopCompetitorsPoints(section.content)
                    : section.key === 'market_gap_opportunity'
                      ? renderMarketGapPoints(section.content)
                      : renderPoints(section.content)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionData.slice(4, 6).map((section, idx) => (
          <div key={section.key} className={`border-l-4 ${section.border} ${section.bg} rounded-lg shadow p-4 min-h-[180px]`}>
            {section.content && (
              <>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">{section.icon}{section.label}</h3>
                <div className="pl-1">
                  {section.key === 'swot_analysis'
                    ? renderSwotPoints(section.content)
                    : section.key === 'industry_benchmarks'
                      ? renderIndustryBenchmarksPoints(section.content)
                      : renderPoints(section.content)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

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
