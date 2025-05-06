
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ValidationEmptyStateProps {
  handleValidate: () => void;
  isValidating: boolean;
}

const ValidationEmptyState = ({ handleValidate, isValidating }: ValidationEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center max-w-2xl mx-auto">
      <div className="p-6 rounded-full bg-[#f0f2fe] mb-6">
        <BrainCircuit className="h-16 w-16 text-[#5057d9]" />
      </div>
      <h1 className="text-3xl font-bold mb-4">Ready for Analysis</h1>
      <p className="text-muted-foreground text-lg mb-8">
        This requirement hasn't been analyzed yet. Click the "Analyze" button to generate the AI-powered analysis.
      </p>
      <Button 
        size="lg" 
        variant="validator" 
        className="gap-2 px-8" 
        onClick={handleValidate}
        disabled={isValidating}
      >
        {isValidating ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Analyzing...
          </>
        ) : (
          <>
            <BrainCircuit className="h-5 w-5" />
            Analyze
          </>
        )}
      </Button>
    </div>
  );
};

export default ValidationEmptyState;
