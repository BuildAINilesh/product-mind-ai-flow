
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, AlertTriangle, Sparkles, BrainCircuit, EditIcon, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useValidation } from "@/hooks/useValidation";
import ValidationDashboardHeader from "@/components/validator/ValidationDashboardHeader";
import ValidationDashboardList from "@/components/validator/ValidationDashboardList";
import ValidationStats from "@/components/validator/ValidationStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementId = searchParams.get("requirementId");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    validations,
    loading,
    requirement,
    requirementAnalysis,
    validationData,
    isRequirementLoading,
    isValidating,
    dataFetchAttempted,
    handleValidate,
  } = useValidation(requirementId);

  // If requirementId is provided, show the validation view for that requirement
  if (requirementId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigate("/dashboard/requirements")}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Market Sense
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1">
              <EditIcon className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="validator" 
              className="gap-1"
              onClick={handleValidate}
              disabled={isValidating}
            >
              <BrainCircuit className="h-4 w-4" />
              {isValidating ? "Validating..." : validationData ? "Create TestGen" : "Analyze"}
            </Button>
          </div>
        </div>

        {isRequirementLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
            <p className="ml-2">Loading requirement...</p>
          </div>
        ) : validationData && validationData.status === "Completed" ? (
          // Show validation results only if status is Completed
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Summary and scores */}
            <div className="md:col-span-2 space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">Validation Summary</CardTitle>
                      <CardDescription>AI-powered analysis of your requirement</CardDescription>
                    </div>
                    <Badge 
                      variant={
                        validationData.validation_verdict === "validated" ? "success" : 
                        validationData.validation_verdict === "needs_refinement" ? "warning" : 
                        "destructive"
                      }
                      className="uppercase text-xs font-medium"
                    >
                      {validationData.validation_verdict === "validated" ? "Validated" : 
                       validationData.validation_verdict === "needs_refinement" ? "Needs Refinement" : 
                       "High Risk"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {validationData.validation_summary || "No summary available"}
                  </p>
                </CardContent>
              </Card>

              {/* Readiness Score Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Requirement Readiness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Readiness Score</span>
                    <span className="text-2xl font-bold">{validationData.readiness_score || 0}%</span>
                  </div>
                  <Progress 
                    value={validationData.readiness_score || 0} 
                    className={`h-2 ${
                      validationData.readiness_score >= 70 ? "bg-emerald-100" : 
                      validationData.readiness_score >= 40 ? "bg-amber-100" : 
                      "bg-red-100"
                    }`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Check className="text-green-500 h-5 w-5" />
                    <CardTitle className="text-lg">Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {validationData.strengths && validationData.strengths.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {validationData.strengths.map((strength, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {strength}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No strengths identified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column - Risks and Recommendations */}
            <div className="space-y-6">
              {/* Risks Card */}
              <Card className="border-red-100 dark:border-red-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500 h-5 w-5" />
                    <CardTitle className="text-lg">Identified Risks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {validationData.risks && validationData.risks.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {validationData.risks.map((risk, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="text-red-700 dark:text-red-400"
                        >
                          {risk}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No risks identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations Card */}
              <Card className="border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="text-blue-500 h-5 w-5" />
                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {validationData.recommendations && validationData.recommendations.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {validationData.recommendations.map((recommendation, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="text-blue-700 dark:text-blue-400"
                        >
                          {recommendation}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No recommendations available</p>
                  )}
                </CardContent>
              </Card>

              {/* Metadata Card */}
              <Card className="bg-slate-50 dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
            <div className="p-6 rounded-full bg-[#f0f2fe] mb-6">
              <BrainCircuit className="h-16 w-16 text-[#5057d9]" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Ready for Analysis</h1>
            <p className="text-muted-foreground text-lg mb-8">
              This requirement hasn't been analyzed yet. Click the "Analyze" button to generate the AI-powered analysis.
            </p>
            <Button 
              size="lg" 
              variant="validator" 
              className="gap-2 px-8" 
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="h-5 w-5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Show validations dashboard when no requirementId is provided
  return (
    <div className="space-y-6">
      <ValidationDashboardHeader showBackButton={false} />
      
      {loading && !dataFetchAttempted ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <>
          <ValidationStats validations={validations} loading={loading} />
          
          <ValidationDashboardList 
            validations={validations}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </>
      )}
    </div>
  );
};

export default RequirementValidator;
