
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIBackground, AIGradientText } from "@/components/ui/ai-elements";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";
import ValidationReport from "@/components/validator/ValidationReport";
import RequirementCard from "@/components/validator/RequirementCard";
import ValidationInProgress from "@/components/validator/ValidationInProgress";
import ValidationIntro from "@/components/validator/ValidationIntro";
import ValidationList from "@/components/validator/ValidationList";
import MissingAnalysis from "@/components/validator/MissingAnalysis";

interface ValidationItem {
  id: string;
  requirement_id: string;
  readiness_score: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  validation_verdict: string | null;
  validation_summary: string | null;
  strengths: string[] | null;
  risks: string[] | null;
  recommendations: string[] | null;
  requirements?: {
    req_id: string;
    project_name: string;
    industry_type: string;
    id: string;
  } | null;
}

const RequirementValidator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requirementId = searchParams.get('requirementId');
  
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // For individual requirement validation
  const [requirement, setRequirement] = useState<any>(null);
  const [requirementAnalysis, setRequirementAnalysis] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationData, setValidationData] = useState<ValidationItem | null>(null);
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);
  
  // Fetch validation list when component loads (no requirementId is provided)
  useEffect(() => {
    if (!requirementId) {
      fetchValidations();
    }
  }, [requirementId]);

  // Fetch requirement details if requirementId is provided
  useEffect(() => {
    if (requirementId) {
      fetchRequirement();
      fetchRequirementAnalysis();
      // Check if validation already exists for this requirement
      fetchExistingValidation(requirementId);
    }
  }, [requirementId]);

  const fetchValidations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requirement_validation')
        .select(`
          *,
          requirements (
            id,
            req_id,
            project_name,
            industry_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching validations:', error);
        toast.error('Failed to load validations');
        throw error;
      }

      if (data) {
        setValidations(data);
      }
    } catch (error) {
      console.error('Error fetching validations:', error);
      toast.error('Failed to load validations');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirement = async () => {
    if (!requirementId) return;
    
    setIsRequirementLoading(true);
    try {
      // Query the requirements table for the specified requirement
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .eq('req_id', requirementId)
        .single();
        
      if (error) {
        console.error('Error fetching requirement:', error);
        toast.error('Failed to load requirement details');
        throw error;
      }
      
      if (data) {
        setRequirement(data);
        console.log("Loaded requirement:", data);
      }
    } catch (error) {
      console.error('Error fetching requirement:', error);
      toast.error('Failed to load requirement details');
    } finally {
      setIsRequirementLoading(false);
    }
  };

  const fetchRequirementAnalysis = async () => {
    if (!requirementId) return;
    
    try {
      // Query the requirement_analysis table for the specified requirement
      const { data: reqData, error: reqError } = await supabase
        .from('requirements')
        .select('id')
        .eq('req_id', requirementId)
        .single();
        
      if (reqError) {
        console.error('Error fetching requirement ID:', reqError);
        return;
      }
      
      if (reqData) {
        const { data, error } = await supabase
          .from('requirement_analysis')
          .select('*')
          .eq('requirement_id', reqData.id)
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching analysis:', error);
          return;
        }
        
        if (data) {
          setRequirementAnalysis(data);
          console.log("Loaded requirement analysis:", data);
        }
      }
    } catch (error) {
      console.error('Error fetching requirement analysis:', error);
    }
  };

  const fetchExistingValidation = async (reqId: string) => {
    try {
      // First get the requirement ID (UUID) from the req_id
      const { data: reqData, error: reqError } = await supabase
        .from('requirements')
        .select('id')
        .eq('req_id', reqId)
        .single();
        
      if (reqError) {
        console.error('Error fetching requirement ID:', reqError);
        return;
      }
      
      if (reqData) {
        // Now fetch the validation using the requirement UUID
        const { data, error } = await supabase
          .from('requirement_validation')
          .select('*')
          .eq('requirement_id', reqData.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching validation:', error);
          return;
        }
        
        if (data) {
          setValidationData(data);
          console.log("Found existing validation:", data);
        }
      }
    } catch (error) {
      console.error('Error fetching existing validation:', error);
    }
  };

  const handleValidate = async () => {
    if (!requirementId) {
      toast.error("Requirement ID is missing");
      return;
    }

    setIsValidating(true);
    
    try {
      toast.info("Starting AI validation process...", { duration: 2000 });
      
      // Call the AI validator edge function
      const { data, error } = await supabase.functions.invoke('ai-validator', {
        body: { requirementId }
      });
      
      if (error) {
        console.error("Validation error:", error);
        toast.error(`Validation failed: ${error.message}`);
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.message || "Validation process failed");
      }
      
      // Update the local state with the validation results
      setValidationData(data.record[0] || data.data);
      
      toast.success("Requirement validation complete!");
      
    } catch (error) {
      console.error('Error validating requirement:', error);
      toast.error(error.message || 'Validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleViewValidation = (validationRequirementId: string) => {
    navigate(`/dashboard/validator?requirementId=${validationRequirementId}`);
  };

  const handleBackToList = () => {
    navigate('/dashboard/validator');
  };

  const handleNavigateToRequirements = () => {
    navigate('/dashboard/requirements');
  };

  // Filter validations based on search query
  const filteredValidations = validations.filter(validation => 
    validation?.requirements?.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    validation?.requirements?.req_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    validation?.requirements?.industry_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If requirementId is provided, show the validation form
  if (requirementId) {
    return (
      <div className="space-y-6">
        <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h2 className="text-2xl font-bold">AI <AIGradientText>Validator</AIGradientText></h2>
              <p className="text-muted-foreground mt-1">Analyze requirements for clarity, completeness, and consistency</p>
            </div>
            
            <Button 
              onClick={handleBackToList}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Validations
            </Button>
          </div>
        </AIBackground>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column - Requirement Details */}
          <div className="md:col-span-5">
            <RequirementCard
              requirement={requirement}
              requirementAnalysis={requirementAnalysis}
              isLoading={isRequirementLoading}
              isValidating={isValidating}
              validationData={validationData}
              onValidate={handleValidate}
            />
          </div>

          {/* Right Column - Analysis & Validation */}
          <div className="md:col-span-7">
            {isValidating ? (
              <ValidationInProgress />
            ) : validationData ? (
              <ValidationReport validationData={validationData} />
            ) : (
              requirementAnalysis ? (
                <div className="space-y-6">
                  {/* Analysis view */}
                  <RequirementAnalysisView 
                    project={requirement}
                    analysis={requirementAnalysis}
                    loading={isRequirementLoading}
                    onRefresh={() => {
                      fetchRequirementAnalysis();
                      toast.success("Analysis refreshed");
                    }}
                  />
                  
                  {/* Validation intro card */}
                  <ValidationIntro 
                    onValidate={handleValidate}
                    isValidating={isValidating}
                  />
                </div>
              ) : (
                <MissingAnalysis 
                  requirementId={requirementId}
                  onNavigateToRequirement={(id) => navigate(`/dashboard/requirements?id=${id}`)}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show validations list when no requirementId is provided
  return (
    <div className="space-y-6">
      <AIBackground variant="neural" intensity="medium" className="rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-2xl font-bold">AI <AIGradientText>Validator</AIGradientText></h2>
            <p className="text-muted-foreground mt-1">Analyze requirements for clarity, completeness, and consistency</p>
          </div>
        </div>
      </AIBackground>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="ml-2">Loading data...</p>
        </div>
      ) : (
        <ValidationList 
          validations={filteredValidations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewValidation={handleViewValidation}
          onNavigateToRequirements={handleNavigateToRequirements}
        />
      )}
    </div>
  );
};

export default RequirementValidator;
