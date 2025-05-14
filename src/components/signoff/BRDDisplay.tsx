import React, { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BrdPdfDocument from "./BrdPdfDocument";
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
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export interface TestCase {
  id: string;
  test_type: string;
  title?: string;
  test_title?: string;
  description?: string;
  expected_result?: string;
}

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
  test_cases?: TestCase[];
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
  // Add state for managing the accordion values
  const [accordionValues, setAccordionValues] = useState<string[]>([
    "overview",
    "problem",
    "solution",
    "features",
    "goals",
    "audience",
    "market",
    "validation",
    "stories",
    "cases",
    "tests",
    "risks",
    "recommendation",
  ]);

  // Toggle all accordions
  const toggleAllAccordions = () => {
    if (accordionValues.length > 0) {
      // If any sections are open, close all
      setAccordionValues([]);
    } else {
      // Otherwise, open all
      setAccordionValues([
        "overview",
        "problem",
        "solution",
        "features",
        "goals",
        "audience",
        "market",
        "validation",
        "stories",
        "cases",
        "tests",
        "risks",
        "recommendation",
      ]);
    }
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

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "signed_off") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (normalizedStatus === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else if (normalizedStatus === "rejected") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Rejected</span>
        </div>
      );
    } else if (normalizedStatus === "ready") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">Re-Draft</span>
        </div>
      );
    } else if (normalizedStatus === "error") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">Error</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
        <span className="text-sm font-medium">{status}</span>
      </div>
    );
  };

  // Convert text to bullet points
  const formatAsBulletPoints = (text: string) => {
    if (!text) return [];

    // If it's already an array, return it
    if (Array.isArray(text)) {
      return text;
    }

    // Check if the text looks like a JSON array string
    if (typeof text === "string") {
      // First attempt: clean JSON format
      if (text.trim().startsWith("[") && text.trim().endsWith("]")) {
        try {
          const parsedArray = JSON.parse(text);
          if (Array.isArray(parsedArray)) {
            return parsedArray;
          }
        } catch (e) {
          // Try again with some cleaning in case there are escaped quotes or other issues
          try {
            // Remove escape characters that might be causing issues
            const cleanedText = text
              .replace(/\\"/g, '"') // Replace escaped quotes
              .replace(/\\n/g, " "); // Replace newlines

            // Try to parse again
            const parsedArray = JSON.parse(cleanedText);
            if (Array.isArray(parsedArray)) {
              return parsedArray;
            }
          } catch (innerError) {
            // For the specific pattern shown in the screenshot
            // Try to match a pattern like ["string1","string2",...] without proper JSON parsing
            const matches = text.match(/"([^"]*)"/g);
            if (matches) {
              return matches.map((match) => match.slice(1, -1)); // Remove the quotes
            }

            // Try one more approach - look for the exact format in the screenshot
            // Strip the outer brackets and split by the exact pattern that seems to be causing issues
            const strippedText = text.substring(1, text.length - 1);
            if (strippedText.includes('","')) {
              return strippedText.split('","').map(
                (item) => item.replace(/^"/, "").replace(/"$/, "") // Remove leading/trailing quotes
              );
            }

            console.error(
              "Error parsing JSON array string after cleaning:",
              innerError
            );
          }
        }
      }

      // Fall back to the original splitting logic
      const items = text.split(/\n|•/).filter((item) => item.trim().length > 0);
      return items.map((item) => item.trim());
    }

    return [];
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

      {/* Main content with no sidebar (removed the sidebar) */}
      <div className="space-y-4">
        {/* Show/Hide All Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={toggleAllAccordions}
            className="flex items-center gap-1"
          >
            {accordionValues.length > 0 ? (
              <>
                <ChevronUp className="h-4 w-4" /> Hide All
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" /> Show All
              </>
            )}
          </Button>
        </div>

        {/* Main Content - now takes full width */}
        <Accordion
          type="multiple"
          value={accordionValues}
          onValueChange={setAccordionValues}
          className="w-full"
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
              <ul className="list-disc pl-5 space-y-2">
                {formatAsBulletPoints(brdData.key_features).map(
                  (feature, index) => (
                    <li key={index} className="text-slate-700">
                      {typeof feature === "string" && feature.length > 200
                        ? feature.substring(0, 200) + "..."
                        : feature}
                    </li>
                  )
                )}
              </ul>
              {formatAsBulletPoints(brdData.key_features).some(
                (f) => typeof f === "string" && f.length > 200
              ) && (
                <div className="mt-3 text-xs text-amber-600">
                  <span className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Some feature descriptions were truncated due to excessive
                    length.
                  </span>
                </div>
              )}
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
              <ul className="list-disc pl-5 space-y-2">
                {formatAsBulletPoints(brdData.business_goals).map(
                  (goal, index) => (
                    <li key={index} className="text-slate-700">
                      {typeof goal === "string" && goal.length > 200
                        ? goal.substring(0, 200) + "..."
                        : goal}
                    </li>
                  )
                )}
              </ul>
              {formatAsBulletPoints(brdData.business_goals).some(
                (g) => typeof g === "string" && g.length > 200
              ) && (
                <div className="mt-3 text-xs text-amber-600">
                  <span className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Some goals were truncated due to excessive length.
                  </span>
                </div>
              )}
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
              <ul className="list-disc pl-5 space-y-2">
                {formatAsBulletPoints(brdData.target_audience).map(
                  (audience, index) => (
                    <li key={index} className="text-slate-700">
                      {typeof audience === "string" && audience.length > 200
                        ? audience.substring(0, 200) + "..."
                        : audience}
                    </li>
                  )
                )}
              </ul>
              {formatAsBulletPoints(brdData.target_audience).some(
                (a) => typeof a === "string" && a.length > 200
              ) && (
                <div className="mt-3 text-xs text-amber-600">
                  <span className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Some audience entries were truncated due to excessive
                    length.
                  </span>
                </div>
              )}
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
              <ul className="list-disc pl-5 space-y-2">
                {formatAsBulletPoints(brdData.market_research_summary).map(
                  (item, index) => (
                    <li key={index} className="text-slate-700">
                      {typeof item === "string" && item.length > 200
                        ? item.substring(0, 200) + "..."
                        : item}
                    </li>
                  )
                )}
              </ul>
              {formatAsBulletPoints(brdData.market_research_summary).some(
                (m) => typeof m === "string" && m.length > 200
              ) && (
                <div className="mt-3 text-xs text-amber-600">
                  <span className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Some market research entries were truncated due to excessive
                    length.
                  </span>
                </div>
              )}
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
              {brdData.test_cases && brdData.test_cases.length > 0 ? (
                <div className="space-y-4">
                  {["Functional", "Edge", "Negative", "Integration"].map(
                    (testType) => {
                      const testsOfType =
                        brdData.test_cases?.filter(
                          (test) =>
                            test.test_type.toLowerCase() ===
                            testType.toLowerCase()
                        ) || [];

                      return testsOfType.length > 0 ? (
                        <div key={testType} className="mb-4">
                          <h4 className="font-medium mb-2 text-slate-700">
                            {testType} Tests:
                          </h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {testsOfType.map((test, idx) => (
                              <li key={idx} className="text-slate-600">
                                {test.title ||
                                  test.test_title ||
                                  test.description?.substring(0, 50) +
                                    (test.description &&
                                    test.description.length > 50
                                      ? "..."
                                      : "") ||
                                  `${testType} Test ${idx + 1}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    }
                  )}
                </div>
              ) : (
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
              )}
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
                    <li key={index}>
                      {typeof risk === "string" && risk.length > 200
                        ? risk.substring(0, 200) + "..."
                        : risk}
                    </li>
                  ))}
                </ul>
                {brdData.risks_and_mitigations.some(
                  (r) => typeof r === "string" && r.length > 200
                ) && (
                  <div className="mt-3 text-xs text-amber-700">
                    <span className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Some risk descriptions were truncated due to excessive
                      length.
                    </span>
                  </div>
                )}
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
            <>
              {/* Primary PDF export via react-pdf */}
              <PDFDownloadLink
                document={
                  <BrdPdfDocument brdData={brdData} projectName={projectName} />
                }
                fileName={`BRD_${brdData.requirement_id}.pdf`}
                className="inline-block"
              >
                {({ loading, error }) =>
                  loading ? (
                    <Button variant="outline" disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing PDF...
                    </Button>
                  ) : error ? (
                    // Show fallback button if there's an error
                    (() => {
                      console.error("PDF Error:", error);
                      return (
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                      );
                    })()
                  ) : (
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  )
                }
              </PDFDownloadLink>
            </>
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
