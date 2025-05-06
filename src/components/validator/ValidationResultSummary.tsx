
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ValidationResultSummaryProps {
  validationData: any;
  requirement?: any;
}

const ValidationResultSummary = ({ validationData, requirement }: ValidationResultSummaryProps) => {
  return (
    <div className="space-y-6">
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
                validationData?.validation_verdict === "validated" ? "success" : 
                validationData?.validation_verdict === "needs_refinement" ? "warning" : 
                "destructive"
              }
              className="uppercase text-xs font-medium"
            >
              {validationData?.validation_verdict === "validated" ? "Validated" : 
               validationData?.validation_verdict === "needs_refinement" ? "Needs Refinement" : 
               "High Risk"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-line">
            {validationData?.validation_summary || "No summary available"}
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
            <span className="text-2xl font-bold">{validationData?.readiness_score || 0}%</span>
          </div>
          <Progress 
            value={validationData?.readiness_score || 0} 
            className={`h-2 ${
              validationData?.readiness_score >= 70 ? "bg-emerald-100" : 
              validationData?.readiness_score >= 40 ? "bg-amber-100" : 
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
          {validationData?.strengths && validationData.strengths.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {validationData.strengths.map((strength: string, index: number) => (
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
  );
};

export default ValidationResultSummary;
