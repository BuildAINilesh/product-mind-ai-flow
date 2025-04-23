
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck, Check, FileText, Copy, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

// Mock test cases
const mockTestCases = {
  functional: [
    {
      id: "TC001",
      title: "User Login Validation",
      description: "Verify that a user can login with valid credentials",
      steps: [
        "Navigate to login page",
        "Enter valid username and password",
        "Click the login button"
      ],
      expectedResult: "User is authenticated and redirected to dashboard"
    },
    {
      id: "TC002",
      title: "Invalid Login Attempt",
      description: "Verify that appropriate error message is shown for invalid login",
      steps: [
        "Navigate to login page",
        "Enter invalid username or password",
        "Click the login button"
      ],
      expectedResult: "Error message is displayed and user remains on login page"
    },
    {
      id: "TC003",
      title: "Password Reset",
      description: "Verify that a user can reset their password",
      steps: [
        "Navigate to login page",
        "Click 'Forgot Password' link",
        "Enter registered email",
        "Submit request"
      ],
      expectedResult: "Password reset confirmation message is shown"
    }
  ],
  integration: [
    {
      id: "TC004",
      title: "API Authentication Flow",
      description: "Verify that authentication tokens are properly generated and validated",
      steps: [
        "Authenticate user via API endpoint",
        "Retrieve authentication token",
        "Use token to access protected resource"
      ],
      expectedResult: "Protected resource is accessible with valid token"
    },
    {
      id: "TC005",
      title: "Database Persistence",
      description: "Verify that user data is properly stored in the database",
      steps: [
        "Create new user via API",
        "Query database for user record"
      ],
      expectedResult: "User record exists in database with correct information"
    }
  ],
  user: [
    {
      id: "TC006",
      title: "Dashboard Navigation",
      description: "Verify that users can navigate through the dashboard interface",
      steps: [
        "Login to application",
        "Click on different navigation items",
        "Observe page transitions"
      ],
      expectedResult: "User can access all sections of the dashboard smoothly"
    },
    {
      id: "TC007",
      title: "Mobile Responsiveness",
      description: "Verify that the interface adapts correctly to mobile screen sizes",
      steps: [
        "Access application on mobile device",
        "Navigate through key workflows"
      ],
      expectedResult: "Interface is usable and properly formatted on mobile devices"
    }
  ]
};

const TestGen = () => {
  const [requirementText, setRequirementText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCases, setTestCases] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("functional");

  const handleGenerateTests = () => {
    if (!requirementText.trim()) {
      toast({
        description: "Please enter requirements to generate test cases.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setTestCases(mockTestCases);
      setIsGenerating(false);
      toast({
        description: "Test cases generated successfully.",
      });
    }, 2000);
  };

  const handleCopyTestCase = (testCase: any) => {
    const textToCopy = `ID: ${testCase.id}
Title: ${testCase.title}
Description: ${testCase.description}
Steps:
${testCase.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}
Expected Result: ${testCase.expectedResult}`;

    navigator.clipboard.writeText(textToCopy);
    
    toast({
      description: "Test case copied to clipboard.",
    });
  };

  const handleClear = () => {
    setRequirementText("");
    setTestCases(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">TestGen</h1>
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

        {testCases && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Test Cases</CardTitle>
              <CardDescription>
                Test cases generated based on your requirements
              </CardDescription>
              <Tabs defaultValue="functional" className="mt-2" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="functional">Functional</TabsTrigger>
                  <TabsTrigger value="integration">Integration</TabsTrigger>
                  <TabsTrigger value="user">User</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                <TabsContent value="functional" className="m-0">
                  {testCases.functional.map((testCase: any) => (
                    <TestCaseCard 
                      key={testCase.id} 
                      testCase={testCase} 
                      onCopy={() => handleCopyTestCase(testCase)} 
                    />
                  ))}
                </TabsContent>
                <TabsContent value="integration" className="m-0">
                  {testCases.integration.map((testCase: any) => (
                    <TestCaseCard 
                      key={testCase.id} 
                      testCase={testCase} 
                      onCopy={() => handleCopyTestCase(testCase)} 
                    />
                  ))}
                </TabsContent>
                <TabsContent value="user" className="m-0">
                  {testCases.user.map((testCase: any) => (
                    <TestCaseCard 
                      key={testCase.id} 
                      testCase={testCase} 
                      onCopy={() => handleCopyTestCase(testCase)} 
                    />
                  ))}
                </TabsContent>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const TestCaseCard = ({ testCase, onCopy }: { testCase: any, onCopy: () => void }) => {
  return (
    <div className="p-4 border rounded-lg mb-4 bg-card">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1 rounded">
            <Code className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{testCase.id}: {testCase.title}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">{testCase.description}</p>
      
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-1">Steps:</h4>
        <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
          {testCase.steps.map((step: string, index: number) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      
      <div className="mt-3">
        <h4 className="text-sm font-medium mb-1">Expected Result:</h4>
        <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
      </div>
    </div>
  );
};

export default TestGen;
