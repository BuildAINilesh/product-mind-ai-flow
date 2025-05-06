
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

interface DebugProps {
  data: any;
  title?: string;
}

export const Debug = ({ data, title = "Debug Info" }: DebugProps) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="my-2 p-2 border border-gray-200 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShow(!show)}
          className="h-6 px-2"
        >
          <Code className="h-3 w-3 mr-1" />
          {show ? "Hide" : "Show"}
        </Button>
      </div>
      
      {show && (
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[300px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};
