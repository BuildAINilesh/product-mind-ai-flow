
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectStructuredView from "@/components/ProjectStructuredView";

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data, error } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setProject(data);
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
      fetchProject();
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
      
      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });
      
    } catch (error) {
      console.error('Error refreshing AI analysis:', error);
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
  const navigateToMarketSense = () => {
    navigate("/dashboard/market-sense", { state: { requirementId: id } });
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

      <ProjectStructuredView project={project} loading={loading} />
    </div>
  );
};

export default RequirementView;
