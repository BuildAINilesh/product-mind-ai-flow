import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AICard, AIGradientText } from "@/components/ui/ai-elements";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AIBadge } from "@/components/ui/ai-elements";
import { Badge } from "@/components/ui/badge";
import { capitalizeWords } from "@/utils/formatters";

interface MarketAnalysis {
  id: string;
  requirement_id: string;
  status: string;
  created_at: string;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
  } | null;
}

interface MarketAnalysisListProps {
  loading: boolean;
  analyses: MarketAnalysis[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const MarketAnalysisList = ({
  loading,
  analyses,
  searchQuery,
  setSearchQuery,
}: MarketAnalysisListProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Filter market analyses based on search query
  const filteredAnalyses = analyses.filter(
    (analysis) =>
      analysis?.requirements?.project_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      analysis?.requirements?.req_id
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      analysis?.requirements?.industry_type
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "completed") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">Completed</span>
        </div>
      );
    } else if (normalizedStatus === "analyzing") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium">Analyzing</span>
        </div>
      );
    } else if (normalizedStatus === "draft") {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">Draft</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-slate-500"></div>
          <span className="text-sm font-medium">{status}</span>
        </div>
      );
    }
  };

  // Handle "View Analysis" button click
  const handleViewAnalysis = (analysisRequirementId: string) => {
    console.log(
      "Navigating to analysis for requirement:",
      analysisRequirementId
    );
    // Navigate to the specific market analysis view
    navigate(`/dashboard/market-sense?requirementId=${analysisRequirementId}`);
  };

  const navigateToRequirements = () => {
    navigate("/dashboard/requirements");
  };

  // Card view for mobile
  const renderCardView = () => (
    <div className="space-y-4">
      {filteredAnalyses.length > 0 ? (
        filteredAnalyses.map((analysis) => (
          <Card
            key={analysis.id}
            className="overflow-hidden backdrop-blur-md bg-white/60 border border-slate-200 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">
                    {analysis.requirements?.project_name || "Unknown Project"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {analysis.requirements?.req_id || "N/A"}
                  </CardDescription>
                </div>
                {getStatusBadge(analysis.status)}
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-col space-y-3">
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Industry:</span>
                  <span>
                    {capitalizeWords(analysis.requirements?.industry_type) ||
                      "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleViewAnalysis(analysis.requirement_id)}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-full mt-2"
                >
                  View Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 space-y-3">
          <Search className="h-8 w-8 text-muted-foreground/60 mx-auto" />
          <p className="text-muted-foreground">No market analyses found</p>
          <Button variant="outline" onClick={navigateToRequirements}>
            Go to Requirements
          </Button>
        </div>
      )}
    </div>
  );

  // Table view for desktop
  const renderTableView = () => (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="w-[300px]">Project</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell className="font-medium">
                  {analysis.requirements?.req_id || "N/A"}
                </TableCell>
                <TableCell>
                  {analysis.requirements?.project_name || "Unknown Project"}
                </TableCell>
                <TableCell>
                  {capitalizeWords(analysis.requirements?.industry_type) ||
                    "N/A"}
                </TableCell>
                <TableCell>
                  {new Date(analysis.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => handleViewAnalysis(analysis.requirement_id)}
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    View Analysis
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 text-muted-foreground/60" />
                  <p>
                    No market analyses found. Try a different search or analyze
                    a requirement.
                  </p>
                  <Button
                    className="mt-2"
                    variant="outline"
                    onClick={navigateToRequirements}
                  >
                    Go to Requirements
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <CardTitle className="text-lg">Market Analyses</CardTitle>
          <CardDescription>
            View and manage your AI-powered market analyses for all projects
          </CardDescription>
        </div>
        <div className="relative flex-1 max-w-sm ml-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search market analyses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-6 w-6 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading...</p>
        </div>
      ) : isMobile ? (
        renderCardView()
      ) : (
        renderTableView()
      )}
    </div>
  );
};

export default MarketAnalysisList;
