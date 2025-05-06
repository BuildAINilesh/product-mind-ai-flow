
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; 
import { ClipboardCheck, FileText, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { TestCases, generateTestCasesFromRequirements } from "@/utils/test-generation";
import TestResultPanel from "@/components/test-gen/TestResultPanel";
import { supabase } from "@/integrations/supabase/client";

const TestGen = () => {
  const [requirementText, setRequirementText] = useState("");
  const [requirementId, setRequirementId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testCases, setTestCases] = useState<TestCases | null>(null);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);

  // Fetch requirements on component mount
  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setIsLoadingRequirements(true);
      const { data, error } = await supabase
        .from("requirements")
        .select("id, req_id, project_name")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setRequirements(data || []);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setIsLoadingRequirements(false);
    }
  };

  const handleGenerateTests = () => {
    if (!requirementText.trim()) {
      toast("Please enter requirements to generate test cases.");
      return;
    }

    setIsGenerating(true);
    
    // Generate test cases based on input requirements
    setTimeout(() => {
      const generatedTests = generateTestCasesFromRequirements(requirementText);
      setTestCases(generatedTests);
      setIsGenerating(false);
      toast.success("Test cases generated successfully.");
    }, 1500);
  };

  const handleSaveTestCases = async () => {
    if (!testCases || !requirementId) {
      toast.error("Please generate test cases and select a requirement first.");
      return;
    }

    setIsSaving(true);

    try {
      // Save test cases to the database
      const allTestCases = [
        ...testCases.functional.map(tc => ({ ...tc, type: 'functional' })),
        ...testCases.integration.map(tc => ({ ...tc, type: 'integration' })),
        ...testCases.user.map(tc => ({ ...tc, type: 'functional' }))  // Map user tests as functional type
      ];
      
      // Prepare data for insertion
      const testCasesForDb = allTestCases.map(tc => ({
        requirement_id: requirementId,
        test_title: tc.title,
        steps: JSON.stringify(tc.steps),
        expected_result: tc.expectedResult,
        type: tc.type
      }));
      
      const { error } = await supabase
        .from('test_cases')
        .insert(testCasesForDb);
      
      if (error) throw error;
      
      // Update forgeflow table status
      await supabase
        .from('forgeflow')
        .upsert({ 
          requirement_id: requirementId,
          test_cases_status: 'Completed'
        }, { 
          onConflict: 'requirement_id' 
        });
      
      toast.success("Test cases saved to database successfully");
    } catch (error) {
      console.error("Error saving test cases:", error);
      toast.error("Failed to save test cases");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setRequirementText("");
    setRequirementId("");
    setTestCases(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ForgeFlow AI</h1>
        <p className="text-muted-foreground">
          Generate comprehensive test cases from requirements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Requirements Input
            </CardTitle>
            <CardDescription>
              Enter or paste your requirements to generate test cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="requirement-select" className="block text-sm font-medium mb-1">
                Select Requirement (Optional)
              </label>
              <select
                id="requirement-select"
                className="w-full p-2 border rounded-md bg-background"
                value={requirementId}
                onChange={(e) => setRequirementId(e.target.value)}
                disabled={isLoadingRequirements}
              >
                <option value="">-- Select a requirement --</option>
                {requirements.map((req) => (
                  <option key={req.id} value={req.id}>
                    {req.req_id}: {req.project_name}
                  </option>
                ))}
              </select>
            </div>
            
            <Textarea 
              placeholder="Enter your requirements here..."
              className="min-h-[200px]"
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClear}>Clear</Button>
            <div className="space-x-2">
              {testCases && requirementId && (
                <Button 
                  variant="outline" 
                  onClick={handleSaveTestCases}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>Save to Database</>
                  )}
                </Button>
              )}
              <Button 
                disabled={isGenerating} 
                onClick={handleGenerateTests}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="h-4 w-4" />
                    Generate Test Cases
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <TestResultPanel 
          testCases={testCases} 
        />
      </div>
    </div>
  );
};

export default TestGen;
