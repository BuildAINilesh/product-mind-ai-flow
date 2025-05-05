
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, AlertTriangle, FileSearch, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AICard, AIGradientText, AIBadge } from "@/components/ui/ai-elements";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  status: string;
  validation_verdict: string | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

// Mock validation results for individual requirement validation
const mockValidationResults = [
  {
    id: 1,
    type: "warning",
    message: "Ambiguous term detected: 'user-friendly'",
    suggestion: "Consider specifying measurable criteria for user-friendliness"
  },
  {
    id: 2,
    type: "error",
    message: "Missing acceptance criteria",
    suggestion: "Add specific, testable acceptance criteria to the requirement"
  },
  {
    id: 3,
    type: "warning",
    message: "Potentially unrealistic timeline",
    suggestion: "Review the timeline with the development team"
  },
  {
    id: 4,
    type: "success",
    message: "Clear stakeholders identified",
    suggestion: null
  },
  {
    id: 5,
    type: "success",
    message: "Business value is well articulated",
    suggestion: null
  }
];

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementId = searchParams.get('requirementId');
  
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // For individual requirement validation
  const [requirementText, setRequirementText] = useState("");
  const [requirementTitle, setRequirementTitle] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);
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
        // Set the requirement title and text from the fetched data
        setRequirementTitle(data.project_name || '');
        // Using project_idea or document_summary as the requirement text since there's no requirement_text field
        setRequirementText(data.project_idea || data.document_summary || '');
        toast.success(`Loaded requirement: ${data.project_name}`);
      }
    } catch (error) {
      console.error('Error fetching requirement:', error);
      toast.error('Failed to load requirement details');
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const handleValidate = () => {
    if (!requirementText.trim()) {
      toast.error("Please enter a requirement to validate.");
      return;
    }

    setIsValidating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setValidationResults(mockValidationResults);
      setScore(78);
      setIsValidating(false);
      toast.success("Requirement validation complete.");
    }, 2000);
  };

  const handleClear = () => {
    setRequirementText("");
    setRequirementTitle("");
    setValidationResults([]);
    setScore(null);
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
            Back to Validations
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" /> Requirement Input
                </CardTitle>
                <CardDescription>
                  {requirementId 
                    ? "Review and edit the requirement before validation" 
                    : "Enter or paste your requirement for validation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input 
                      placeholder="Requirement title" 
                      className="mb-4"
                      value={requirementTitle}
                      onChange={(e) => setRequirementTitle(e.target.value)}
                      disabled={isRequirementLoading}
                    />
                    <Textarea 
                      placeholder="Enter your requirement details here..."
                      className="min-h-[200px]"
                      value={requirementText}
                      onChange={(e) => setRequirementText(e.target.value)}
                      disabled={isRequirementLoading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardContent className="flex justify-between">
                <Button variant="outline" onClick={handleClear}>Clear</Button>
                <Button 
                  disabled={isValidating || isRequirementLoading} 
                  onClick={handleValidate}
                  variant="validator"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:opacity-90"
                >
                  {isValidating ? (
                    <>Validating<span className="animate-pulse">...</span></>
                  ) : (
                    'Validate Requirement'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            {validationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                  {score !== null && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Quality Score</div>
                      <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                        <div 
                          className={`h-2.5 rounded-full ${
                            score > 80 ? "bg-green-500" : 
                            score > 60 ? "bg-yellow-400" : "bg-red-500"
                          }`}
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-muted-foreground text-right">{score}/100</div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {validationResults.map((result) => (
                      <div 
                        key={result.id} 
                        className={`p-3 rounded-md border ${
                          result.type === "error" ? "bg-red-50 border-red-200" : 
                          result.type === "warning" ? "bg-yellow-50 border-yellow-200" : 
                          "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="mr-2 mt-0.5">
                            {result.type === "error" ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : result.type === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckSquare className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              result.type === "error" ? "text-red-700" : 
                              result.type === "warning" ? "text-yellow-700" : 
                              "text-green-700"
                            }`}>{result.message}</p>
                            {result.suggestion && (
                              <p className="text-xs mt-1 text-muted-foreground">
                                Suggestion: {result.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show validations list when no requirementId is provided
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold">AI <AIGradientText>Validator</AIGradientText></h2>
          <p className="text-muted-foreground mt-1">Analyze requirements for clarity, completeness, and consistency</p>
        </div>
      </div>
      
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
                    <TableHead>Score</TableHead>
                    <TableHead>Created</TableHead>
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
                        <TableCell>{validation.readiness_score ? `${validation.readiness_score}/100` : 'Pending'}</TableCell>
                        <TableCell>{new Date(validation.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {getStatusBadge(validation.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="validator"
                            onClick={() => handleViewValidation(validation.requirements?.req_id || '')}
                          >
                            View Validation
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
