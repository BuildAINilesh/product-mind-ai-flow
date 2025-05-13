import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, CheckCircle2, AlertTriangle, LineChart, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100 animate-gradient-x p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-1 tracking-tight drop-shadow-lg">AI Validator</h1>
        <p className="text-lg text-slate-500">AI-powered validation of your requirements against best practices</p>
      </div>
      {/* Stats Cards */}
      <ValidationStats validations={validations} loading={loading} />
      {/* Table Section */}
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 animate-fadeIn mt-10">
        <ValidationDashboardList 
          validations={validations}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
    </div>
  );
};

export default ValidationDashboard;
