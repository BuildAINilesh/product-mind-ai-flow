
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
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="functional" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="functional">Functional</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
            <TabsContent value="functional">
              {testCases.functional.map((testCase: TestCase) => (
                <TestCaseCard 
                  key={testCase.id} 
                  testCase={testCase} 
                  onCopy={() => handleCopyTestCase(testCase)} 
                />
              ))}
            </TabsContent>
            <TabsContent value="integration">
              {testCases.integration.map((testCase: TestCase) => (
                <TestCaseCard 
                  key={testCase.id} 
                  testCase={testCase} 
                  onCopy={() => handleCopyTestCase(testCase)} 
                />
              ))}
            </TabsContent>
            <TabsContent value="user">
              {testCases.user.map((testCase: TestCase) => (
                <TestCaseCard 
                  key={testCase.id} 
                  testCase={testCase} 
                  onCopy={() => handleCopyTestCase(testCase)} 
                />
              ))}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestResultPanel;
