
import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationRisksRecommendationsProps {
  validationData: any;
  requirement?: any;
}

const ValidationRisksRecommendations = ({ validationData, requirement }: ValidationRisksRecommendationsProps) => {
  return (
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
          {validationData?.risks && validationData.risks.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {validationData.risks.map((risk: string, index: number) => (
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
          {validationData?.recommendations && validationData.recommendations.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {validationData.recommendations.map((recommendation: string, index: number) => (
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
  );
};

export default ValidationRisksRecommendations;
