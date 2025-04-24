
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import TestCaseCard from "./TestCaseCard";
import { TestCase, TestCases } from "@/utils/test-generation";
import { toast } from "@/components/ui/sonner";

interface TestResultPanelProps {
  testCases: TestCases | null;
}

const TestResultPanel = ({ testCases }: TestResultPanelProps) => {
  const [activeTab, setActiveTab] = useState("functional");
  
  if (!testCases) {
    return null;
  }

  const handleCopyTestCase = (testCase: TestCase) => {
    const textToCopy = `ID: ${testCase.id}
Title: ${testCase.title}
Description: ${testCase.description}
Steps:
${testCase.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}
Expected Result: ${testCase.expectedResult}`;

    navigator.clipboard.writeText(textToCopy);
    toast("Test case copied to clipboard.");
  };

  return (
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
            {testCases.functional.map((testCase: TestCase) => (
              <TestCaseCard 
                key={testCase.id} 
                testCase={testCase} 
                onCopy={() => handleCopyTestCase(testCase)} 
              />
            ))}
          </TabsContent>
          <TabsContent value="integration" className="m-0">
            {testCases.integration.map((testCase: TestCase) => (
              <TestCaseCard 
                key={testCase.id} 
                testCase={testCase} 
                onCopy={() => handleCopyTestCase(testCase)} 
              />
            ))}
          </TabsContent>
          <TabsContent value="user" className="m-0">
            {testCases.user.map((testCase: TestCase) => (
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
  );
};

export default TestResultPanel;
