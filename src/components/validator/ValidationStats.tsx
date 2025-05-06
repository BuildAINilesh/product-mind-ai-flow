
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, AlertTriangle, LineChart } from "lucide-react";

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

const ValidationStats = ({ validations, loading }: ValidationStatsProps) => {
  // Calculate stats
  const totalValidations = validations.length;
  const completedValidations = validations.filter(v => v.status === "Completed").length;
  const averageScore = validations.length > 0
    ? Math.round(validations.reduce((acc, val) => acc + (val.readiness_score || 0), 0) / validations.length)
    : 0;
  const highRiskCount = validations.filter(v => (v.readiness_score || 0) < 60).length;

  const stats = [
    {
      name: "Total Validations",
      value: totalValidations,
      icon: <Shield className="h-5 w-5 text-blue-500" />,
    },
    {
      name: "Completed",
      value: completedValidations,
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
    {
      name: "Average Score",
      value: `${averageScore}`,
      icon: <LineChart className="h-5 w-5 text-purple-500" />,
    },
    {
      name: "High Risk",
      value: highRiskCount,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-7 bg-muted rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {stat.icon}
              {stat.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ValidationStats;
