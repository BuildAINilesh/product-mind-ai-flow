import { useState } from "react";
import { Link } from "react-router-dom";
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
import { CheckCircle, XCircle, Clock, Plus, Search, Brain, Network } from "lucide-react";
import { AICard, AIBackground, AIBadge, AIGradientText } from "@/components/ui/ai-elements";
import { supabase } from "@/integrations/supabase/client";

type Requirement = {
  id: string;
  title: string;
  created_at: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  ai_validated: boolean;
  tests_covered: boolean;
  industry_type: string;
  ai_confidence?: number;
};

const RequirementsList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: requirements = [], isLoading, error } = useQuery({
    queryKey: ['requirements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(project => ({
        id: project.id,
        title: project.project_name,
        created_at: new Date(project.created_at).toISOString().split('T')[0],
        status: 'draft',
        ai_validated: project.structured_document !== null,
        tests_covered: false,
        industry_type: project.industry_type,
        ai_confidence: project.structured_document ? 98 : 0
      }));
    }
  });
  
  const filteredRequirements = requirements.filter(req => 
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: Requirement["status"]) => {
    switch (status) {
      case "approved":
        return <AIBadge variant="complete">Approved</AIBadge>;
      case "in-review":
        return <AIBadge variant="analyzing">In Review</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
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
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Brain size={14} />
                      <span>AI Analysis</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Network size={14} />
                      <span>Tests</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                        <p>Loading requirements...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-500">
                      <p>Error loading requirements. Please try again later.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRequirements.length > 0 ? (
                  filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.id}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>{req.industry_type}</TableCell>
                      <TableCell>{req.created_at}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        {req.ai_validated 
                          ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-500" />
                              <span className="text-xs text-muted-foreground">{req.ai_confidence}% confidence</span>
                            </div>
                          ) 
                          : (
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-amber-500" />
                              <span className="text-xs text-muted-foreground">Pending</span>
                            </div>
                          )
                        }
                      </TableCell>
                      <TableCell>
                        {req.tests_covered 
                          ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-500" />
                              <span className="text-xs text-muted-foreground">Generated</span>
                            </div>
                          ) 
                          : (
                            <div className="flex items-center gap-2">
                              <XCircle size={16} className="text-gray-300" />
                              <span className="text-xs text-muted-foreground">Not covered</span>
                            </div>
                          )
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" asChild size="sm" className="border-primary/20 hover:border-primary/50">
                          <Link to={`/dashboard/requirements/${req.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
