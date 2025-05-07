
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { BRDRequirement } from "@/types/smart-signoff";
import { AISignoffHeader } from "@/components/smart-signoff/AISignoffHeader";
import { AISignoffStats } from "@/components/smart-signoff/AISignoffStats";
import { AISignoffTable } from "@/components/smart-signoff/AISignoffTable";
import { RequirementDetails } from "@/components/smart-signoff/RequirementDetails";
import { EmptyRequirementState } from "@/components/smart-signoff/EmptyRequirementState";

const AISignoff = () => {
  const [requirements, setRequirements] = useState<BRDRequirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<BRDRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Fetch requirements with BRD status
  useEffect(() => {
    const fetchRequirements = async () => {
      setLoading(true);
      try {
        // Fetch requirements with their associated BRD documents
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
          setRequirements(mockRequirements);
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
          
          setRequirements(transformedData);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);
        toast.error("Failed to load requirements");
        // Fall back to mock data
        setRequirements(mockRequirements);
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

  const handleViewDetails = (requirement: BRDRequirement) => {
    setSelectedRequirement(requirement);
  };

  const handleViewBRD = (requirementId: string) => {
    navigate(`/dashboard/requirements/${requirementId}`);
  };

  // Filter requirements based on selected filter
  const filteredRequirements = filter === "all"
    ? requirements
    : filter === "pending"
      ? requirements.filter(req => req.status === "ready" || req.status === "draft")
      : requirements.filter(req => req.status === "signed_off");

  // Count pending approvals for header
  const pendingCount = requirements.filter(req => req.status === "ready").length;

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
      <AISignoffHeader 
        pendingCount={pendingCount} 
        onFilterChange={setFilter}
      />

      <AISignoffStats requirements={requirements} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-3">
          <AISignoffTable 
            requirements={filteredRequirements}
            onViewDetails={handleViewDetails}
          />
        </div>

        {selectedRequirement && (
          <div className="md:col-span-3">
            <RequirementDetails
              requirement={selectedRequirement}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewBRD={handleViewBRD}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for fallback
const mockRequirements: BRDRequirement[] = [
  {
    id: "REQ-001",
    req_id: "REQ-25-01",
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
    req_id: "REQ-25-02",
    title: "Dashboard Analytics Module",
    description: "Real-time analytics dashboard with user activity tracking",
    status: "draft",
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
    status: "signed_off",
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

export default AISignoff;
