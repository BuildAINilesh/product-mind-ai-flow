import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in a real app, this would come from an API
const mockRequirements = [
  {
    id: "REQ-001",
    title: "User Authentication System",
    description: "Implement secure user authentication with OAuth 2.0 and JWT",
    createdAt: "2025-04-20",
    status: "approved",
    aiValidated: true,
    testsCovered: true,
    industry: "Technology",
    details: {
      problemStatement: "Need a secure and scalable authentication system",
      solutionDescription: "Implement OAuth 2.0 with JWT tokens for secure authentication",
      justification: "Current system lacks proper security measures",
      clientResearch: "Market research shows OAuth 2.0 is industry standard",
      featureDetails: "Support for multiple authentication providers, token management, and session handling"
    }
  },
  {
    id: "REQ-002",
    title: "Payment Processing Gateway",
    description: "Implement secure payment processing with Stripe and PayPal",
    createdAt: "2025-04-18",
    status: "in-review",
    aiValidated: true,
    testsCovered: false,
    industry: "Financial Services",
    details: {
      problemStatement: "Need to process payments securely",
      solutionDescription: "Integrate with Stripe and PayPal APIs",
      justification: "Current system doesn't support online payments",
      clientResearch: "Stripe and PayPal are most popular payment processors",
      featureDetails: "Support for multiple payment methods, refunds, and transaction history"
    }
  }
];

const RequirementView = () => {
  const { id } = useParams();
  const requirement = mockRequirements.find(req => req.id === id);

  if (!requirement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Requirement Not Found</h2>
        <p className="text-muted-foreground mb-6">The requirement you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/dashboard/requirements">Back to Requirements</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case "in-review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Review</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Draft</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{requirement.title}</h2>
          <p className="text-muted-foreground">{requirement.description}</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard/requirements">Back to Requirements</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
              <div className="mt-1">{getStatusBadge(requirement.status)}</div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
              <p className="mt-1">{requirement.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
              <p className="mt-1">{requirement.createdAt}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Industry</h4>
              <p className="mt-1">{requirement.industry}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">AI Validation</h4>
              <div className="mt-1">
                {requirement.aiValidated 
                  ? <CheckCircle size={16} className="text-green-500" /> 
                  : <Clock size={16} className="text-amber-500" />
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Test Coverage</h4>
              <div className="mt-1">
                {requirement.testsCovered 
                  ? <CheckCircle size={16} className="text-green-500" /> 
                  : <XCircle size={16} className="text-gray-300" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Problem Statement</h4>
              <p className="mt-1">{requirement.details.problemStatement}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Solution Description</h4>
              <p className="mt-1">{requirement.details.solutionDescription}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Justification</h4>
              <p className="mt-1">{requirement.details.justification}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Client Research</h4>
              <p className="mt-1">{requirement.details.clientResearch}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Feature Details</h4>
              <p className="mt-1">{requirement.details.featureDetails}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequirementView; 