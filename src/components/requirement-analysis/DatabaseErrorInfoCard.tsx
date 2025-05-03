
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Database } from "lucide-react";

type DatabaseErrorProps = {
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  };
  tableName?: string;
};

export const DatabaseErrorInfoCard = ({ error, tableName }: DatabaseErrorProps) => {
  // Extract column name from common error messages
  const extractColumnName = (message: string) => {
    const columnMatch = message.match(/column ["'](.+?)["'] does not exist/i);
    return columnMatch ? columnMatch[1] : null;
  };

  const columnName = extractColumnName(error.message);
  
  return (
    <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex gap-2 text-red-600 dark:text-red-400 items-center">
          <Database className="h-5 w-5" />
          Database Schema Error
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error in {tableName || 'database'} query</AlertTitle>
          <AlertDescription className="font-mono text-sm mt-2">
            {error.message}
          </AlertDescription>
        </Alert>
        
        {columnName && (
          <div className="space-y-3">
            <h3 className="font-medium">Column <span className="font-mono text-red-600">{columnName}</span> doesn't exist</h3>
            <p className="text-sm text-muted-foreground">
              This error occurs when your code tries to reference a column that isn't defined in the database schema.
            </p>
            
            <div className="bg-black/90 text-white p-3 rounded-md text-sm">
              <p className="font-medium">Common fixes:</p>
              <ul className="list-disc pl-4 mt-2 space-y-1 text-gray-300">
                <li>Replace <code className="text-red-400">{columnName}</code> with <code className="text-green-400">id</code> (primary key)</li>
                {columnName === 'requirement_id' && (
                  <li>For foreign keys to requirements table, use the <code className="text-green-400">id</code> column value</li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {error.hint && (
          <div className="mt-3 text-sm border-l-4 border-amber-400 pl-3 py-1 bg-amber-50 dark:bg-amber-950/30">
            <span className="font-medium">Hint: </span> 
            {error.hint}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

