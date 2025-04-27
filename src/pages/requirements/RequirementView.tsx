
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project details.',
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

  // Function to handle refreshing the AI analysis
  const refreshAIAnalysis = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      toast({
        title: "Processing",
        description: "Refreshing AI analysis...",
      });
      
      const { data, error } = await supabase.functions.invoke('process-project', {
        body: { projectId: id }
      });
      
      if (error) {
        throw error;
      }
      
      // Refetch the project with updated structured document
      const { data: updatedProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      setProject(updatedProject);
      
      toast({
        title: "Success",
        description: "AI analysis has been refreshed.",
      });
      
    } catch (error) {
      console.error('Error refreshing AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to refresh AI analysis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        
        <Button 
          onClick={refreshAIAnalysis} 
          disabled={loading}
        >
          {loading ? "Processing..." : "Refresh AI Analysis"}
        </Button>
      </div>

      <ProjectStructuredView project={project} loading={loading} />
    </div>
  );
};

export default RequirementView;
