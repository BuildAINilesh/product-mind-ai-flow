
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, AlertTriangle, FileSearch } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Mock validation results
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
  const requirementId = searchParams.get('requirementId');
  
  const [requirementText, setRequirementText] = useState("");
  const [requirementTitle, setRequirementTitle] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    const fetchRequirement = async () => {
      if (!requirementId) return;
      
      setIsLoading(true);
      try {
        // Query the requirements table for the specified requirement
        const { data, error } = await supabase
          .from('requirements')
          .select('*')
          .eq('req_id', requirementId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Set the requirement title and text from the fetched data
          setRequirementTitle(data.project_name || '');
          setRequirementText(data.requirement_text || '');
          toast.success(`Loaded requirement: ${data.project_name}`);
        }
      } catch (error) {
        console.error('Error fetching requirement:', error);
        toast.error('Failed to load requirement details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequirement();
  }, [requirementId]);

  const handleValidate = () => {
    if (!requirementText.trim()) {
      toast("Please enter a requirement to validate.");
      return;
    }

    setIsValidating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setValidationResults(mockValidationResults);
      setScore(78);
      setIsValidating(false);
      toast("Requirement validation complete.");
    }, 2000);
  };

  const handleClear = () => {
    setRequirementText("");
    setRequirementTitle("");
    setValidationResults([]);
    setScore(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Requirement Validator</h1>
        <p className="text-muted-foreground">
          Analyze requirements for clarity, completeness, and consistency
        </p>
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
                    disabled={isLoading}
                  />
                  <Textarea 
                    placeholder="Enter your requirement details here..."
                    className="min-h-[200px]"
                    value={requirementText}
                    onChange={(e) => setRequirementText(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClear}>Clear</Button>
              <Button 
                disabled={isValidating || isLoading} 
                onClick={handleValidate}
              >
                {isValidating ? (
                  <>Validating<span className="animate-pulse">...</span></>
                ) : (
                  'Validate Requirement'
                )}
              </Button>
            </CardFooter>
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
};

export default RequirementValidator;
