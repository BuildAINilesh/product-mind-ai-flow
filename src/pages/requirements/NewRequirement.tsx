
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
import { 
  Mail, 
  FileText, 
  MessageSquare, 
  Mic, 
  Headphones, 
  Upload,
  Loader
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type for the industry enum
type IndustryType = Database["public"]["Enums"]["industry_enum"];

const NewRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingSummary, setProcessingSummary] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    industryType: "" as IndustryType,
    projectIdea: "",
    voiceUploadUrl: null as string | null,
    emailUploadUrl: null as string | null,
    chatUploadUrl: null as string | null,
    documentUploadUrl: null as string | null,
    audioUploadUrl: null as string | null,
    documentSummary: null as string | null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    voice: null as string | null,
    email: null as string | null,
    chat: null as string | null,
    document: null as string | null,
    audio: null as string | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industryType: value as IndustryType }));
  };

  const processDocument = async (documentUrl: string) => {
    try {
      setProcessingSummary(true);
      setProcessingFile('document');
      setDebugInfo(null);
      
      toast({
        title: "Processing Document",
        description: "Generating document summary...",
      });
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found");
      }
      
      // Call the Edge Function with proper auth headers
      const response = await fetch('https://nbjajaafqswspkytekun.supabase.co/functions/v1/process-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          documentUrl: documentUrl 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from process-document function:', errorText);
        throw new Error(`Failed to process document: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.summary) {
        setFormData(prev => ({
          ...prev,
          documentSummary: data.summary
        }));
        
        // Save debug information if available
        if (data.debug) {
          setDebugInfo(data.debug);
          console.log("Debug info received:", data.debug);
        }
        
        toast({
          title: "Summary Complete",
          description: "Document processed and summarized successfully.",
        });
        
        return data.summary;
      }
      
      throw new Error("No summary generated");
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Processing Error",
        description: "Failed to generate document summary. Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessingSummary(false);
      setProcessingFile(null);
    }
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

      setUploadedFiles(prev => ({
        ...prev,
        [type]: file.name
      }));

      toast({
        title: "File Uploaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully.`,
      });

      // If it's a document, process it immediately
      if (type === 'document') {
        await processDocument(publicUrl);
      }
      
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

      const inputMethodsUsed: string[] = [];
      if (formData.voiceUploadUrl) inputMethodsUsed.push('Voice Input');
      if (formData.emailUploadUrl) inputMethodsUsed.push('Email Upload');
      if (formData.chatUploadUrl) inputMethodsUsed.push('Chat Upload');
      if (formData.documentUploadUrl) inputMethodsUsed.push('Document Upload');
      if (formData.audioUploadUrl) inputMethodsUsed.push('Audio Upload');
      
      const fileUrls: string[] = [
        formData.voiceUploadUrl,
        formData.emailUploadUrl,
        formData.chatUploadUrl,
        formData.documentUploadUrl,
        formData.audioUploadUrl
      ].filter(url => url !== null) as string[];

      const { data: newRequirement, error } = await supabase
        .from('requirements')
        .insert({
          user_id: user.id,
          project_name: formData.projectName,
          company_name: formData.companyName,
          industry_type: formData.industryType,
          project_idea: formData.projectIdea,
          input_methods_used: inputMethodsUsed,
          file_urls: fileUrls,
          document_summary: formData.documentSummary,
          status: 'Draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Requirement created",
        description: "Your new requirement has been successfully created.",
      });
      
      // Navigate to the requirement view page
      navigate(`/dashboard/requirements/${newRequirement.id}`);
      
    } catch (error) {
      console.error('Error creating requirement:', error);
      toast({
        title: "Error",
        description: "There was an error creating your requirement. Please try again.",
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
          <CardTitle className="text-2xl font-bold">Create New Requirement</CardTitle>
          <CardDescription className="text-muted-foreground">
            Get started with a new requirement. Fill in the details below to begin.
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
                    <SelectValue placeholder="Select industry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
            
            {formData.documentSummary && (
              <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <h3 className="text-sm font-medium">Document Summary</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.documentSummary}</p>
              </div>
            )}

            {debugInfo && (
              <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950 rounded-md border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">Debug Information</h3>
                <div className="text-xs font-mono overflow-auto">
                  <p><strong>Content Type:</strong> {debugInfo.contentType}</p>
                  <div className="mt-2">
                    <p><strong>Raw Content Sample (First 500 chars):</strong></p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {debugInfo.rawContentSample}
                    </pre>
                  </div>
                  <div className="mt-2">
                    <p><strong>Extracted Text Sample (First 1000 chars):</strong></p>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {debugInfo.extractedTextSample}
                    </pre>
                  </div>
                  <p><strong>Total Extracted Text Length:</strong> {debugInfo.extractedTextLength} characters</p>
                </div>
              </div>
            )}

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
                  disabled={processingFile === type}
                >
                  {processingFile === type ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span>{label}</span>
                  {uploadedFiles[type as keyof typeof uploadedFiles] && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {uploadedFiles[type as keyof typeof uploadedFiles]}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4744E0] hover:bg-[#4744E0]/90"
              disabled={loading || processingSummary}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Requirement...
                </>
              ) : (
                "Create Requirement"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequirement;
