
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCheck, Check, X, User, Calendar, MessageSquare, Clock, AlertCircle, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Define the BRD requirement type based on our database schema
interface BRDRequirement {
  id: string;
  req_id: string;
  title: string;
  description: string;
  status: "draft" | "ready" | "signed_off" | "rejected";
  stakeholders: {
    id: number;
    name: string;
    role: string;
    approved: boolean;
    avatar: string;
  }[];
  qualityScore: number;
  lastUpdated: string;
  comments: {
    id: number;
    user: string;
    message: string;
    date: string;
  }[];
  brd_document?: any;
}

const SmartSignoff = () => {
  const [requirements, setRequirements] = useState<BRDRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<BRDRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch requirements with BRD status
  useEffect(() => {
    const fetchRequirements = async () => {
      setLoading(true);
      try {
        // Fetch requirements with their associated BRD documents
        // Note: We updated the fields to match what's actually in the database
        const { data, error } = await supabase
          .from('requirements')
          .select(`
            id, 
            req_id,
            project_name,
            project_idea,
            updated_at,
            requirement_brd (
              id,
              status,
              brd_document,
              approver_name,
              approver_comment,
              signed_off_at
            )
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error("Error fetching requirements:", error);
          toast.error("Failed to load requirements");
          return;
        }

        if (!data || data.length === 0) {
          // If no data from database, use mock data for demonstration
          setRequirements(mockRequirements as BRDRequirement[]);
        } else {
          // Transform the data to match our component's expected format
          const transformedData = data.map((req) => {
            // Default values if BRD doesn't exist
            let status: "draft" | "ready" | "signed_off" | "rejected" = "draft";
            let qualityScore = 85;
            
            // Update with actual BRD data if it exists
            if (req.requirement_brd) {
              status = req.requirement_brd.status as "draft" | "ready" | "signed_off" | "rejected";
              // Calculate quality score based on BRD document completeness
              qualityScore = calculateQualityScore(req.requirement_brd.brd_document);
            }

            return {
              id: req.id,
              req_id: req.req_id || `REQ-${Math.floor(Math.random() * 1000)}`,
              title: req.project_name,
              // Use project_idea instead of description as it exists in the database
              description: req.project_idea || "No description available",
              status: status,
              stakeholders: generateMockStakeholders(status),
              qualityScore: qualityScore,
              lastUpdated: new Date(req.updated_at).toISOString().split('T')[0],
              comments: generateMockComments(status),
              brd_document: req.requirement_brd?.brd_document
            };
          });
          
          setRequirements(transformedData as BRDRequirement[]);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast.error("Failed to load requirements");
        // Fall back to mock data
        setRequirements(mockRequirements as BRDRequirement[]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  // Helper function to generate mock stakeholders based on status
  const generateMockStakeholders = (status: string) => {
    const baseStakeholders = [
      { id: 1, name: "Jane Cooper", role: "Product Manager", approved: true, avatar: "/placeholder.svg" },
      { id: 2, name: "Robert Fox", role: "Security Lead", approved: status === "signed_off", avatar: "/placeholder.svg" },
      { id: 3, name: "Emma Wilson", role: "UX Designer", approved: status === "signed_off" || Math.random() > 0.5, avatar: "/placeholder.svg" },
      { id: 4, name: "Mike Johnson", role: "Engineering Lead", approved: status === "signed_off", avatar: "/placeholder.svg" }
    ];
    return baseStakeholders;
  };

  // Helper function to generate mock comments based on status
  const generateMockComments = (status: string) => {
    const baseComments = [
      { id: 1, user: "Jane Cooper", message: "All requirements documented clearly", date: getRandomRecentDate() }
    ];
    
    if (status === "ready" || status === "signed_off") {
      baseComments.push({ 
        id: 2, 
        user: "Robert Fox", 
        message: "Security requirements are properly addressed", 
        date: getRandomRecentDate() 
      });
    }
    
    if (status === "signed_off") {
      baseComments.push({ 
        id: 3, 
        user: "Mike Johnson", 
        message: "Approved implementation approach", 
        date: getRandomRecentDate() 
      });
    }
    
    return baseComments;
  };

  // Helper function to get random recent date
  const getRandomRecentDate = () => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 7) + 1;
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - daysAgo);
    return pastDate.toISOString().split('T')[0];
  };

  // Calculate quality score based on BRD document completeness
  const calculateQualityScore = (brdDocument: any) => {
    if (!brdDocument) return 75;
    
    let score = 80; // Base score
    const sections = [
      'project_overview', 
      'problem_statement', 
      'proposed_solution', 
      'business_goals', 
      'target_audience',
      'key_features',
      'competitive_landscape',
      'constraints_assumptions',
      'risks_mitigations',
      'acceptance_criteria'
    ];
    
    // Add points for each populated section
    sections.forEach(section => {
      if (brdDocument[section] && brdDocument[section].length > 10) {
        score += 2;
      }
    });
    
    return Math.min(100, score);
  };

  const handleApprove = async (requirementId: string) => {
    try {
      // Update the BRD status in the database
      const { error } = await supabase
        .from('requirement_brd')
        .update({
          status: 'signed_off',
          approver_name: 'Current User', // Ideally this would be the authenticated user's name
          signed_off_at: new Date().toISOString()
        })
        .eq('requirement_id', requirementId);
      
      if (error) {
        console.error("Error approving requirement:", error);
        toast.error("Failed to approve requirement");
        return;
      }
      
      toast.success(`Requirement has been approved`);
      
      // Update the requirement status in our state
      setRequirements(requirements.map(req => 
        req.id === requirementId ? { ...req, status: "signed_off" as const } : req
      ));
      
      // Update selected requirement if it's the one we're approving
      if (selectedRequirement && selectedRequirement.id === requirementId) {
        setSelectedRequirement({ ...selectedRequirement, status: "signed_off" as const });
      }
    } catch (error) {
      console.error("Error approving requirement:", error);
      toast.error("Failed to approve requirement");
    }
  };

  const handleReject = async (requirementId: string) => {
    try {
      // Update the BRD status in the database
      const { error } = await supabase
        .from('requirement_brd')
        .update({
          status: 'rejected',
          approver_name: 'Current User', // Ideally this would be the authenticated user's name
          signed_off_at: new Date().toISOString()
        })
        .eq('requirement_id', requirementId);
      
      if (error) {
        console.error("Error rejecting requirement:", error);
        toast.error("Failed to reject requirement");
        return;
      }
      
      toast.error(`Requirement has been rejected`);
      
      // Update the requirement status in our state
      setRequirements(requirements.map(req => 
        req.id === requirementId ? { ...req, status: "rejected" as const } : req
      ));
      
      // Update selected requirement if it's the one we're rejecting
      if (selectedRequirement && selectedRequirement.id === requirementId) {
        setSelectedRequirement({ ...selectedRequirement, status: "rejected" as const });
      }
    } catch (error) {
      console.error("Error rejecting requirement:", error);
      toast.error("Failed to reject requirement");
    }
  };

  const handleSelectRequirement = (requirement: BRDRequirement) => {
    setSelectedRequirement(requirement);
  };

  const handleViewBRD = (requirementId: string) => {
    navigate(`/dashboard/requirements/${requirementId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading requirements...</p>
        </div>
      </div>
    );
  }

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
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">{req.req_id}</code>
                          <Badge variant={
                            req.status === "signed_off" ? "default" :
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
                        selectedRequirement.status === "signed_off" ? "success" :
                        selectedRequirement.status === "rejected" ? "destructive" :
                        selectedRequirement.status === "ready" ? "outline" : "secondary"
                      }>
                        {selectedRequirement.status.charAt(0).toUpperCase() + selectedRequirement.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {selectedRequirement.req_id}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleViewBRD(selectedRequirement.id)}
                    >
                      <FileText className="h-4 w-4" />
                      View BRD
                    </Button>

                    {selectedRequirement.status === "ready" && (
                      <>
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
                      </>
                    )}
                  </div>
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
                  
                  {selectedRequirement.status === "draft" && (
                    <div className="mt-2 flex items-center gap-1 text-xs bg-amber-50 text-amber-700 p-2 rounded border border-amber-200">
                      <AlertCircle className="h-3 w-3" />
                      <span>BRD is in draft state. Consider finalizing before submitting for approval.</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Stakeholder Approval</h3>
                  <div className="space-y-3">
                    {selectedRequirement.stakeholders.map((stakeholder) => (
                      <div key={stakeholder.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={stakeholder.avatar} />
                            <AvatarFallback>
                              {stakeholder.name.split(' ').map((n) => n[0]).join('')}
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
                    {selectedRequirement.comments.map((comment) => (
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
                  {selectedRequirement.status === "signed_off" && (
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

// Mock data for fallback
const mockRequirements = [
  {
    id: "REQ-001",
    req_id: "REQ-25-01",
    title: "User Authentication System",
    description: "Implement secure user authentication with OAuth 2.0 and JWT",
    status: "ready" as const,
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
    req_id: "REQ-25-02",
    title: "Dashboard Analytics Module",
    description: "Real-time analytics dashboard with user activity tracking",
    status: "draft" as const,
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
    req_id: "REQ-25-03",
    title: "Payment Processing Integration",
    description: "Implement secure payment processing with Stripe and PayPal",
    status: "signed_off" as const,
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

export default SmartSignoff;
