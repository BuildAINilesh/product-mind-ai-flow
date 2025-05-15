import { motion } from "framer-motion";
import { Check, Share2, UserCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AICard, AIGradientText } from "@/components/ui/ai-elements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Define types for validation data
interface RequirementType {
  id: string;
  req_id?: string;
  project_name?: string;
}

interface ValidationDataType {
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

interface ValidationResultSummaryProps {
  validationData: ValidationDataType;
  requirement?: RequirementType;
  summaryOnly?: boolean;
  strengthsOnly?: boolean;
}

const ValidationResultSummary = ({
  validationData,
  requirement,
  summaryOnly,
  strengthsOnly,
}: ValidationResultSummaryProps) => {
  // Verify we have valid data
  const isValidData =
    validationData &&
    validationData.requirement_id &&
    (validationData.validation_summary || validationData.strengths);

  // Data validation check
  if (!isValidData) {
    const message = summaryOnly
      ? "Validation summary is not available"
      : strengthsOnly
      ? "Strengths data is not available"
      : "Validation data is not available";

    return (
      <AICard className="p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">{message}</p>
      </AICard>
    );
  }

  // Verify requirement match if requirement is provided
  if (requirement && validationData.requirement_id !== requirement.id) {
    console.error(`[ERROR] Validation data doesn't match requirement. 
      Validation for: ${validationData.requirement_id}, 
      Current requirement: ${requirement.id}`);

    return (
      <AICard className="p-6 flex items-center justify-center h-full">
        <p className="text-red-500">Data mismatch error. Please try again.</p>
      </AICard>
    );
  }

  if (summaryOnly) {
    return (
      <AICard
        gradient
        hover
        className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950"
      >
        {/* Header Row with Avatar (Share button removed) */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white">
                <UserCircle2 className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <AIGradientText>Validation Summary</AIGradientText>
                <Badge
                  variant={
                    validationData?.validation_verdict === "validated"
                      ? "success"
                      : validationData?.validation_verdict ===
                        "needs_refinement"
                      ? "warning"
                      : "destructive"
                  }
                  className="uppercase text-xs font-medium"
                >
                  {validationData?.validation_verdict === "validated"
                    ? "Validated"
                    : validationData?.validation_verdict === "needs_refinement"
                    ? "Needs Refinement"
                    : "High Risk"}
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your requirement
              </CardDescription>
            </div>
          </div>
        </div>
        {/* Summary Text */}
        <Card className="mb-4 bg-white/80 dark:bg-slate-900/80 shadow-none border-0">
          <CardContent className="pt-4 pb-2">
            <p className="text-muted-foreground whitespace-pre-line text-base">
              {validationData?.validation_summary || "No summary available"}
            </p>
          </CardContent>
        </Card>
      </AICard>
    );
  }
  if (strengthsOnly) {
    return (
      <AICard className="w-full p-6">
        <div className="flex items-center gap-2 mb-2">
          <Check className="text-green-500 h-5 w-5" />
          <CardTitle className="text-lg">Strengths</CardTitle>
        </div>
        {validationData?.strengths && validationData.strengths.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Strength</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.strengths.map(
                (strength: string, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold text-green-600 dark:text-green-400">
                      {index + 1}
                    </TableCell>
                    <TableCell>{strength}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No strengths identified</p>
        )}
      </AICard>
    );
  }
  // Default: both
  return (
    <AICard
      gradient
      hover
      className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950"
    >
      {/* Header Row with Avatar (Share button removed) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white">
              <UserCircle2 className="h-7 w-7" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <AIGradientText>Validation Summary</AIGradientText>
              <Badge
                variant={
                  validationData?.validation_verdict === "validated"
                    ? "success"
                    : validationData?.validation_verdict === "needs_refinement"
                    ? "warning"
                    : "destructive"
                }
                className="uppercase text-xs font-medium"
              >
                {validationData?.validation_verdict === "validated"
                  ? "Validated"
                  : validationData?.validation_verdict === "needs_refinement"
                  ? "Needs Refinement"
                  : "High Risk"}
              </Badge>
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your requirement
            </CardDescription>
          </div>
        </div>
      </div>
      {/* Summary Text */}
      <Card className="mb-4 bg-white/80 dark:bg-slate-900/80 shadow-none border-0">
        <CardContent className="pt-4 pb-2">
          <p className="text-muted-foreground whitespace-pre-line text-base">
            {validationData?.validation_summary || "No summary available"}
          </p>
        </CardContent>
      </Card>
      {/* Strengths Table - now full width */}
      <AICard className="w-full p-6">
        <div className="flex items-center gap-2 mb-2">
          <Check className="text-green-500 h-5 w-5" />
          <CardTitle className="text-lg">Strengths</CardTitle>
        </div>
        {validationData?.strengths && validationData.strengths.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Strength</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.strengths.map(
                (strength: string, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-bold text-green-600 dark:text-green-400">
                      {index + 1}
                    </TableCell>
                    <TableCell>{strength}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No strengths identified</p>
        )}
      </AICard>
    </AICard>
  );
};

export default ValidationResultSummary;
