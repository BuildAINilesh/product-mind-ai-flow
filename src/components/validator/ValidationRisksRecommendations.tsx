import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AICard, AIGradientText } from "@/components/ui/ai-elements";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as recharts from "recharts";
const { BarChart, Bar, XAxis, YAxis, Tooltip: ChartTooltip, ResponsiveContainer } = recharts;

interface ValidationRisksRecommendationsProps {
  validationData: any;
  requirement?: any;
}

const ValidationRisksRecommendations = ({ validationData, requirement }: ValidationRisksRecommendationsProps) => {
  const riskCount = validationData?.risks?.length || 0;
  const riskChartData = [
    { name: "Risks", value: riskCount },
    { name: "Safe", value: Math.max(5 - riskCount, 0) },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Recommendations Section */}
      <AICard gradient hover className="space-y-6 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-400 text-white">
              <BrainCircuit className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <AIGradientText variant="primary">AI Recommendations</AIGradientText>
          </CardTitle>
        </div>
        {validationData?.recommendations && validationData.recommendations.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.recommendations.map((recommendation: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-blue-700 dark:text-blue-300 text-lg">{index + 1}</TableCell>
                  <TableCell className="text-base">{recommendation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">No recommendations available</p>
        )}
      </AICard>

      {/* Divider */}
      <div className="border-t border-slate-300 dark:border-slate-700 my-2" />

      {/* Risks Section */}
      <AICard gradient hover className="space-y-6 p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-orange-950 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-400 text-white">
              <AlertTriangle className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-red-900 dark:text-orange-200">
            <AIGradientText variant="neural">Identified Risks</AIGradientText>
          </CardTitle>
        </div>
        {riskCount > 0 && (
          <div className="w-full h-28 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <ChartTooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {validationData?.risks && validationData.risks.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.risks.map((risk: string, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-bold text-red-700 dark:text-orange-300 text-lg">{index + 1}</TableCell>
                  <TableCell className="text-base">{risk}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">No risks identified</p>
        )}
      </AICard>

      {/* Divider */}
      <div className="border-t border-slate-300 dark:border-slate-700 my-2" />

      {/* Metadata Section */}
      <Card className="bg-slate-50 dark:bg-slate-900 mt-2 p-5 max-w-2xl mx-auto shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-muted-foreground">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-base">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requirement ID:</span>
            <span>{requirement?.req_id || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Industry:</span>
            <span>{requirement?.industry_type || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated:</span>
            <span>{validationData?.updated_at ? new Date(validationData.updated_at).toLocaleString() : "N/A"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidationRisksRecommendations;
