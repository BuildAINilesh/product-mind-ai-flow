
import { Button } from "@/components/ui/button";
import { Code, Copy } from "lucide-react";

interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
}

interface TestCaseCardProps {
  testCase: TestCase;
  onCopy: () => void;
}

export const TestCaseCard = ({ testCase, onCopy }: TestCaseCardProps) => {
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

export default TestCaseCard;
