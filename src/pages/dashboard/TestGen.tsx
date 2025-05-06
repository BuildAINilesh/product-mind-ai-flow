
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { TestCases, generateTestCasesFromRequirements } from "@/utils/test-generation";
import TestResultPanel from "@/components/test-gen/TestResultPanel";

const TestGen = () => {
  const [requirementText, setRequirementText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<TestCases | null>(null);

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
      toast("Test cases generated successfully.");
    }, 1500);
  };

  const handleClear = () => {
    setRequirementText("");
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
          <CardContent>
            <Textarea 
              placeholder="Enter your requirements here..."
              className="min-h-[200px]"
              value={requirementText}
              onChange={(e) => setRequirementText(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleClear}>Clear</Button>
            <Button 
              disabled={isGenerating} 
              onClick={handleGenerateTests}
              className="gap-2"
            >
              {isGenerating ? (
                <>Generating<span className="animate-pulse">...</span></>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4" />
                  Generate Test Cases
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <TestResultPanel testCases={testCases} />
      </div>
    </div>
  );
};

export default TestGen;
