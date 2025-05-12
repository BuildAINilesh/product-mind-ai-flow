import { useState, useEffect, useRef, useCallback } from "react";
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
  FileText, 
  Mic, 
  Headphones,
  Loader,
  AlertCircle,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { SpeechRecognitionService } from "@/utils/speechRecognition";

// Type for the industry enum
type IndustryType = Database["public"]["Enums"]["industry_enum"];

// Get all industry types from the enum
const INDUSTRY_TYPES: IndustryType[] = [
  "technology",
  "healthcare", 
  "finance", 
  "education", 
  "retail", 
  "manufacturing", 
  "logistics", 
  "entertainment", 
  "energy", 
  "automotive", 
  "HR", 
  "other"
];

const NewRequirement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingSummary, setProcessingSummary] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionServiceRef = useRef<SpeechRecognitionService | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    projectName?: boolean;
    companyName?: boolean;
    industryType?: boolean;
    projectIdea?: boolean;
  }>({});
  const [useEnhancedVoice, setUseEnhancedVoice] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const projectNameRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  const projectIdeaRef = useRef<HTMLTextAreaElement>(null);
  const industryTypeWrapperRef = useRef<HTMLDivElement>(null);
  
  const fieldRefs = {
    projectName: projectNameRef,
    companyName: companyNameRef,
    projectIdea: projectIdeaRef
  };
  
  const fieldLabels = {
    projectName: "Project Name",
    companyName: "Company Name",
    industryType: "Industry Type",
    projectIdea: "Project Idea"
  };

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    industryType: "" as IndustryType,
    projectIdea: "",
    voiceUploadUrl: null as string | null,
    documentUploadUrl: null as string | null,
    audioUploadUrl: null as string | null,
    documentSummary: null as string | null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    voice: null as string | null,
    document: null as string | null,
    audio: null as string | null
  });

  // Function to speak text using the browser's speech synthesis
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Function to focus on a field and read it out loud
  const focusAndSpeak = useCallback((fieldName: string) => {
    setActiveField(fieldName);
    
    if (fieldName === 'industryType') {
      // Special handling for industry type
      if (industryTypeWrapperRef.current) {
        // Focus the wrapper, which will highlight the select
        industryTypeWrapperRef.current.focus();
        // Find the button inside and simulate a click
        const selectButton = industryTypeWrapperRef.current.querySelector('button');
        if (selectButton) {
          // Focus but don't click to avoid opening dropdown immediately
          selectButton.focus();
        }
      }
    } else {
      // Regular fields
      const ref = fieldRefs[fieldName as keyof typeof fieldRefs];
      if (ref?.current) {
        ref.current.focus();
      }
    }
    
    speakText(`Please enter ${fieldLabels[fieldName as keyof typeof fieldLabels]}`);
  }, [speakText, fieldLabels]);

  // Move to the next field in the sequence
  const moveToNextField = useCallback(() => {
    const fieldOrder = ['projectName', 'companyName', 'industryType', 'projectIdea'];
    const currentIndex = activeField ? fieldOrder.indexOf(activeField) : -1;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fieldOrder.length) {
      focusAndSpeak(fieldOrder[nextIndex]);
    } else {
      // If we're at the last field, focus on the submit button
      speakText("All fields filled. Press enter to create requirement.");
      setActiveField(null);
    }
  }, [activeField, focusAndSpeak, speakText]);

  // Clear errors for a field when its value changes
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: false
    }));
  }, []);

  // Set focus to the project name field when the component mounts
  useEffect(() => {
    // Focus on project name field when component mounts
    if (projectNameRef.current) {
      projectNameRef.current.focus();
      setActiveField('projectName');
    }
  }, []);

  // Initialize speech recognition service when component mounts or useEnhancedVoice changes
  useEffect(() => {
    // Initialize speech recognition service
    const recognitionService = new SpeechRecognitionService({
      onStart: () => {
        // Don't set isListening here, we'll manage it in toggleVoiceRecognition
        // Always speak that we're inputting to Project Idea
        speakText(`Voice input active for Project Idea`);
        
        toast({
          title: "Voice Input Activated",
          description: useEnhancedVoice 
            ? "Enhanced speech recognition active for Project Idea. Speak clearly..." 
            : "Standard speech recognition active for Project Idea. Speak clearly...",
        });
      },
      onEnd: () => {
        // Don't set isListening here, we'll manage it in toggleVoiceRecognition
        toast({
          title: "Voice Input Completed",
          description: "Voice input for Project Idea has stopped.",
        });
        
        // Keep focus on Project Idea field
        if (projectIdeaRef.current) {
          projectIdeaRef.current.focus();
        }
      },
      onError: (error) => {
        // Manually reset the isListening state
        setIsListening(false);
        
        toast({
          title: "Voice Input Error",
          description: `Error: ${error}. Please try again.`,
          variant: "destructive",
        });
      },
      onResult: (text) => {
        console.log("Speech recognition result:", text, "Active field:", activeField);
        
        // ALWAYS add voice input to the Project Idea field regardless of active field
        if (projectIdeaRef.current) {
          // Completely replace the content of the Project Idea field to avoid text restoration issues
          projectIdeaRef.current.value = text;
          
          // Update the form state
          setFormData(prev => ({ 
            ...prev, 
            projectIdea: text 
          }));
          
          // Make Project Idea the active field for visual feedback
          setActiveField('projectIdea');
          
          // Clear any error for this field
          clearFieldError('projectIdea');
          
          // Focus the field
          projectIdeaRef.current.focus();
        }
      },
      useOpenAI: useEnhancedVoice,
      enhancedProcessing: useEnhancedVoice
    });

    recognitionServiceRef.current = recognitionService;
    
    // Check if speech recognition is supported
    setIsSpeechSupported(recognitionService.isSupported());

    return () => {
      // Clean up speech recognition
      if (recognitionServiceRef.current) {
        recognitionServiceRef.current.stop();
      }
      
      // Clean up any active speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [useEnhancedVoice, activeField, fieldLabels, speakText, clearFieldError, moveToNextField, formData]);

  // Function to identify which field to fill based on voice input
  const identifyAndFillField = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    let fieldUpdated = false;
    
    // Basic NLP to determine where to put the text
    if (lowerText.includes("project name") || lowerText.includes("project called") || lowerText.includes("project title")) {
      // Extract project name after the keyword
      const matches = lowerText.match(/(project name|project called|project title).*?(is|:)?\s*(.+)/i);
      if (matches && matches[3]) {
        const extractedName = matches[3].trim();
        setFormData(prev => ({ ...prev, projectName: extractedName }));
        clearFieldError('projectName');
        fieldUpdated = true;
        
        // Also focus this field
        setActiveField('projectName');
        projectNameRef.current?.focus();
      }
    } 
    else if (lowerText.includes("company") || lowerText.includes("organization") || lowerText.includes("business")) {
      // Extract company name after the keyword
      const matches = lowerText.match(/(company|organization|business).*?(is|:)?\s*(.+)/i);
      if (matches && matches[3]) {
        const extractedName = matches[3].trim();
        setFormData(prev => ({ ...prev, companyName: extractedName }));
        clearFieldError('companyName');
        fieldUpdated = true;
        
        // Also focus this field
        setActiveField('companyName');
        companyNameRef.current?.focus();
      }
    }
    else if (lowerText.includes("industry") || lowerText.includes("sector") || lowerText.includes("field")) {
      // Try to extract industry type
      for (const industry of INDUSTRY_TYPES) {
        if (lowerText.includes(industry.toLowerCase())) {
          setFormData(prev => ({ ...prev, industryType: industry }));
          clearFieldError('industryType');
          fieldUpdated = true;
          
          // Also focus this field
          setActiveField('industryType');
          industryTypeWrapperRef.current?.focus();
          break;
        }
      }
    }
    else {
      // If no specific field is detected, use the currently active field or default to project idea
      if (activeField) {
        setFormData(prev => ({ ...prev, [activeField]: text }));
        clearFieldError(activeField);
      } else {
        // Force-update the project idea field to prevent restoration issues
        if (projectIdeaRef.current) {
          projectIdeaRef.current.value = text;
        }
        
        setFormData(prev => ({ ...prev, projectIdea: text }));
        clearFieldError('projectIdea');
        
        // Also focus this field
        setActiveField('projectIdea');
        projectIdeaRef.current?.focus();
      }
      fieldUpdated = true;
    }
    
    // Return whether we updated a field
    return fieldUpdated;
  }, [activeField, clearFieldError]);

  // Toggle voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionServiceRef.current) return;

    if (isListening) {
      // Properly stop listening
      recognitionServiceRef.current.stop();
      setIsListening(false);
      
      // Turn off enhanced mode when stopping voice input
      if (useEnhancedVoice) {
        setUseEnhancedVoice(false);
        toast({
          title: "AI Enhanced Mode Deactivated",
          description: "Turning off Enhanced AI mode when voice input stops.",
        });
      }
    } else {
      // ALWAYS focus on the Project Idea field when starting voice input
      focusAndSpeak('projectIdea');
      
      // Start speech recognition
      recognitionServiceRef.current.start();
      setIsListening(true);
      
      // Provide clear feedback about voice input
      toast({
        title: "Voice Input Ready",
        description: "Speak into your microphone to fill the Project Idea field",
      });
    }
  }, [isListening, focusAndSpeak, useEnhancedVoice]);

  // Toggle enhanced voice mode with explanation
  const toggleEnhancedVoice = useCallback(() => {
    setUseEnhancedVoice(prev => !prev);
    
    // Show explanation of the mode switch
    toast({
      title: !useEnhancedVoice ? "Enhanced AI Mode Activated" : "Standard Mode Activated",
      description: !useEnhancedVoice ? 
        "Using OpenAI for better speech recognition. This works best for complex speech and noisy environments." : 
        "Using standard browser speech recognition.",
    });
  }, [useEnhancedVoice]);

  // Handle click on a field to set it as active
  const handleFieldClick = useCallback((fieldName: string) => {
    setActiveField(fieldName);
    
    // No special voice input handling when fields are clicked
    // since voice always goes to Project Idea field
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error state when user types in a field
    clearFieldError(name);
    
    // Set this field as active
    setActiveField(name);
    
    // Update the form state
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [clearFieldError]);

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industryType: value as IndustryType }));
    
    // Clear error state when user selects an industry
    clearFieldError('industryType');
    
    // If we're in active field navigation mode, move to the next field
    if (activeField === 'industryType') {
      moveToNextField();
    }
  };

  // Handle key press events for field navigation
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    // If user presses Enter in a field, move to the next field
    if (e.key === 'Enter' && fieldName !== 'projectIdea') {
      e.preventDefault();
      moveToNextField();
    }
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

  const validateForm = () => {
    const errors = {
      projectName: !formData.projectName,
      companyName: !formData.companyName,
      industryType: !formData.industryType,
      projectIdea: !formData.projectIdea
    };
    
    setFieldErrors(errors);
    
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields highlighted in red.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const inputMethodsUsed: string[] = [];
      if (formData.voiceUploadUrl) inputMethodsUsed.push('Voice Input');
      if (formData.documentUploadUrl) inputMethodsUsed.push('Document Upload');
      if (formData.audioUploadUrl) inputMethodsUsed.push('Audio Upload');
      
      const fileUrls: string[] = [
        formData.voiceUploadUrl,
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
                  onKeyDown={(e) => handleKeyDown(e, 'projectName')}
                  onClick={() => handleFieldClick('projectName')}
                  placeholder="Enter project name"
                  required
                  ref={projectNameRef}
                  className={`w-full bg-background ${fieldErrors.projectName ? 'border-red-500 focus:ring-red-500' : ''} ${activeField === 'projectName' ? 'ring-2 ring-blue-500' : ''}`}
                />
                {fieldErrors.projectName && (
                  <p className="text-red-500 text-xs mt-1">Project name is required</p>
                )}
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
                  onKeyDown={(e) => handleKeyDown(e, 'companyName')}
                  onClick={() => handleFieldClick('companyName')}
                  placeholder="Enter company name"
                  required
                  ref={companyNameRef}
                  className={`w-full bg-background ${fieldErrors.companyName ? 'border-red-500 focus:ring-red-500' : ''} ${activeField === 'companyName' ? 'ring-2 ring-blue-500' : ''}`}
                />
                {fieldErrors.companyName && (
                  <p className="text-red-500 text-xs mt-1">Company name is required</p>
                )}
              </div>

              <div className="space-y-2" ref={industryTypeWrapperRef}>
                <label htmlFor="industryType" className="text-sm font-medium">
                  Industry Type
                </label>
                <Select 
                  value={formData.industryType} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger 
                    onClick={() => handleFieldClick('industryType')}
                    className={`bg-background ${fieldErrors.industryType ? 'border-red-500 ring-red-500' : ''} ${activeField === 'industryType' ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <SelectValue placeholder="Select industry type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_TYPES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.industryType && (
                  <p className="text-red-500 text-xs mt-1">Industry type is required</p>
                )}
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
                onKeyDown={(e) => handleKeyDown(e, 'projectIdea')}
                onClick={() => handleFieldClick('projectIdea')}
                placeholder="Enter your rough idea for the project"
                required
                ref={projectIdeaRef}
                className={`min-h-[120px] w-full bg-background ${fieldErrors.projectIdea ? 'border-red-500 focus:ring-red-500' : ''} ${activeField === 'projectIdea' ? 'ring-2 ring-blue-500' : ''}`}
              />
              {fieldErrors.projectIdea && (
                <p className="text-red-500 text-xs mt-1">Project idea is required</p>
              )}
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
                  <p><strong>Extraction Method:</strong> {debugInfo.extractionMethod}</p>
                  
                  {debugInfo.rawContentSample && (
                    <div className="mt-2">
                      <p><strong>Raw Document XML Sample:</strong></p>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                        {debugInfo.rawContentSample}
                      </pre>
                    </div>
                  )}
                  
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
              {/* Document Upload - Now first */}
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => handleFileSelect('document')}
                disabled={processingFile === 'document'}
              >
                {processingFile === 'document' ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span>Document Upload</span>
                {uploadedFiles.document && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {uploadedFiles.document}
                  </span>
                )}
              </Button>

              {/* Voice Input - now with integrated AI enhanced option */}
              <div className="flex flex-col gap-1 items-start">
                <Button 
                  type="button" 
                  variant={isListening ? "destructive" : "outline"}
                  size="sm" 
                  className={`flex items-center gap-2 w-full ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={toggleVoiceRecognition}
                  disabled={!isSpeechSupported}
                >
                  {isListening ? (
                    <>
                      <Volume2 className="h-4 w-4 animate-pulse" />
                      <span>Stop Listening</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>Voice Input for Project Idea</span>
                    </>
                  )}
                </Button>
                
                {/* Enhanced mode toggle integrated under the voice button */}
                <div className="flex items-center gap-2 text-xs pl-1">
                  <input
                    type="checkbox"
                    id="enhancedModeToggle"
                    checked={useEnhancedVoice}
                    onChange={toggleEnhancedVoice}
                    disabled={!isSpeechSupported || isListening}
                    className="h-3 w-3"
                  />
                  <label 
                    htmlFor="enhancedModeToggle" 
                    className={`cursor-pointer ${!isSpeechSupported || isListening ? 'opacity-50' : ''} ${useEnhancedVoice ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}
                  >
                    {useEnhancedVoice ? 'Using AI Enhanced Voice' : 'Use AI Enhanced Voice'}
                  </label>
                </div>
              </div>

              {/* Audio Upload - Greyed out with coming soon message */}
              <div className="relative">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                  disabled={true}
                >
                  <Headphones className="h-4 w-4" />
                  <span>Audio Upload</span>
                </Button>
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] py-0.5 px-1.5 rounded-full flex items-center">
                  <AlertCircle className="h-3 w-3 mr-0.5" />
                  Coming Soon
                </span>
              </div>
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
