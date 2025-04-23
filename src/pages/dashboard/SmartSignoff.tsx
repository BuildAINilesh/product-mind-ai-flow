
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Check, X, User, Calendar, MessageSquare, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data for requirements
const mockRequirements = [
  {
    id: "REQ-001",
    title: "User Authentication System",
    description: "Implement secure user authentication with OAuth 2.0 and JWT",
    status: "ready",
    stakeholders: [
      { id: 1, name: "Jane Cooper", role: "Product Manager", approved: true, avatar: "/placeholder.svg" },
      { id: 2, name: "Robert Fox", role: "Security Lead", approved: true, avatar: "/placeholder.svg" },
      { id: 3, name: "Emma Wilson", role: "UX Designer", approved: true, avatar: "/placeholder.svg" },
      { id: 4, name: "Mike Johnson", role: "Engineering Lead", approved: false, avatar: "/placeholder.svg" }
    ],
    qualityScore: 94,
    lastUpdated: "2025-04-21",
    comments: [
      { id: 1, user: "Jane Cooper", message: "All security requirements are met", date: "2025-04-20" },
      { id: 2, user: "Robert Fox", message: "Approved after security review", date: "2025-04-21" }
    ]
  },
  {
    id: "REQ-002",
    title: "Dashboard Analytics Module",
    description: "Real-time analytics dashboard with user activity tracking",
    status: "pending",
    stakeholders: [
      { id: 1, name: "Jane Cooper", role: "Product Manager", approved: true, avatar: "/placeholder.svg" },
      { id: 5, name: "Sarah Miller", role: "Data Scientist", approved: false, avatar: "/placeholder.svg" },
      { id: 6, name: "David Chen", role: "Frontend Dev", approved: false, avatar: "/placeholder.svg" },
      { id: 4, name: "Mike Johnson", role: "Engineering Lead", approved: false, avatar: "/placeholder.svg" }
    ],
    qualityScore: 86,
    lastUpdated: "2025-04-19",
    comments: [
      { id: 3, user: "Sarah Miller", message: "Need to specify data retention policy", date: "2025-04-19" }
    ]
  },
  {
    id: "REQ-003",
    title: "Payment Processing Integration",
    description: "Implement secure payment processing with Stripe and PayPal",
    status: "approved",
    stakeholders: [
      { id: 1, name: "Jane Cooper", role: "Product Manager", approved: true, avatar: "/placeholder.svg" },
      { id: 2, name: "Robert Fox", role: "Security Lead", approved: true, avatar: "/placeholder.svg" },
      { id: 7, name: "Lisa Wong", role: "Financial Officer", approved: true, avatar: "/placeholder.svg" },
      { id: 4, name: "Mike Johnson", role: "Engineering Lead", approved: true, avatar: "/placeholder.svg" }
    ],
    qualityScore: 98,
    lastUpdated: "2025-04-18",
    comments: [
      { id: 4, user: "Lisa Wong", message: "All financial regulations are addressed", date: "2025-04-17" },
      { id: 5, user: "Mike Johnson", message: "Implementation plan looks good", date: "2025-04-18" }
    ]
  }
];

const SmartSignoff = () => {
  const [requirements, setRequirements] = useState(mockRequirements);
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);

  const handleApprove = (requirementId: string) => {
    toast({
      description: `Requirement ${requirementId} has been approved.`,
    });
    
    // Update the requirement status in our state
    setRequirements(requirements.map(req => 
      req.id === requirementId ? { ...req, status: "approved" } : req
    ));
    
    // Update selected requirement if it's the one we're approving
    if (selectedRequirement && selectedRequirement.id === requirementId) {
      setSelectedRequirement({ ...selectedRequirement, status: "approved" });
    }
  };

  const handleReject = (requirementId: string) => {
    toast({
      description: `Requirement ${requirementId} has been rejected.`,
      variant: "destructive"
    });
    
    // Update the requirement status in our state
    setRequirements(requirements.map(req => 
      req.id === requirementId ? { ...req, status: "rejected" } : req
    ));
    
    // Update selected requirement if it's the one we're rejecting
    if (selectedRequirement && selectedRequirement.id === requirementId) {
      setSelectedRequirement({ ...selectedRequirement, status: "rejected" });
    }
  };

  const handleSelectRequirement = (requirement: any) => {
    setSelectedRequirement(requirement);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SmartSignoff</h1>
        <p className="text-muted-foreground">
          Streamline requirement approvals and track stakeholder sign-offs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
              <CardDescription>
                Requirements pending approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requirements.map((req) => (
                  <div 
                    key={req.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedRequirement?.id === req.id 
                        ? "bg-primary/5 border-primary/30" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelectRequirement(req)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{req.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{req.id}</code>
                          <Badge variant={
                            req.status === "approved" ? "default" :
                            req.status === "rejected" ? "destructive" :
                            req.status === "ready" ? "outline" : "secondary"
                          }>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {req.stakeholders.slice(0, 3).map((stakeholder) => (
                          <Avatar key={stakeholder.id} className="h-6 w-6 border-2 border-background">
                            <AvatarImage src={stakeholder.avatar} />
                            <AvatarFallback className="text-xs">
                              {stakeholder.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {req.stakeholders.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                            +{req.stakeholders.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">
                        {req.stakeholders.filter(s => s.approved).length}/{req.stakeholders.length} approved
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedRequirement ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedRequirement.title}</CardTitle>
                      <Badge variant={
                        selectedRequirement.status === "approved" ? "default" :
                        selectedRequirement.status === "rejected" ? "destructive" :
                        selectedRequirement.status === "ready" ? "outline" : "secondary"
                      }>
                        {selectedRequirement.status.charAt(0).toUpperCase() + selectedRequirement.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {selectedRequirement.id}
                    </CardDescription>
                  </div>
                  
                  {selectedRequirement.status === "ready" && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleReject(selectedRequirement.id)}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleApprove(selectedRequirement.id)}
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedRequirement.description}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Quality Score</h3>
                    <span className="text-sm font-medium">
                      {selectedRequirement.qualityScore}/100
                    </span>
                  </div>
                  <Progress 
                    value={selectedRequirement.qualityScore} 
                    className="h-2"
                    indicatorClassName={`${
                      selectedRequirement.qualityScore >= 90 ? "bg-green-500" :
                      selectedRequirement.qualityScore >= 70 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Stakeholder Approval</h3>
                  <div className="space-y-3">
                    {selectedRequirement.stakeholders.map((stakeholder: any) => (
                      <div key={stakeholder.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={stakeholder.avatar} />
                            <AvatarFallback>
                              {stakeholder.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{stakeholder.name}</p>
                            <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                          </div>
                        </div>
                        <div>
                          {stakeholder.approved ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                              <Check className="mr-1 h-3 w-3" /> Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <h3 className="text-sm font-medium">Comments</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedRequirement.comments.map((comment: any) => (
                      <div key={comment.id} className="bg-muted/50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{comment.user}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {comment.date}
                          </div>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Last updated: {selectedRequirement.lastUpdated}
                  </div>
                  {selectedRequirement.status === "approved" && (
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      Approved
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Select a Requirement</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a requirement from the list to view details and approve or reject it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartSignoff;
