import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIBackground, AIGradientText } from "@/components/ui/ai-elements";
import {
  ChevronLeft,
  Shield,
  AlertTriangle,
  Sparkles,
  BrainCircuit,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  validation_verdict: string | null;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementId = searchParams.get("requirementId");

  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // For individual requirement validation
  const [requirement, setRequirement] = useState<any>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<ValidationItem | null>(
    null
  );
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);

  // Fetch validation list when component loads (no requirementId is provided)
  useEffect(() => {
    if (!requirementId) {
      fetchValidations();
    }
  }, [requirementId]);

  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    if (requirementId) {
      fetchRequirement();
      fetchRequirementAnalysis();
      // Check if validation already exists for this requirement
      fetchExistingValidation(requirementId);
    }
  }, [requirementId]);

  const fetchValidations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("requirement_validation")
        .select(
          `
          *,
          requirements (
            id,
            req_id,
            project_name,
            industry_type
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching validations:", error);
        toast.error("Failed to load validations");
        throw error;
      }

      if (data) {
        setValidations(data);
      }
    } catch (error) {
      console.error("Error fetching validations:", error);
      toast.error("Failed to load validations");
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirement = async () => {
    if (!requirementId) return;

    setIsRequirementLoading(true);
    try {
      // Query the requirements table for the specified requirement
      const { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("req_id", requirementId)
        .single();

      if (error) {
        console.error("Error fetching requirement:", error);
        toast.error("Failed to load requirement details");
        throw error;
      }

      if (data) {
        setRequirement(data);
        console.log("Loaded requirement:", data);
      }
    } catch (error) {
      console.error("Error fetching requirement:", error);
      toast.error("Failed to load requirement details");
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const fetchRequirementAnalysis = async () => {
    if (!requirementId) return;

    try {
      // Query the requirement_analysis table for the specified requirement
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id")
        .eq("req_id", requirementId)
        .single();

      if (reqError) {
        console.error("Error fetching requirement ID:", reqError);
        return;
      }

      if (reqData) {
        const { data, error } = await supabase
          .from("requirement_analysis")
          .select("*")
          .eq("requirement_id", reqData.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching analysis:", error);
          return;
        }

        if (data) {
          setRequirementAnalysis(data);
          console.log("Loaded requirement analysis:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching requirement analysis:", error);
    }
  };

  const fetchExistingValidation = async (reqId: string) => {
    try {
      // First get the requirement ID (UUID) from the req_id
      const { data: reqData, error: reqError } = await supabase
        .from("requirements")
        .select("id")
        .eq("req_id", reqId)
        .single();

      if (reqError) {
        console.error("Error fetching requirement ID:", reqError);
        return;
      }

      if (reqData) {
        // Now fetch the validation using the requirement UUID
        const { data, error } = await supabase
          .from("requirement_validation")
          .select("*")
          .eq("requirement_id", reqData.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching validation:", error);
          return;
        }

        if (data) {
          setValidationData(data);
          console.log("Found existing validation:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching existing validation:", error);
    }
  };

  const handleValidate = async () => {
    if (!requirementId) {
      toast.error("Requirement ID is missing");
      return;
    }

    setIsValidating(true);

    try {
      toast.info("Starting AI validation process...", { duration: 2000 });

      // Call the AI validator edge function
      const { data, error } = await supabase.functions.invoke("ai-validator", {
        body: { requirementId },
      });

      if (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.message || "Validation process failed");
      }

      // Update the local state with the validation results
      setValidationData(data.record[0] || data.data);

      toast.success("Requirement validation complete!");
    } catch (error) {
      console.error("Error validating requirement:", error);
      toast.error(error.message || "Validation failed. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleViewValidation = (validationRequirementId: string) => {
    navigate(`/dashboard/validator?requirementId=${validationRequirementId}`);
  };

  const handleBackToList = () => {
    navigate("/dashboard/validator");
  };

  const handleNavigateToRequirements = () => {
    navigate("/dashboard/requirements");
  };

  // Filter validations based on search query
  const filteredValidations = validations.filter(
    (validation) =>
      validation?.requirements?.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      validation?.requirements?.req_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      validation?.requirements?.industry_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Placeholder component for ValidationInProgress
  const ValidationInProgressPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          AI Validation in Progress
        </CardTitle>
        <CardDescription>
          Please wait while our AI analyzes the requirement and market data
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-10">
        <div className="animate-pulse flex flex-col items-center max-w-md">
          <div className="p-3 rounded-full bg-[#9b87f5]/10 mb-6">
            <Sparkles className="h-12 w-12 text-[#9b87f5]" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-center">
            Processing Your Requirement
          </h3>
          <p className="text-center mb-6 text-muted-foreground">
            Analyzing requirement details...
          </p>
          <div className="w-full mb-2">
            <Progress value={60} className="h-2 w-full" />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This may take up to 1-2 minutes to complete
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder component for ValidationIntro
  const ValidationIntroPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-[#9b87f5]" />
          AI Validation
        </CardTitle>
        <CardDescription>
          Validate this requirement against market data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">No validation available</h3>
              <p className="text-sm text-muted-foreground">
                Click the "Start Validation" button to begin the AI-powered
                validation process. This will evaluate the requirement against
                market data to determine market readiness, identify strengths,
                risks, and provide recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10"
            onClick={handleValidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Start Validation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder component for MissingAnalysis
  const MissingAnalysisPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit className="h-5 w-5 text-[#9b87f5]" />
          Ready for Analysis
        </CardTitle>
        <CardDescription>
          This requirement needs to be analyzed first
        </CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-[#9b87f5]/10 mb-6">
          <BrainCircuit className="h-12 w-12 text-[#9b87f5]" />
        </div>
        <h3 className="text-xl font-medium mb-3">Analysis Required</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          This requirement hasn't been analyzed yet. Before validating this
          requirement, you need to analyze it first. Click the "Analyze" button
          to generate the AI-powered analysis.
        </p>
        <Button
          variant="default"
          className="bg-gradient-to-r from-primary to-blue-700 hover:opacity-90"
          onClick={() =>
            navigate(`/dashboard/requirements?id=${requirementId}`)
          }
        >
          <BrainCircuit className="h-4 w-4 mr-2" />
          Analyze Requirement
        </Button>
      </CardContent>
    </Card>
  );

  // Placeholder for RequirementCard
  const RequirementCardPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>Requirement Details</CardTitle>
        <CardDescription>
          {isRequirementLoading ? "Loading..." : requirement?.project_name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>ID:</strong> {requirement?.req_id}
          </div>
          <div>
            <strong>Industry:</strong> {requirement?.industry_type}
          </div>
          <div>
            <strong>Status:</strong> {requirement?.status}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Placeholder for ValidationReport
  const ValidationReportPlaceholder = () => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#9b87f5]" />
          Validation Report
        </CardTitle>
        <CardDescription>
          AI validation results for this requirement
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationData ? (
          <div className="space-y-4">
            <div>
              <strong>Score:</strong> {validationData.readiness_score || "N/A"}
            </div>
            <div>
              <strong>Verdict:</strong>{" "}
              {validationData.validation_verdict || "N/A"}
            </div>
            <div>
              <strong>Summary:</strong>{" "}
              {validationData.validation_summary || "No summary available"}
            </div>
            {validationData.strengths &&
              validationData.strengths.length > 0 && (
                <div>
                  <strong>Strengths:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {validationData.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            {validationData.risks && validationData.risks.length > 0 && (
              <div>
                <strong>Risks:</strong>
                <ul className="list-disc pl-5 mt-2">
                  {validationData.risks.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationData.recommendations &&
              validationData.recommendations.length > 0 && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul className="list-disc pl-5 mt-2">
                    {validationData.recommendations.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No validation data available
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Placeholder for ValidationList
  const ValidationListPlaceholder = () => (
    <Card className="border">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Validation List</CardTitle>
          <Button onClick={handleNavigateToRequirements}>
            View Requirements
          </Button>
        </div>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search validations..."
            className="w-full p-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredValidations.length > 0 ? (
          <div className="space-y-4">
            {filteredValidations.map((validation) => (
              <Card
                key={validation.id}
                className="p-4 shadow-sm hover:shadow transition cursor-pointer"
                onClick={() =>
                  handleViewValidation(validation.requirements?.req_id || "")
                }
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {validation.requirements?.project_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {validation.requirements?.req_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Industry: {validation.requirements?.industry_type}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                      {validation.status}
                    </div>
                    {validation.readiness_score && (
                      <div className="mt-2 text-right text-sm font-semibold">
                        Score: {validation.readiness_score}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No validations found. Try adjusting your search or create new
            validations.
          </div>
        )}
      </CardContent>
    </Card>
  );

  // If requirementId is provided, show the validation form
  if (requirementId) {
    return (
      <div className="space-y-6">
        <AIBackground
          variant="neural"
          intensity="medium"
          className="rounded-lg mb-6 p-6"
        >
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">
                AI <AIGradientText>Validator</AIGradientText>
              </h2>
              <p className="text-muted-foreground mt-1">
                Analyze requirements for clarity, completeness, and consistency
              </p>
            </div>

            <Button
              onClick={handleBackToList}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Validations
            </Button>
          </div>
        </AIBackground>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column - Requirement Details */}
          <div className="md:col-span-5">
            <RequirementCardPlaceholder />
          </div>

          {/* Right Column - Analysis & Validation */}
          <div className="md:col-span-7">
            {isValidating ? (
              <ValidationInProgressPlaceholder />
            ) : validationData ? (
              <ValidationReportPlaceholder />
            ) : requirementAnalysis ? (
              <div className="space-y-6">
                {/* Analysis view */}
                <RequirementAnalysisView
                  project={requirement}
                  analysis={requirementAnalysis}
                  loading={isRequirementLoading}
                  onRefresh={() => {
                    fetchRequirementAnalysis();
                    toast.success("Analysis refreshed");
                  }}
                />

                {/* Validation intro card */}
                <ValidationIntroPlaceholder />
              </div>
            ) : (
              <MissingAnalysisPlaceholder />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show validations list when no requirementId is provided
  return (
    <div className="space-y-6">
      <AIBackground
        variant="neural"
        intensity="medium"
        className="rounded-lg mb-6 p-6"
      >
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">
              AI <AIGradientText>Validator</AIGradientText>
            </h2>
            <p className="text-muted-foreground mt-1">
              Analyze requirements for clarity, completeness, and consistency
            </p>
          </div>
        </div>
      </AIBackground>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <ValidationListPlaceholder />
      )}
    </div>
  );
};

export default RequirementValidator;
