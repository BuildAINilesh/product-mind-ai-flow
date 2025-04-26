
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AICard } from "@/components/ui/ai-elements";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

export function AIAnalyticsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendLabel,
  className
}: AIAnalyticsCardProps) {
  const showTrend = trend !== undefined;
  const isPositiveTrend = trend && trend >= 0;

  return (
    <AICard className={cn("overflow-hidden h-full", className)}>
      <CardHeader className="pb-2 flex justify-between items-start">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs mt-1">
              {description}
            </CardDescription>
          )}
        </div>
        {icon && (
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="text-2xl font-bold">{value}</div>
        {showTrend && (
          <div className={cn(
            "flex items-center text-xs",
            isPositiveTrend ? "text-green-500" : "text-red-500"
          )}>
            {isPositiveTrend ? (
              <ArrowUpRight size={14} className="mr-1" />
            ) : (
              <ArrowDownRight size={14} className="mr-1" />
            )}
            <span>{Math.abs(trend)}% {trendLabel || "from last period"}</span>
          </div>
        )}
      </CardContent>
    </AICard>
  );
}
