import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, AlertTriangle, LineChart } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-8 rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-slate-200 animate-pulse">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {stats.map((stat) => (
        <Card
          key={stat.name}
          className={`p-8 rounded-3xl shadow-2xl bg-white/60 backdrop-blur-md border border-slate-200 hover:shadow-3xl transition-all duration-200 group animate-fadeIn`}
        >
          <div className="flex items-center gap-4 mb-3">
            <span className={`inline-flex items-center justify-center h-14 w-14 rounded-full ${stat.bg} shadow-lg group-hover:scale-110 transition`}>
              {stat.icon}
            </span>
            <span className="text-lg font-semibold text-slate-700">{stat.name}</span>
          </div>
          <h2 className={`text-5xl font-extrabold ${stat.text} animate-countup`}>{stat.value}</h2>
        </Card>
      ))}
    </div>
  );
};

export default ValidationStats;
