
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Play, FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RequirementAnalysisView from "@/components/RequirementAnalysisView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RequirementView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingDoc, setProcessingDoc] = useState(false);
  const [file, setFile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  // Function to handle file upload and processing
  const handleFileUpload = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDialogOpen(true);
    }
  };

  const processDocument = async () => {
    if (!file || !id) return;

    try {
      setProcessingDoc(true);
      setDialogOpen(false);

      // First, upload the file to Supabase storage
      toast({
        title: "Uploading",
        description: "Uploading document...",
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('project-uploads')
        .getPublicUrl(filePath);

      toast({
        title: "Processing",
        description: "Analyzing document content...",
      });

      // Process the document with the edge function
      const { data, error } = await supabase.functions.invoke('process-document', {
        body: { 
          documentUrl: publicUrl,
          requirementId: id
        }
      });

      if (error) {
        throw error;
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
        description: "Document processed and analyzed successfully.",
      });

    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process document.",
        variant: "destructive",
      });
    } finally {
      setProcessingDoc(false);
      setFile(null);
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
            <>
              <Button 
                onClick={triggerAnalysis} 
                disabled={loading || processingDoc}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {loading ? "Processing..." : "Analyze"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => document.getElementById('document-upload').click()}
                disabled={loading || processingDoc}
                className="flex items-center gap-2"
              >
                <FileUp className="h-4 w-4" />
                Upload Document
              </Button>
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileUpload}
                disabled={loading || processingDoc}
              />
            </>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Document</DialogTitle>
            <DialogDescription>
              The selected document will be processed using AI to extract requirements information.
            </DialogDescription>
          </DialogHeader>
          
          {file && (
            <div className="py-4">
              <Label>Selected File</Label>
              <div className="mt-1 p-2 border rounded bg-muted">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processDocument}
              disabled={processingDoc || !file}
            >
              {processingDoc ? "Processing..." : "Process Document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequirementView;
