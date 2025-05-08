import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  AlertTriangle,
  BookOpen,
  Target,
  Users,
  Globe,
  CheckCircle,
  User,
  Layers,
  FlaskConical,
  AlertCircle,
  ThumbsUp,
  PanelRight,
  Download,
  RefreshCw,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export interface BRDData {
  id: string;
  requirement_id: string;
  project_overview: string;
  problem_statement: string;
  proposed_solution: string;
  key_features: string;
  business_goals: string;
  target_audience: string;
  market_research_summary: string;
  validation_summary: string;
  user_stories_summary: string[];
  use_cases_summary: string[];
  total_tests: number;
  functional_tests: number;
  edge_tests: number;
  negative_tests: number;
  integration_tests: number;
  risks_and_mitigations: string[];
  final_recommendation: string;
  ai_signoff_confidence: number;
  status: "draft" | "ready" | "signed_off" | "rejected" | "error";
  approver_name: string | null;
  approver_comment: string | null;
  signed_off_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BRDDisplayProps {
  brdData: BRDData;
  projectName?: string;
  onRegenerate?: () => void;
  onExport?: () => void;
  onSignOff?: () => void;
  onReject?: () => void;
}

export const BRDDisplay: React.FC<BRDDisplayProps> = ({
  brdData,
  projectName,
  onRegenerate,
  onExport,
  onSignOff,
  onReject,
}) => {
  // Render status badge
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "signed_off") {
      return <Badge variant="success">Signed Off</Badge>;
    } else if (normalizedStatus === "draft") {
      return <Badge variant="warning">Draft</Badge>;
    } else if (normalizedStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    } else if (normalizedStatus === "ready") {
      return <Badge variant="secondary">Ready for Review</Badge>;
    } else if (normalizedStatus === "error") {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  // Format text with line breaks
  const formatText = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">
                Business Requirements Document
              </CardTitle>
              <p className="text-slate-500">
                {projectName || "Project"} • Last updated{" "}
                {format(new Date(brdData.updated_at), "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge(brdData.status)}
              <Badge
                variant={
                  brdData.ai_signoff_confidence >= 80
                    ? "success"
                    : brdData.ai_signoff_confidence >= 60
                    ? "secondary"
                    : "warning"
                }
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                {brdData.ai_signoff_confidence}% AI Confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main content with sidebar navigation (desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation (desktop only) */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Navigate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              <a
                href="#overview"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                Project Overview
              </a>
              <a
                href="#problem"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                Problem Statement
              </a>
              <a
                href="#solution"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Proposed Solution
              </a>
              <a
                href="#features"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <FileText className="h-4 w-4 mr-2 text-indigo-500" />
                Key Features
              </a>
              <a
                href="#goals"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <Target className="h-4 w-4 mr-2 text-red-500" />
                Business Goals
              </a>
              <a
                href="#audience"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <Users className="h-4 w-4 mr-2 text-purple-500" />
                Target Audience
              </a>
              <a
                href="#market"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <Globe className="h-4 w-4 mr-2 text-cyan-500" />
                Market Research
              </a>
              <a
                href="#validation"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                Validation Summary
              </a>
              <a
                href="#stories"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <User className="h-4 w-4 mr-2 text-teal-500" />
                User Stories
              </a>
              <a
                href="#cases"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <Layers className="h-4 w-4 mr-2 text-violet-500" />
                Use Cases
              </a>
              <a
                href="#tests"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <FlaskConical className="h-4 w-4 mr-2 text-blue-500" />
                Test Coverage
              </a>
              <a
                href="#risks"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Risks & Mitigation
              </a>
              <a
                href="#recommendation"
                className="flex items-center p-2 rounded-md hover:bg-slate-100 text-sm font-medium"
              >
                <ThumbsUp className="h-4 w-4 mr-2 text-sky-500" />
                Final Recommendation
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="overview"
          >
            {/* Project Overview */}
            <AccordionItem value="overview" id="overview">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  Project Overview
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.project_overview)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Problem Statement */}
            <AccordionItem value="problem" id="problem">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  Problem Statement
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.problem_statement)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Proposed Solution */}
            <AccordionItem value="solution" id="solution">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Proposed Solution
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.proposed_solution)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Key Features */}
            <AccordionItem value="features" id="features">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                  Key Features
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.key_features)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Business Goals */}
            <AccordionItem value="goals" id="goals">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  Business Goals
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.business_goals)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Target Audience */}
            <AccordionItem value="audience" id="audience">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Target Audience
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.target_audience)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Market Research Summary */}
            <AccordionItem value="market" id="market">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-cyan-500" />
                  Market Research Summary
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.market_research_summary)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Validation Summary */}
            <AccordionItem value="validation" id="validation">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-emerald-500" />
                  Validation Summary
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="prose max-w-none">
                  {formatText(brdData.validation_summary)}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* User Stories */}
            <AccordionItem value="stories" id="stories">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-teal-500" />
                  User Stories
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <ul className="list-disc pl-5 space-y-2">
                  {brdData.user_stories_summary.map((story, index) => (
                    <li key={index} className="text-slate-700">
                      {story}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Use Cases */}
            <AccordionItem value="cases" id="cases">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <Layers className="h-5 w-5 mr-2 text-violet-500" />
                  Use Cases
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <ul className="list-disc pl-5 space-y-2">
                  {brdData.use_cases_summary.map((useCase, index) => (
                    <li key={index} className="text-slate-700">
                      {useCase}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Test Coverage */}
            <AccordionItem value="tests" id="tests">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
                  Test Coverage
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Total</span>
                    <Badge
                      variant="default"
                      className="mt-1 text-lg font-bold h-8 flex items-center"
                    >
                      {brdData.total_tests}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Functional</span>
                    <Badge
                      variant="success"
                      className="mt-1 text-lg font-bold h-8 flex items-center"
                    >
                      {brdData.functional_tests}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Edge Cases</span>
                    <Badge
                      variant="warning"
                      className="mt-1 text-lg font-bold h-8 flex items-center"
                    >
                      {brdData.edge_tests}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Negative</span>
                    <Badge
                      variant="destructive"
                      className="mt-1 text-lg font-bold h-8 flex items-center"
                    >
                      {brdData.negative_tests}
                    </Badge>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 flex flex-col items-center">
                    <span className="text-xs text-slate-500">Integration</span>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-lg font-bold h-8 flex items-center"
                    >
                      {brdData.integration_tests}
                    </Badge>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Risks & Mitigation */}
            <AccordionItem value="risks" id="risks">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Risks & Mitigation
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <div className="flex items-center text-amber-700 mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h3 className="font-medium">
                      Identified Risks & Mitigation Strategies
                    </h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-2 text-amber-800">
                    {brdData.risks_and_mitigations.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Final Recommendation */}
            <AccordionItem value="recommendation" id="recommendation">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center">
                  <ThumbsUp className="h-5 w-5 mr-2 text-sky-500" />
                  Final Recommendation
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 px-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="prose max-w-none text-blue-800">
                    {formatText(brdData.final_recommendation)}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Sign-off Metadata Footer */}
      <Card className="border-t-4 border-t-slate-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sign-off Information</CardTitle>
        </CardHeader>
        <CardContent>
          {brdData.status === "signed_off" && brdData.approver_name ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">Approved by:</span>
                <span>{brdData.approver_name}</span>
              </div>
              {brdData.signed_off_at && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="font-medium mr-2">Signed off on:</span>
                  <span>{format(new Date(brdData.signed_off_at), "PPP")}</span>
                </div>
              )}
              {brdData.approver_comment && (
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="font-medium">Comment:</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                    {brdData.approver_comment}
                  </div>
                </div>
              )}
            </div>
          ) : brdData.status === "rejected" && brdData.approver_name ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-slate-400 mr-2" />
                <span className="font-medium mr-2">Rejected by:</span>
                <span>{brdData.approver_name}</span>
              </div>
              {brdData.signed_off_at && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2" />
                  <span className="font-medium mr-2">Rejected on:</span>
                  <span>{format(new Date(brdData.signed_off_at), "PPP")}</span>
                </div>
              )}
              {brdData.approver_comment && (
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-5 w-5 text-slate-400 mr-2" />
                    <span className="font-medium">Reason:</span>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-800">
                    {brdData.approver_comment}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 italic">
              This document has not been signed off yet.
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-wrap justify-end gap-3">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {onRegenerate && brdData.status !== "signed_off" && (
            <Button variant="outline" onClick={onRegenerate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          )}
          {onReject && brdData.status === "ready" && (
            <Button variant="destructive" onClick={onReject}>
              Reject
            </Button>
          )}
          {onSignOff && brdData.status === "ready" && (
            <Button
              variant="success"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={onSignOff}
            >
              Sign Off
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BRDDisplay;
