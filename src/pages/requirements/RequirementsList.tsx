
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Play } from "lucide-react";
import { AICard, AIBackground, AIBadge, AIGradientText } from "@/components/ui/ai-elements";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Requirement = {
  id: string;
  requirement_id: string;
  project_name: string;
  company_name: string | null;
  industry_type: string;
  project_idea: string | null;
  input_methods_used: string[];
  file_urls: string[];
  status: "Draft" | "Completed" | "Re_Draft";
  created_at: string;
};

const RequirementsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: requirements = [], isLoading, error, refetch } = useQuery({
    queryKey: ['requirements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    }
  });
  
  const filteredRequirements = requirements.filter(req => 
    req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.requirement_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const triggerAnalysis = async (requirementId: string) => {
    try {
      toast({
        title: "Processing",
        description: "Analyzing requirement...",
      });

      const { data, error } = await supabase.functions.invoke('process-project', {
        body: { projectId: requirementId }
      });

      if (error) {
        throw error;
      }

      // Update status to Completed
      await supabase
        .from('requirements')
        .update({ status: 'Completed' })
        .eq('id', requirementId);

      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });

      // Refetch the requirements list
      refetch();

    } catch (error) {
      console.error('Error analyzing requirement:', error);
      toast({
        title: "Error",
        description: "Failed to analyze requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <AIBadge variant="complete">Completed</AIBadge>;
      case "re_draft":
        return <AIBadge variant="analyzing">Re-Draft</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      default:
        return <AIBadge variant="neural">Draft</AIBadge>;
    }
  };
  
  return (
    <div>
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">AI-Powered <AIGradientText>Requirements</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">Create and manage requirements with machine learning assistance</p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
            <Link to="/dashboard/requirements/new">
              <Plus size={16} className="mr-2" />
              New Requirement
            </Link>
          </Button>
        </div>
      </AIBackground>
      
      <AICard>
        <CardHeader>
          <CardTitle>All Requirements</CardTitle>
          <CardDescription>
            View and manage your AI-validated product requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search requirements..."
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                        <p>Loading requirements...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                      <p>Error loading requirements. Please try again later.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRequirements.length > 0 ? (
                  filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.requirement_id}</TableCell>
                      <TableCell>{req.project_name}</TableCell>
                      <TableCell>{req.industry_type}</TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/requirements/${req.id}`)}>
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                View
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/requirements/edit/${req.id}`)}>
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            {(req.status === "Draft" || req.status === "Re_Draft") && (
                              <DropdownMenuItem onClick={() => triggerAnalysis(req.id)}>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Play className="mr-2 h-4 w-4" />
                                  Analyze
                                </Button>
                              </DropdownMenuItem>
                            )}
                            {req.status === "Completed" && (
                              <DropdownMenuItem onClick={() => navigate("/dashboard/market-sense", { state: { requirementId: req.id } })}>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  MarketSense AI
                                </Button>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground/60" />
                        <p>No requirements found. Try a different search or create a new requirement.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </AICard>
    </div>
  );
};

export default RequirementsList;
