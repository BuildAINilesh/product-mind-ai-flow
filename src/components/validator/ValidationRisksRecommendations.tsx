import { motion } from "framer-motion";
import {
  AlertTriangle,
  BrainCircuit,
  Info,
  ThumbsDown,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AICard, AIGradientText } from "@/components/ui/ai-elements";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define proper interfaces for the props
interface Requirement {
  id: string;
  req_id?: string;
  project_name?: string;
  user_id: string;
}

interface ValidationData {
  id: string;
  requirement_id: string;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  readiness_score: number | null;
  validation_verdict: string | null;
  status: string | null;
}

interface ValidationRisksRecommendationsProps {
  validationData: ValidationData;
  requirement?: Requirement;
  risksOnly?: boolean;
  recommendationsOnly?: boolean;
}

// Helper to determine severity for highlighting only
function getRiskSeverity(risk: string) {
  const text = risk.toLowerCase();
  if (
    text.includes("critical") ||
    text.includes("blocker") ||
    text.includes("security")
  ) {
    return {
      label: "Critical",
      color: "bg-red-600 text-white",
      icon: <ShieldAlert className="h-5 w-5" />,
    };
  }
  if (
    text.includes("high") ||
    text.includes("failure") ||
    text.includes("compliance")
  ) {
    return {
      label: "High",
      color: "bg-orange-500 text-white",
      icon: <AlertCircle className="h-5 w-5" />,
    };
  }
  if (
    text.includes("medium") ||
    text.includes("performance") ||
    text.includes("latency")
  ) {
    return {
      label: "Medium",
      color: "bg-yellow-400 text-white",
      icon: <AlertTriangle className="h-5 w-5" />,
    };
  }
  if (
    text.includes("low") ||
    text.includes("minor") ||
    text.includes("usability")
  ) {
    return {
      label: "Low",
      color: "bg-blue-400 text-white",
      icon: <Info className="h-5 w-5" />,
    };
  }
  return {
    label: "Unknown",
    color: "bg-gray-300 text-gray-700",
    icon: <ThumbsDown className="h-5 w-5" />,
  };
}

const ValidationRisksRecommendations = ({
  validationData,
  requirement,
  risksOnly,
  recommendationsOnly,
}: ValidationRisksRecommendationsProps) => {
  const riskCount = validationData?.risks?.length || 0;
  const risks = validationData?.risks || [];
  // Find highest severity for summary display only
  let highestSeverity = "None";
  for (const risk of risks) {
    const sev = getRiskSeverity(risk).label;
    if (["Critical", "High"].includes(sev)) {
      highestSeverity = sev;
      break;
    } else if (
      sev === "Medium" &&
      highestSeverity !== "High" &&
      highestSeverity !== "Critical"
    ) {
      highestSeverity = sev;
    } else if (sev === "Low" && highestSeverity === "None") {
      highestSeverity = sev;
    }
  }

  if (recommendationsOnly) {
    return (
      <AICard
        gradient
        hover
        className="space-y-6 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-400 text-white">
              <BrainCircuit className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <AIGradientText variant="primary">
              AI Recommendations
            </AIGradientText>
          </CardTitle>
        </div>
        {validationData?.recommendations &&
        validationData.recommendations.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.recommendations.map(
                (recommendation: string, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-base">
                      {recommendation}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">
            No recommendations available
          </p>
        )}
      </AICard>
    );
  }
  if (risksOnly) {
    return (
      <AICard
        gradient
        hover
        className="space-y-6 p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-orange-950 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-400 text-white">
                <AlertTriangle className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-red-900 dark:text-orange-200">
              <AIGradientText variant="neural">Identified Risks</AIGradientText>
            </CardTitle>
          </div>
        </div>
        {/* Summary Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-base font-medium text-orange-900 dark:text-orange-200">
            Total Risks: <span className="font-bold">{riskCount}</span>
          </span>
          <span className="text-base font-medium flex items-center gap-2">
            Highest Severity:
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                highestSeverity === "Critical"
                  ? "bg-red-600 text-white"
                  : highestSeverity === "High"
                  ? "bg-orange-500 text-white"
                  : highestSeverity === "Medium"
                  ? "bg-yellow-400 text-white"
                  : highestSeverity === "Low"
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {highestSeverity}
            </span>
          </span>
        </div>
        {/* Risk Table */}
        {risks.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk: string, index: number) => {
                // Highlight keywords
                const highlighted = risk.replace(
                  /(critical|high|medium|low|security|failure|compliance|performance|latency|usability|blocker|minor)/gi,
                  (match) =>
                    `<span class='font-bold underline text-orange-700'>${match}</span>`
                );
                return (
                  <TableRow
                    key={index}
                    className="hover:bg-orange-100/60 transition-all duration-150"
                  >
                    <TableCell className="font-bold text-red-700 dark:text-orange-300 text-lg">
                      {index + 1}
                    </TableCell>
                    <TableCell
                      className="text-base"
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">No risks identified</p>
        )}
      </AICard>
    );
  }
  // Default: both
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Recommendations Section */}
      <AICard
        gradient
        hover
        className="space-y-6 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-400 text-white">
              <BrainCircuit className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-200">
            <AIGradientText variant="primary">
              AI Recommendations
            </AIGradientText>
          </CardTitle>
        </div>
        {validationData?.recommendations &&
        validationData.recommendations.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.recommendations.map(
                (recommendation: string, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold text-blue-700 dark:text-blue-300 text-lg">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-base">
                      {recommendation}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">
            No recommendations available
          </p>
        )}
      </AICard>

      {/* Divider */}
      <div className="border-t border-slate-300 dark:border-slate-700 my-2" />

      {/* Risks Section */}
      <AICard
        gradient
        hover
        className="space-y-6 p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-orange-950 shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-400 text-white">
                <AlertTriangle className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-red-900 dark:text-orange-200">
              <AIGradientText variant="neural">Identified Risks</AIGradientText>
            </CardTitle>
          </div>
        </div>
        {/* Summary Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="text-base font-medium text-orange-900 dark:text-orange-200">
            Total Risks: <span className="font-bold">{riskCount}</span>
          </span>
          <span className="text-base font-medium flex items-center gap-2">
            Highest Severity:
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                highestSeverity === "Critical"
                  ? "bg-red-600 text-white"
                  : highestSeverity === "High"
                  ? "bg-orange-500 text-white"
                  : highestSeverity === "Medium"
                  ? "bg-yellow-400 text-white"
                  : highestSeverity === "Low"
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {highestSeverity}
            </span>
          </span>
        </div>
        {/* Risk Table */}
        {risks.length > 0 ? (
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-lg">#</TableHead>
                <TableHead className="text-lg">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.map((risk: string, index: number) => {
                // Highlight keywords
                const highlighted = risk.replace(
                  /(critical|high|medium|low|security|failure|compliance|performance|latency|usability|blocker|minor)/gi,
                  (match) =>
                    `<span class='font-bold underline text-orange-700'>${match}</span>`
                );
                return (
                  <TableRow
                    key={index}
                    className="hover:bg-orange-100/60 transition-all duration-150"
                  >
                    <TableCell className="font-bold text-red-700 dark:text-orange-300 text-lg">
                      {index + 1}
                    </TableCell>
                    <TableCell
                      className="text-base"
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-base">No risks identified</p>
        )}
      </AICard>
    </div>
  );
};

export default ValidationRisksRecommendations;
