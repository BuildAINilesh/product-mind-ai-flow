
import React from "react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, CheckCircle, XCircle, AlertCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface ValidationReportProps {
  validationData: {
    validation_verdict: string | null;
    readiness_score: number | null;
    validation_summary: string | null;
    strengths: string[] | null;
    risks: string[] | null;
    recommendations: string[] | null;
    updated_at: string;
  };
}

const ValidationReport = ({ validationData }: ValidationReportProps) => {
  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;
    
    switch (verdict.toLowerCase()) {
      case "validated":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1 text-white px-2 py-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Validated
          </Badge>
        );
      case "needs_refinement":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1 text-white px-2 py-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Needs Refinement
          </Badge>
        );
      case "high_risk":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 flex items-center gap-1 text-white px-2 py-1">
            <XCircle className="h-3.5 w-3.5" />
            High Risk
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-[#1a1528] border-b pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Validation Report</CardTitle>
              <CardDescription>
                AI-powered assessment of market readiness
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {getVerdictBadge(validationData.validation_verdict)}
              {validationData.readiness_score !== null && (
                <div className="bg-white dark:bg-slate-800 rounded-md p-2 shadow-sm border">
                  <div className="text-xs text-muted-foreground mb-1">Readiness Score</div>
                  <div className="text-xl font-semibold">
                    {validationData.readiness_score}/100
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Summary Section */}
          {validationData.validation_summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#9b87f5]/10">
                  <Shield className="h-5 w-5 text-[#9b87f5]" />
                </div>
                Summary
              </h3>
              <p className="text-muted-foreground">
                {validationData.validation_summary}
              </p>
            </div>
          )}

          <Separator />
          
          {/* Progress Bar */}
          {validationData.readiness_score !== null && (
            <div className="my-6">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium">Market Readiness</span>
                <span className="text-sm font-medium">{validationData.readiness_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className={`h-2.5 rounded-full ${
                    validationData.readiness_score > 75 ? "bg-green-500" : 
                    validationData.readiness_score > 50 ? "bg-yellow-400" : 
                    validationData.readiness_score > 25 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${validationData.readiness_score}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Key Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Strengths */}
            <Card className="border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-800 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationData.strengths && validationData.strengths.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {validationData.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No strengths identified</p>
                )}
              </CardContent>
            </Card>
            
            {/* Risks */}
            <Card className="border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-800 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Risks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationData.risks && validationData.risks.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {validationData.risks.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-red-500">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No risks identified</p>
                )}
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800 dark:text-blue-400">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validationData.recommendations && validationData.recommendations.length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {validationData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-blue-500">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900/50 border-t p-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(validationData.updated_at).toLocaleString()}
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ValidationReport;
