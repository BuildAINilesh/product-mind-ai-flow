
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  AlertTriangle, 
  FileSearch, 
  Search, 
  ShieldCheck, 
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles, 
  Lightbulb,
  Shield,
  FileText,
  BrainCircuit
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AICard, AIGradientText, AIBadge, AIBackground } from "@/components/ui/ai-elements";
import { motion } from "framer-motion";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";

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
  const requirementId = searchParams.get('requirementId');
  
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // For individual requirement validation
  const [requirement, setRequirement] = useState<any>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<ValidationItem | null>(null);
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
        .from('requirement_validation')
        .select(`
          *,
          requirements (
            id,
            req_id,
            project_name,
            industry_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching validations:', error);
        toast.error('Failed to load validations');
        throw error;
      }

      if (data) {
        setValidations(data);
      }
    } catch (error) {
      console.error('Error fetching validations:', error);
      toast.error('Failed to load validations');
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
        .from('requirements')
        .select('*')
        .eq('req_id', requirementId)
        .single();
        
      if (error) {
        console.error('Error fetching requirement:', error);
        toast.error('Failed to load requirement details');
        throw error;
      }
      
      if (data) {
        setRequirement(data);
        console.log("Loaded requirement:", data);
      }
    } catch (error) {
      console.error('Error fetching requirement:', error);
      toast.error('Failed to load requirement details');
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const fetchRequirementAnalysis = async () => {
    if (!requirementId) return;
    
    try {
      // Query the requirement_analysis table for the specified requirement
      const { data: reqData, error: reqError } = await supabase
        .from('requirements')
        .select('id')
        .eq('req_id', requirementId)
        .single();
        
      if (reqError) {
        console.error('Error fetching requirement ID:', reqError);
        return;
      }
      
      if (reqData) {
        const { data, error } = await supabase
          .from('requirement_analysis')
          .select('*')
          .eq('requirement_id', reqData.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching analysis:', error);
          return;
        }
        
        if (data) {
          setRequirementAnalysis(data);
          console.log("Loaded requirement analysis:", data);
        }
      }
    } catch (error) {
      console.error('Error fetching requirement analysis:', error);
    }
  };

  const fetchExistingValidation = async (reqId: string) => {
    try {
      // First get the requirement ID (UUID) from the req_id
      const { data: reqData, error: reqError } = await supabase
        .from('requirements')
        .select('id')
        .eq('req_id', reqId)
        .single();
        
      if (reqError) {
        console.error('Error fetching requirement ID:', reqError);
        return;
      }
      
      if (reqData) {
        // Now fetch the validation using the requirement UUID
        const { data, error } = await supabase
          .from('requirement_validation')
          .select('*')
          .eq('requirement_id', reqData.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching validation:', error);
          return;
        }
        
        if (data) {
          setValidationData(data);
          console.log("Found existing validation:", data);
        }
      }
    } catch (error) {
      console.error('Error fetching existing validation:', error);
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
      const { data, error } = await supabase.functions.invoke('ai-validator', {
        body: { requirementId }
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
      console.error('Error validating requirement:', error);
      toast.error(error.message || 'Validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleViewValidation = (validationRequirementId: string) => {
    navigate(`/dashboard/validator?requirementId=${validationRequirementId}`);
  };

  const handleBackToList = () => {
    navigate('/dashboard/validator');
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <AIBadge variant="neural">Draft</AIBadge>;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <AIBadge variant="complete">Completed</AIBadge>;
      case "validating":
        return <AIBadge variant="analyzing">Validating</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      default:
        return <AIBadge variant="neural">Draft</AIBadge>;
    }
  };
  
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

  // Filter validations based on search query
  const filteredValidations = validations.filter(validation => 
    validation?.requirements?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    validation?.requirements?.req_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    validation?.requirements?.industry_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If requirementId is provided, show the validation form
  if (requirementId) {
    return (
      <div className="space-y-6">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">AI <AIGradientText>Validator</AIGradientText></h2>
              <p className="text-muted-foreground mt-1">Analyze requirements for clarity, completeness, and consistency</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Requirement Details
                </CardTitle>
                <CardDescription>
                  Review the requirement and analysis for validation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isRequirementLoading ? (
                  <>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-28 w-full" />
                  </>
                ) : requirement && (
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                      <h3 className="font-medium text-lg mb-2">{requirement.project_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="outline">ID: {requirement.req_id}</Badge>
                        <Badge variant="outline">{requirement.industry_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {requirement.project_idea || requirement.document_summary || "No description available"}
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant="validator"
                      disabled={isValidating || !requirementAnalysis} 
                      onClick={handleValidate}
                    >
                      {isValidating ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          Validating...
                        </>
                      ) : validationData?.status === "Completed" ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Re-validate Requirement
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Validate Requirement
                        </>
                      )}
                    </Button>
                    
                    {!requirementAnalysis && (
                      <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
                        <AlertTriangle className="h-4 w-4 mx-auto mb-2 text-amber-500" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          This requirement needs to be analyzed first before validation can be performed.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis & Validation */}
          <div className="md:col-span-7">
            {isValidating ? (
              <Card>
                <CardHeader>
                  <CardTitle>AI Validation in Progress</CardTitle>
                  <CardDescription>
                    Please wait while our AI analyzes the requirement and market data
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-8">
                  <div className="animate-pulse flex flex-col items-center">
                    <Sparkles className="h-12 w-12 text-[#9b87f5] mb-4" />
                    <p className="text-center mb-4">
                      AI is evaluating the requirement against market data...
                    </p>
                    <Progress value={50} className="w-64 h-2" />
                  </div>
                </CardContent>
              </Card>
            ) : validationData ? (
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
            ) : (
              requirementAnalysis ? (
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
                  
                  {/* Validation card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#9b87f5]" /> 
                        AI Validation
                      </CardTitle>
                      <CardDescription>
                        Validate this requirement against market data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <div className="text-center mb-6">
                        <div className="inline-flex p-3 rounded-full bg-[#9b87f5]/10 mb-4">
                          <Shield className="h-10 w-10 text-[#9b87f5]" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Ready for Validation</h3>
                        <p className="text-muted-foreground max-w-md">
                          Let AI evaluate this requirement against market data to determine market readiness,
                          identify strengths, risks, and provide recommendations.
                        </p>
                      </div>
                      <Button
                        variant="validator"
                        size="lg"
                        className="gap-2"
                        onClick={handleValidate}
                        disabled={isValidating}
                      >
                        <Shield className="h-5 w-5" />
                        Start Validation
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Requirement Analysis Required</CardTitle>
                    <CardDescription>
                      This requirement needs to be analyzed first
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-12 text-center">
                    <div className="inline-flex p-4 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-6">
                      <AlertTriangle className="h-12 w-12 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-medium mb-3">Analysis Required</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Before validating this requirement, you need to analyze it first.
                      Please go to the Requirement Analysis page to generate insights.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/dashboard/requirements?id=${requirementId}`)}
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      View Requirement
                    </Button>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show validations list when no requirementId is provided
  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">AI <AIGradientText>Validator</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">Analyze requirements for clarity, completeness, and consistency</p>
          </div>
        </div>
      </AIBackground>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <AICard>
          <CardHeader>
            <CardTitle>Requirement Validations</CardTitle>
            <CardDescription>
              View and manage your AI-powered requirement validations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search validations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead className="w-[300px]">Project</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Verdict</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValidations.length > 0 ? (
                    filteredValidations.map((validation) => (
                      <TableRow key={validation.id}>
                        <TableCell className="font-medium">{validation.requirements?.req_id || 'N/A'}</TableCell>
                        <TableCell>{validation.requirements?.project_name || 'Unknown Project'}</TableCell>
                        <TableCell>{validation.requirements?.industry_type || 'N/A'}</TableCell>
                        <TableCell>
                          {validation.validation_verdict ? (
                            <Badge 
                              className={
                                validation.validation_verdict === "validated" ? "bg-green-500" :
                                validation.validation_verdict === "needs_refinement" ? "bg-yellow-500" :
                                "bg-red-500"
                              }
                            >
                              {validation.validation_verdict === "validated" ? "Validated" :
                               validation.validation_verdict === "needs_refinement" ? "Needs Refinement" :
                               "High Risk"}
                            </Badge>
                          ) : (
                            "Pending"
                          )}
                        </TableCell>
                        <TableCell>{validation.readiness_score ? `${validation.readiness_score}/100` : 'Pending'}</TableCell>
                        <TableCell>{new Date(validation.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {getStatusBadge(validation.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="validator"
                            onClick={() => handleViewValidation(validation.requirements?.req_id || '')}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            View Validation
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="h-8 w-8 text-muted-foreground/60" />
                          <p>No validations found. Try a different search or validate a requirement.</p>
                          <Button 
                            className="mt-2"
                            variant="outline"
                            onClick={() => navigate('/dashboard/requirements')}
                          >
                            Go to Requirements
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </AICard>
      )}
    </div>
  );
};

export default RequirementValidator;
