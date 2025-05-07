
import { Button } from "@/components/ui/card";
import { FileCheck, Filter } from "lucide-react";
import { BRDRequirement } from "@/types/smart-signoff";

interface AISignoffHeaderProps {
  pendingCount: number;
  onFilterChange?: (filter: string) => void;
}

export const AISignoffHeader = ({ 
  pendingCount,
  onFilterChange 
}: AISignoffHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">AI Signoff</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          {pendingCount} requirement{pendingCount !== 1 ? 's' : ''} pending approval
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onFilterChange && onFilterChange('all')}
        >
          <Filter className="h-4 w-4" />
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => onFilterChange && onFilterChange('pending')}
        >
          <Filter className="h-4 w-4" />
          Pending
        </Button>
        <Button
          variant="outline"
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onFilterChange && onFilterChange('approved')}
        >
          <Filter className="h-4 w-4" />
          Approved
        </Button>
      </div>
    </div>
  );
};
