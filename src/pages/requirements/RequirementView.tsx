
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
import { CheckCircle, XCircle, Clock, ArrowLeft, Brain, Network, BarChart3, AlertTriangle, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AIBackground, AICard, AIBadge, AIGradientText } from "@/components/ui/ai-elements";

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
    aiConfidence: 98,
    aiInsights: [
      "High security compliance with industry standards",
      "Follows OAuth 2.0 best practices",
      "JWT implementation is robust and secure"
    ],
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
    aiConfidence: 87,
    aiInsights: [
      "Integration approach is sound",
      "Consider adding more error handling for edge cases",
      "PCI compliance measures need strengthening"
    ],
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
        return <AIBadge variant="complete">Approved</AIBadge>;
      case "in-review":
        return <AIBadge variant="analyzing">In Review</AIBadge>;
      case "draft":
        return <AIBadge variant="neural">Draft</AIBadge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="low" className="mb-6 rounded-lg">
        <div className="flex justify-between items-center p-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" asChild className="h-8 p-0 mr-1">
                <Link to="/dashboard/requirements">
                  <ArrowLeft size={16} className="mr-1" />
                  <span className="sr-only sm:not-sr-only">Back</span>
                </Link>
              </Button>
              {getStatusBadge(requirement.status)}
              {requirement.aiValidated && (
                <div className="flex items-center text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full border border-primary/20">
                  <Brain size={12} className="mr-1" />
                  <span>{requirement.aiConfidence}% confidence</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold">{requirement.title}</h2>
            <p className="text-muted-foreground">{requirement.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/dashboard/test-gen?req=${requirement.id}`}>
                <Network size={16} className="mr-2" />
                Generate Tests
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <Link to={`/dashboard/validator?req=${requirement.id}`}>
                <Brain size={16} className="mr-2" />
                AI Validate
              </Link>
            </Button>
          </div>
        </div>
      </AIBackground>

      <div className="grid gap-6 md:grid-cols-2">
        <AICard>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Key information about this requirement</CardDescription>
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
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Brain size={14} /> 
                <span className="text-muted-foreground">AI Validation</span>
              </h4>
              <div className="mt-1">
                {requirement.aiValidated 
                  ? <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-2" /> 
                      <span>Validated with {requirement.aiConfidence}% confidence</span>
                    </div> 
                  : <div className="flex items-center">
                      <Clock size={16} className="text-amber-500 mr-2" />
                      <span>Pending validation</span>
                    </div>
                }
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Network size={14} />
                <span className="text-muted-foreground">Test Coverage</span>
              </h4>
              <div className="mt-1">
                {requirement.testsCovered 
                  ? <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-2" /> 
                      <span>Tests generated</span>
                    </div>
                  : <div className="flex items-center">
                      <XCircle size={16} className="text-gray-300 mr-2" /> 
                      <span>Tests not generated</span>
                    </div>
                }
              </div>
            </div>
          </CardContent>
        </AICard>

        <AICard>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Details</CardTitle>
              {requirement.aiValidated && (
                <AIBadge variant="neural">AI Validated</AIBadge>
              )}
            </div>
            <CardDescription>Complete requirement information</CardDescription>
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
        </AICard>
      </div>

      {requirement.aiValidated && requirement.aiInsights && (
        <AICard>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-primary" />
              <CardTitle>AI Insights</CardTitle>
            </div>
            <CardDescription>
              Machine learning analysis of this requirement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requirement.aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <Brain size={16} className="text-primary mt-0.5" />
                  <p>{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </AICard>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button variant="outline">
          <FileCheck size={16} className="mr-2" />
          Request Approval
        </Button>
        <Button variant="outline">
          <BarChart3 size={16} className="mr-2" />
          Market Analysis
        </Button>
        <Button variant="outline">
          <AlertTriangle size={16} className="mr-2" />
          Risk Assessment
        </Button>
      </div>
    </div>
  );
};

export default RequirementView;
