import { Card } from "@/components/ui/card";
import { BarChart, CheckCircle2, Clock, PieChart } from "lucide-react";
import React from "react";

interface MarketAnalysisItem {
  id: string;
  requirement_id: string;
  status: string;
  created_at: string;
}

interface MarketAnalysisStatsProps {
  analyses: MarketAnalysisItem[];
  loading: boolean;
}

// Animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<number>();
  React.useEffect(() => {
    const start = 0;
    const step = (timestamp: number) => {
      if (!ref.current) ref.current = timestamp;
      const progress = Math.min((timestamp - ref.current) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    setCount(0);
    ref.current = undefined;
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [end]);
  return count;
}

const MarketAnalysisStats = ({
  analyses,
  loading,
}: MarketAnalysisStatsProps) => {
  // Calculate stats
  const totalAnalyses = analyses.length;
  const completedAnalyses = analyses.filter(
    (a) => a.status === "Completed"
  ).length;
  const draftAnalyses = analyses.filter((a) => a.status === "Draft").length;

  // Animated stats
  const totalCount = useCountUp(totalAnalyses);
  const completedCount = useCountUp(completedAnalyses);
  const draftCount = useCountUp(draftAnalyses);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 justify-items-center mb-8">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-6 rounded-lg shadow-sm bg-white animate-pulse w-full max-w-xs"
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 w-6 rounded-full bg-muted"></div>
              </div>
              <div className="h-8 bg-muted rounded w-1/3 mt-2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 justify-items-center mb-8">
      {/* Total Analyses */}
      <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Analyses
            </h3>
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
              <PieChart className="h-3.5 w-3.5 text-white" />
            </span>
          </div>
          <h2 className="text-3xl font-bold">{totalCount}</h2>
        </div>
      </Card>

      {/* Completed */}
      <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Completed
            </h3>
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </span>
          </div>
          <h2 className="text-3xl font-bold">{completedCount}</h2>
        </div>
      </Card>

      {/* Draft */}
      <Card className="p-6 rounded-lg shadow-sm bg-white max-w-xs w-full mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Draft</h3>
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <Clock className="h-3.5 w-3.5 text-white" />
            </span>
          </div>
          <h2 className="text-3xl font-bold">{draftCount}</h2>
        </div>
      </Card>
    </div>
  );
};

export default MarketAnalysisStats;
