
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft } from "lucide-react";
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
  setSearchQuery 
}: MarketAnalysisListProps) => {
  const navigate = useNavigate();

  // Filter market analyses based on search query
  const filteredAnalyses = analyses.filter(analysis => 
    analysis?.requirements?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    analysis?.requirements?.req_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analysis?.requirements?.industry_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <AIBadge variant="neural">Draft</AIBadge>;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <AIBadge variant="complete">Completed</AIBadge>;
      case "analyzing":
        return <AIBadge variant="analyzing">Analyzing</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      default:
        return <AIBadge variant="neural">Draft</AIBadge>;
    }
  };
  
  // Handle "View Analysis" button click
  const handleViewAnalysis = (analysisRequirementId: string) => {
    console.log("Navigating to analysis for requirement:", analysisRequirementId);
    // Navigate to the specific market analysis view
    navigate(`/dashboard/market-sense?requirementId=${analysisRequirementId}`);
  };

  const navigateToRequirements = () => {
    navigate('/dashboard/requirements');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className="text-2xl font-bold">MarketSense <AIGradientText>AI</AIGradientText></h2>
          <p className="text-muted-foreground mt-1">AI-powered market analysis for your product requirements</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={navigateToRequirements}
            variant="outline"
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Requirements
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <AICard>
          <CardHeader>
            <CardTitle>Market Analyses</CardTitle>
            <CardDescription>
              View and manage your AI-powered market analyses for all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search market analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
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
                        <TableCell className="font-medium">{analysis.requirements?.req_id || 'N/A'}</TableCell>
                        <TableCell>{analysis.requirements?.project_name || 'Unknown Project'}</TableCell>
                        <TableCell>{analysis.requirements?.industry_type || 'N/A'}</TableCell>
                        <TableCell>{new Date(analysis.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {getStatusBadge(analysis.status)}
                        </TableCell>
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
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/60" />
                          <p>No market analyses found. Try a different search or analyze a requirement.</p>
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
          </CardContent>
        </AICard>
      )}
    </div>
  );
};

export default MarketAnalysisList;
