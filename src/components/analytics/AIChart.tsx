
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AICard } from "@/components/ui/ai-elements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Bar, BarChart, Area, AreaChart } from "recharts";

interface AIChartProps {
  title: string;
  description?: string;
  data: any[];
  type?: "line" | "bar" | "area";
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export function AIChart({
  title,
  description,
  data,
  type = "line",
  xKey,
  yKeys,
  colors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--ai-neural-3))"],
  height = 300,
  showGrid = true,
  showTooltip = true
}: AIChartProps) {
  const config: ChartConfig = {};
  
  yKeys.forEach((key, index) => {
    config[key] = {
      color: colors[index % colors.length],
    };
  });

  return (
    <AICard className="overflow-hidden h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px]">
          {type === "line" && (
            <LineChart data={data}>
              <XAxis 
                dataKey={xKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              {showTooltip && (
                <ChartTooltip>
                  <ChartTooltipContent />
                </ChartTooltip>
              )}
              {yKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          )}
          
          {type === "bar" && (
            <BarChart data={data}>
              <XAxis 
                dataKey={xKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              {showTooltip && (
                <ChartTooltip>
                  <ChartTooltipContent />
                </ChartTooltip>
              )}
              {yKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          )}
          
          {type === "area" && (
            <AreaChart data={data}>
              <XAxis 
                dataKey={xKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              {showTooltip && (
                <ChartTooltip>
                  <ChartTooltipContent />
                </ChartTooltip>
              )}
              {yKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={`${colors[index % colors.length]}33`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
    </AICard>
  );
}
