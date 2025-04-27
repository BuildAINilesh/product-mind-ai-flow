
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, FileText, MessageSquare, Mic, Headphones, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const NewRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    industryType: "",
    username: "",
    projectIdea: "",
    voiceUploadUrl: null,
    emailUploadUrl: null,
    chatUploadUrl: null,
    documentUploadUrl: null,
    audioUploadUrl: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industryType: value }));
  };

  const handleFileUpload = async (type: string, file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${type}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('project-uploads')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-uploads')
        .getPublicUrl(filePath)

      setFormData(prev => ({ 
        ...prev, 
        [`${type}UploadUrl`]: publicUrl 
      }));

      toast({
        title: "File Uploaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully.`,
      });
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
      toast({
        title: "Upload Error",
        description: `Failed to upload ${type} file.`,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        handleFileUpload(type, file);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          project_name: formData.projectName,
          company_name: formData.companyName,
          industry_type: formData.industryType,
          username: formData.username,
          project_idea: formData.projectIdea,
          voice_upload_url: formData.voiceUploadUrl,
          email_upload_url: formData.emailUploadUrl,
          chat_upload_url: formData.chatUploadUrl,
          document_upload_url: formData.documentUploadUrl,
          audio_upload_url: formData.audioUploadUrl
        });

      if (error) throw error;

      toast({
        title: "Project created",
        description: "Your new project has been successfully created.",
      });
      
      navigate("/dashboard/requirements");
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Card className="max-w-4xl mx-auto my-8 shadow-none border-none">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Create New Project</CardTitle>
          <CardDescription className="text-muted-foreground">
            Get started with a new project. Fill in the details below to begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="projectName" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="projectName"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  placeholder="Enter project name"
                  required
                  className="w-full bg-background"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium">
                  Company Name
                </label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                  className="w-full bg-background"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industryType" className="text-sm font-medium">
                  Industry Type
                </label>
                <Select value={formData.industryType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Enter industry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                  className="w-full bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="projectIdea" className="text-sm font-medium">
                Project Idea
              </label>
              <Textarea
                id="projectIdea"
                name="projectIdea"
                value={formData.projectIdea}
                onChange={handleInputChange}
                placeholder="Enter your rough idea for the project"
                required
                className="min-h-[120px] w-full bg-background"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { type: 'voice', icon: Mic, label: 'Voice Input' },
                { type: 'email', icon: Mail, label: 'Email Upload' },
                { type: 'chat', icon: MessageSquare, label: 'Chat Upload' },
                { type: 'document', icon: FileText, label: 'Document Upload' },
                { type: 'audio', icon: Headphones, label: 'Audio Upload' }
              ].map(({ type, icon: Icon, label }) => (
                <Button 
                  key={type} 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => handleFileSelect(type)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4744E0] hover:bg-[#4744E0]/90"
              disabled={loading}
            >
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequirement;
