
import { useState } from "react";
import ValidationDashboardHeader from "./ValidationDashboardHeader";
import ValidationStats from "./ValidationStats";
import ValidationDashboardList from "./ValidationDashboardList";

interface ValidationDashboardProps {
  validations: any[];
  loading: boolean;
  dataFetchAttempted: boolean;
}

const ValidationDashboard = ({ validations, loading, dataFetchAttempted }: ValidationDashboardProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <ValidationDashboardHeader showBackButton={false} />
      
      {loading && !dataFetchAttempted ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <>
          <ValidationStats validations={validations} loading={loading} />
          
          <ValidationDashboardList 
            validations={validations}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </>
      )}
    </div>
  );
};

export default ValidationDashboard;
