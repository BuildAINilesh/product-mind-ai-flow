import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, AlertTriangle, LineChart, Brain } from "lucide-react";
import React from "react";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  status: string;
  validation_verdict: string | null;
}

interface ValidationStatsProps {
  validations: ValidationItem[];
  loading: boolean;
}

// Animated count-up hook
function useCountUp(end: number, duration = 800) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<number>();
  React.useEffect(() => {
    let start = 0;
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

const ValidationStats = ({ validations, loading }: ValidationStatsProps) => {
  // Calculate stats
  const totalValidations = validations.length;
  const completedValidations = validations.filter(v => v.status === "Completed").length;
  const highRiskCount = validations.filter(v => (v.readiness_score || 0) < 60).length;

  // Animated stats
  const totalCount = useCountUp(totalValidations);
  const completedCount = useCountUp(completedValidations);
  const highRiskAnimated = useCountUp(highRiskCount);

  const stats = [
    {
      name: "Total Validations",
      value: totalCount,
      icon: <Shield className="h-8 w-8 text-white" />,
      bg: "bg-gradient-to-br from-blue-400 to-blue-600",
      text: "text-blue-900",
    },
    {
      name: "Completed",
      value: completedCount,
      icon: <CheckCircle2 className="h-8 w-8 text-white" />,
      bg: "bg-gradient-to-br from-green-400 to-green-600",
      text: "text-green-900",
    },
    {
      name: "High Risk",
      value: highRiskAnimated,
      icon: <AlertTriangle className="h-8 w-8 text-white" />,
      bg: "bg-gradient-to-br from-amber-400 to-amber-600",
      text: "text-amber-900",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-muted-foreground">
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center mb-8">
      {/* Total Validations */}
      <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-blue-400 transition-all duration-200 max-w-xs w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow">
            <Brain className="h-6 w-6 text-white" />
          </span>
          <span className="text-base font-semibold text-slate-700">Total Validations</span>
        </div>
        <h2 className="text-3xl font-extrabold text-blue-900 animate-countup">{totalCount}</h2>
      </Card>
      {/* Completed */}
      <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-green-400 transition-all duration-200 max-w-xs w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </span>
          <span className="text-base font-semibold text-slate-700">Completed</span>
        </div>
        <h2 className="text-3xl font-extrabold text-green-900 animate-countup">{completedCount}</h2>
      </Card>
      {/* High Risk */}
      <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-red-400 transition-all duration-200 max-w-xs w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow">
            <AlertTriangle className="h-6 w-6 text-white" />
          </span>
          <span className="text-base font-semibold text-slate-700">High Risk</span>
        </div>
        <h2 className="text-3xl font-extrabold text-red-900 animate-countup">{highRiskAnimated}</h2>
      </Card>
      {/* In Progress */}
      <Card className="p-4 rounded-xl shadow-md bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-lg hover:border-indigo-400 transition-all duration-200 max-w-xs w-full mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow">
            <LineChart className="h-6 w-6 text-white" />
          </span>
          <span className="text-base font-semibold text-slate-700">In Progress</span>
        </div>
        <h2 className="text-3xl font-extrabold text-indigo-900 animate-countup">{totalValidations - completedCount}</h2>
      </Card>
    </div>
  );
};

export default ValidationStats;
