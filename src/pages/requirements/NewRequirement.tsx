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
import { Mail, FileText, Upload, MessageSquare, AudioLines } from "lucide-react";
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
    projectIdea: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industryType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Insert the project data
      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          project_name: formData.projectName,
          company_name: formData.companyName,
          industry_type: formData.industryType,
          username: formData.username,
          project_idea: formData.projectIdea
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
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="industryType" className="text-sm font-medium">
                  Industry Type
                </label>
                <Select value={formData.industryType} onValueChange={handleSelectChange}>
                  <SelectTrigger>
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
                  className="w-full"
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
                className="min-h-[120px] w-full"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
              <Button type="button" variant="outline" className="w-full flex items-center gap-2" size="sm">
                <AudioLines size={16} />
                <span className="hidden md:inline">Voice Input</span>
              </Button>
              <Button type="button" variant="outline" className="w-full flex items-center gap-2" size="sm">
                <Mail size={16} />
                <span className="hidden md:inline">Email Upload</span>
              </Button>
              <Button type="button" variant="outline" className="w-full flex items-center gap-2" size="sm">
                <MessageSquare size={16} />
                <span className="hidden md:inline">Chat Upload</span>
              </Button>
              <Button type="button" variant="outline" className="w-full flex items-center gap-2" size="sm">
                <FileText size={16} />
                <span className="hidden md:inline">Document Upload</span>
              </Button>
              <Button type="button" variant="outline" className="w-full flex items-center gap-2" size="sm">
                <AudioLines size={16} />
                <span className="hidden md:inline">Audio Upload</span>
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequirement;
