import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { SpeechRecognitionService } from "@/utils/speechRecognition";

// Type for the industry enum
type IndustryType = Database["public"]["Enums"]["industry_enum"];

const EditRequirement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [useEnhancedVoice, setUseEnhancedVoice] = useState(false);
  const recognitionServiceRef = useRef<SpeechRecognitionService | null>(null);
  const projectIdeaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    projectName: "",
    companyName: "",
    industryType: "" as IndustryType,
    projectIdea: "",
  });

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const { data, error } = await supabase
          .from('requirements')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setFormData({
          projectName: data.project_name,
          companyName: data.company_name || "",
          industryType: data.industry_type,
          projectIdea: data.project_idea || "",
        });
      } catch (error) {
        console.error('Error fetching requirement:', error);
        toast({
          title: 'Error',
          description: 'Failed to load requirement details.',
          variant: 'destructive',
        });
        navigate('/dashboard/requirements');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequirement();
    }
  }, [id, toast, navigate]);

  // Function to speak text using the browser's speech synthesis
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize speech recognition service
  useEffect(() => {
    // Initialize speech recognition service
    const recognitionService = new SpeechRecognitionService({
      initialText: '', // Don't initialize with text, we'll handle it manually
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
        console.log("Speech recognition result:", text);
        
        // ALWAYS add voice input to the Project Idea field
        if (projectIdeaRef.current) {
          // Get current value from the textarea directly (most reliable source)
          const currentText = projectIdeaRef.current.value || formData.projectIdea || '';
          const fullText = currentText ? currentText + ' ' + text : text;
          
          console.log("Updating textarea with full text:", fullText);
          
          // Update the textarea with the accumulated text
          projectIdeaRef.current.value = fullText;
          
          // Update the form state
          setFormData(prev => ({ 
            ...prev, 
            projectIdea: fullText 
          }));
          
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
        // Allow some time for the stop to process, then force abort
        setTimeout(() => {
          if (recognitionServiceRef.current) {
            recognitionServiceRef.current.forceAbort();
            recognitionServiceRef.current = null;
          }
        }, 100);
      }
      
      // Clean up any active speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [useEnhancedVoice, speakText, formData.projectIdea]);

  // Toggle voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionServiceRef.current) return;

    if (isListening) {
      // Properly stop listening - force abortion for complete termination
      const currentText = recognitionServiceRef.current.stop();
      
      // Double-check termination by forcing abort as well
      setTimeout(() => {
        if (recognitionServiceRef.current) {
          recognitionServiceRef.current.forceAbort();
        }
      }, 100);
      
      // Immediately update UI state
      setIsListening(false);
      
      // Turn off enhanced mode when stopping voice input
      if (useEnhancedVoice) {
        setUseEnhancedVoice(false);
        toast({
          title: "AI Enhanced Mode Deactivated",
          description: "Turning off Enhanced AI mode when voice input stops.",
        });
      }
      
      // Provide feedback that recording has stopped and text is preserved
      toast({
        title: "Voice Input Stopped",
        description: "Your text has been saved. Click 'Voice Input' again to continue from where you left off.",
      });
      
      // Make sure state is updated with current textarea value - prioritize what's in the textarea
      if (projectIdeaRef.current) {
        const textToSave = projectIdeaRef.current.value || currentText || '';
        projectIdeaRef.current.value = textToSave;
        setFormData(prev => ({ 
          ...prev, 
          projectIdea: textToSave 
        }));
      }
    } else {
      // Focus on the Project Idea field when starting voice input
      if (projectIdeaRef.current) {
        projectIdeaRef.current.focus();
        speakText(`Voice input active for Project Idea`);
        
        // Get current text from the textarea (most reliable source)
        const currentText = projectIdeaRef.current.value || formData.projectIdea || '';
        console.log("Starting voice input with existing text:", currentText);
      
        // Set the current text to the recognition service - set empty string to avoid duplication
        if (recognitionServiceRef.current && recognitionServiceRef.current.setCurrentText) {
          recognitionServiceRef.current.setCurrentText('');
        }
        
        // Start speech recognition
        recognitionServiceRef.current.start();
        setIsListening(true);
        
        // Provide clear feedback about voice input
        toast({
          title: "Voice Input Ready",
          description: "Speak into your microphone to fill the Project Idea field",
        });
      }
    }
  }, [isListening, speakText, useEnhancedVoice, toast, formData.projectIdea]);

  // Toggle enhanced voice mode with explanation
  const toggleEnhancedVoice = useCallback(() => {
    // Preserve current state
    const wasListening = isListening;
    
    // Get current text from the textarea directly (most reliable source)
    const currentText = projectIdeaRef.current?.value || formData.projectIdea || '';
    console.log("Mode switch with current text:", currentText);
    
    // If currently listening, stop first
    if (wasListening && recognitionServiceRef.current) {
      recognitionServiceRef.current.stop();
      setIsListening(false);
    }
    
    // Toggle the enhanced mode
    setUseEnhancedVoice(prev => !prev);
    
    // Show explanation of the mode switch
    toast({
      title: !useEnhancedVoice ? "Enhanced AI Mode Activated" : "Standard Mode Activated",
      description: !useEnhancedVoice ? 
        "Using OpenAI for better speech recognition. This works best for complex speech and noisy environments." : 
        "Using standard browser speech recognition.",
    });
    
    // If was listening, restart with the new mode after a short delay
    if (wasListening) {
      setTimeout(() => {
        if (projectIdeaRef.current) {
          // Set the current text to the recognition service - set empty string to avoid duplication
          if (recognitionServiceRef.current && recognitionServiceRef.current.setCurrentText) {
            recognitionServiceRef.current.setCurrentText('');
          } else {
            // Create a new recognition service with the current text
            const recognitionService = new SpeechRecognitionService({
              initialText: '', // Don't initialize with text, we'll handle manually
              onStart: () => {
                speakText(`Voice input active for Project Idea`);
                
                toast({
                  title: "Voice Input Reactivated",
                  description: `Continuing with ${!useEnhancedVoice ? "enhanced" : "standard"} voice recognition`,
                });
              },
              onEnd: () => {
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
                console.log("Speech recognition result after mode switch:", text);
                
                // Get current text directly from the textarea again (just in case it changed)
                const latestText = projectIdeaRef.current?.value || currentText || '';
                const fullText = latestText ? latestText + ' ' + text : text;
                
                console.log("Mode switch updating with full text:", fullText);
                
                // Update the textarea with the accumulated text
                if (projectIdeaRef.current) {
                  projectIdeaRef.current.value = fullText;
                  
                  // Update the form state
                  setFormData(prev => ({ 
                    ...prev, 
                    projectIdea: fullText 
                  }));
                  
                  // Focus the field
                  projectIdeaRef.current.focus();
                }
              },
              useOpenAI: !useEnhancedVoice, // Use the new mode
              enhancedProcessing: !useEnhancedVoice // Use the new mode
            });
            
            recognitionServiceRef.current = recognitionService;
          }
          
          // Start speech recognition again
          recognitionServiceRef.current.start();
          setIsListening(true);
        }
      }, 300); // Short delay to ensure clean restart
    }
  }, [isListening, useEnhancedVoice, toast, formData.projectIdea, speakText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, industryType: value as IndustryType }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update the requirement
      const { error } = await supabase
        .from('requirements')
        .update({
          project_name: formData.projectName,
          company_name: formData.companyName,
          industry_type: formData.industryType,
          project_idea: formData.projectIdea,
          status: 'Re_Draft'
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Requirement updated",
        description: "Your requirement has been successfully updated and marked for re-draft. Click on Analyze to see the updated overview.",
      });
      
      navigate(`/dashboard/requirements/${id}`);
    } catch (error) {
      console.error('Error updating requirement:', error);
      toast({
        title: "Error",
        description: "There was an error updating your requirement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Card className="max-w-4xl mx-auto my-8 shadow-none border-none">
        <CardHeader className="space-y-2">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/dashboard/requirements/${id}`)}
              className="flex items-center gap-1 mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">Edit Requirement</CardTitle>
              <CardDescription className="text-muted-foreground">
                Update your requirement details
              </CardDescription>
            </div>
          </div>
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
                ref={projectIdeaRef}
                className="min-h-[120px] w-full bg-background"
              />
            </div>
            
            {/* Voice Input Controls */}
            <div className="flex flex-col gap-1 items-start mt-2">
              <Button 
                type="button" 
                variant={isListening ? "destructive" : "outline"}
                size="sm" 
                className={`flex items-center gap-2 ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            <CardFooter className="px-0 pt-4">
              <Button
                type="submit"
                className="w-full bg-[#4744E0] hover:bg-[#4744E0]/90"
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditRequirement;
