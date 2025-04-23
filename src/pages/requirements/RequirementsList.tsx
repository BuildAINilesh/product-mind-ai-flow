
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
import { CheckCircle, XCircle, Clock, Plus, Search } from "lucide-react";
import { useState } from "react";

type Requirement = {
  id: string;
  title: string;
  createdAt: string;
  status: "draft" | "in-review" | "approved" | "rejected";
  aiValidated: boolean;
  testsCovered: boolean;
  industry: string;
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
      industry: "Technology"
    },
    {
      id: "REQ-002",
      title: "Payment Processing Gateway",
      createdAt: "2025-04-18",
      status: "in-review",
      aiValidated: true,
      testsCovered: false,
      industry: "Financial Services"
    },
    {
      id: "REQ-003",
      title: "Inventory Management Dashboard",
      createdAt: "2025-04-15",
      status: "draft",
      aiValidated: false,
      testsCovered: false,
      industry: "Retail"
    },
    {
      id: "REQ-004",
      title: "Customer Feedback System",
      createdAt: "2025-04-10",
      status: "rejected",
      aiValidated: false,
      testsCovered: false,
      industry: "Technology"
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
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case "in-review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Review</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Requirements</h2>
        <Button asChild>
          <Link to="/dashboard/requirements/new">
            <Plus size={16} className="mr-2" />
            New Requirement
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Requirements</CardTitle>
          <CardDescription>
            View and manage all your product requirements.
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
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Validated</TableHead>
                  <TableHead>Tests</TableHead>
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
                          ? <CheckCircle size={16} className="text-green-500" /> 
                          : <Clock size={16} className="text-amber-500" />
                        }
                      </TableCell>
                      <TableCell>
                        {req.testsCovered 
                          ? <CheckCircle size={16} className="text-green-500" /> 
                          : <XCircle size={16} className="text-gray-300" />
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" asChild size="sm">
                          <Link to={`/dashboard/requirements/${req.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No requirements found. Try a different search or create a new requirement.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsList;
