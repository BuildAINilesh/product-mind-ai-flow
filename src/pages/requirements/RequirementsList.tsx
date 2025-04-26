
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Badge
} from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Clock, Plus, Search, Brain, Network } from "lucide-react";
import { AICard, AIBackground, AIBadge, NeuralNetwork, AIGradientText } from "@/components/ui/ai-elements";

type Requirement = {
  id: string;
  title: string;
  createdAt: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  aiValidated: boolean;
  testsCovered: boolean;
  industry: string;
  aiConfidence?: number;
};

const RequirementsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: "REQ-001",
      title: "User Authentication System",
      createdAt: "2025-04-20",
      status: "approved",
      aiValidated: true,
      testsCovered: true,
      industry: "Technology",
      aiConfidence: 98
    },
    {
      id: "REQ-002",
      title: "Payment Processing Gateway",
      createdAt: "2025-04-18",
      status: "in-review",
      aiValidated: true,
      testsCovered: false,
      industry: "Financial Services",
      aiConfidence: 87
    },
    {
      id: "REQ-003",
      title: "Inventory Management Dashboard",
      createdAt: "2025-04-15",
      status: "draft",
      aiValidated: false,
      testsCovered: false,
      industry: "Retail",
      aiConfidence: 0
    },
    {
      id: "REQ-004",
      title: "Customer Feedback System",
      createdAt: "2025-04-10",
      status: "rejected",
      aiValidated: false,
      testsCovered: false,
      industry: "Technology",
      aiConfidence: 43
    }
  ]);
  
  const filteredRequirements = requirements.filter(req => 
    req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    req.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Status badge helper
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
      <AIBackground variant="neural" intensity="low" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center">
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
                {filteredRequirements.length > 0 ? (
                  filteredRequirements.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.id}</TableCell>
                      <TableCell>{req.title}</TableCell>
                      <TableCell>{req.industry}</TableCell>
                      <TableCell>{req.createdAt}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        {req.aiValidated 
                          ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-green-500" />
                              <span className="text-xs text-muted-foreground">{req.aiConfidence}% confidence</span>
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
                        {req.testsCovered 
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
