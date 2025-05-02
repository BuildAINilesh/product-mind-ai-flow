
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch the basic project info
        const { data: projectData, error: projectError } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) {
          throw projectError;
        }

        setProject(projectData);

        // If project is completed, fetch the analysis data
        if (projectData.status === "Completed") {
          const { data: analysisData, error: analysisError } = await supabase
            .from('requirement_analysis')
            .select('*')
            .eq('requirement_id', id)
            .maybeSingle();

          if (analysisError) {
            console.error('Error fetching analysis:', analysisError);
          } else {
            setAnalysis(analysisData);
          }
        }
      } catch (error) {
        console.error('Error fetching requirement:', error);
        toast({
          title: 'Error',
          description: 'Failed to load requirement details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectData();
    }
  }, [id, toast]);

  // Function to handle editing the requirement
  const handleEdit = () => {
    navigate(`/dashboard/requirements/edit/${id}`);
  };

  // Function to trigger AI analysis
  const triggerAnalysis = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      toast({
        title: "Processing",
        description: "Analyzing requirement...",
      });
      
      // Call the process-project function for full analysis
      const { data, error } = await supabase.functions.invoke('process-project', {
        body: { projectId: id }
      });
      
      if (error) {
        throw error;
      }
      
      // Update status to Completed
      const { error: updateError } = await supabase
        .from('requirements')
        .update({ status: 'Completed' })
        .eq('id', id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Refetch the project with updated data
      const { data: updatedProject, error: fetchError } = await supabase
        .from('requirements')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      setProject(updatedProject);

      // Fetch the newly created analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('requirement_analysis')
        .select('*')
        .eq('requirement_id', id)
        .maybeSingle();

      if (analysisError) {
        console.error('Error fetching analysis:', analysisError);
      } else {
        setAnalysis(analysisData);
      }
      
      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });
      
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to analyze requirement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to navigate to MarketSense
  const navigateToMarketSense = async () => {
    if (!id) return;
    
    try {
      // First, check if a market analysis entry already exists
      const { data: existingAnalysis, error: checkError } = await supabase
        .from('market_analysis')
        .select('id')
        .eq('requirement_id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing market analysis:', checkError);
        toast({
          title: "Error",
          description: "Failed to check for existing market analysis.",
          variant: "destructive",
        });
        return;
      }
      
      // If no entry exists, create one
      if (!existingAnalysis) {
        const { error } = await supabase
          .from('market_analysis')
          .insert({
            requirement_id: id,
            status: 'Draft'
          });
          
        if (error) {
          console.error('Error creating market analysis entry:', error);
          toast({
            title: "Error",
            description: "Failed to create market analysis entry.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Navigate to the main MarketSense dashboard with the requirement ID as a URL parameter
      navigate(`/dashboard/market-sense?requirementId=${id}`);
      
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard/requirements')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requirements
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleEdit} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          
          {project && (project.status === "Draft" || project.status === "Re_Draft") && (
            <Button 
              onClick={triggerAnalysis} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {loading ? "Processing..." : "Analyze"}
            </Button>
          )}
          
          {project && project.status === "Completed" && (
            <Button 
              onClick={navigateToMarketSense}
              variant="default"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              MarketSense AI
            </Button>
          )}
        </div>
      </div>

      <RequirementAnalysisView project={project} analysis={analysis} loading={loading} />
    </div>
  );
};

export default RequirementView;
