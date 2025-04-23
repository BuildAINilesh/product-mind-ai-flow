
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Mic, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InputMethod = "manual" | "upload" | "voice" | "email";

const NewRequirement = () => {
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    industryType: "",
    problemStatement: "",
    solutionDescription: "",
    justification: "",
    clientResearch: "",
    featureDetails: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Requirement created",
        description: "Your requirement has been successfully created and is being analyzed.",
      });
      navigate("/dashboard/requirements");
    }, 1500);
  };
  
  const industryTypes = [
    "Technology", 
    "Healthcare", 
    "Financial Services", 
    "Retail", 
    "Manufacturing", 
    "Education",
    "Entertainment",
    "Transportation",
    "Other"
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">New Requirement</h2>
      
      <Tabs defaultValue="manual" onValueChange={(value) => setInputMethod(value as InputMethod)}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText size={16} />
            <span>Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            <span>Upload Document</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic size={16} />
            <span>Voice Input</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail size={16} />
            <span>Email Import</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Product Requirement Details</CardTitle>
                <CardDescription>
                  Fill in the details of your product requirement. Our AI will help organize and validate it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Requirement Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="E.g., 'Mobile App Login Feature'"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Your company name"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="industryType">Industry Type</Label>
                    <Select
                      value={formData.industryType}
                      onValueChange={(value) => handleSelectChange("industryType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryTypes.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="problemStatement">Problem Statement</Label>
                  <Textarea
                    id="problemStatement"
                    name="problemStatement"
                    placeholder="Describe the problem this feature solves..."
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="solutionDescription">Solution Description</Label>
                  <Textarea
                    id="solutionDescription"
                    name="solutionDescription"
                    placeholder="Describe your proposed solution..."
                    value={formData.solutionDescription}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="justification">Business Justification</Label>
                  <Textarea
                    id="justification"
                    name="justification"
                    placeholder="Why is this feature important for the business?"
                    value={formData.justification}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clientResearch">Client/User Research</Label>
                  <Textarea
                    id="clientResearch"
                    name="clientResearch"
                    placeholder="Include any user research or client feedback..."
                    value={formData.clientResearch}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featureDetails">Feature Details & Specifications</Label>
                  <Textarea
                    id="featureDetails"
                    name="featureDetails"
                    placeholder="Detailed specifications about the feature..."
                    value={formData.featureDetails}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/dashboard/requirements")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Create Requirement"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload your existing document and our AI will extract and structure the requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-full max-w-sm bg-muted/50 border-2 border-dashed border-muted-foreground/20 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Requirement Document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to upload. Supports Word, PDF, and text files.
                </p>
                <Button variant="outline" size="sm">Choose File</Button>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                After uploading, our AI will process the document and extract requirements.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>
                Record your requirements using voice input and our AI will transcribe and structure them.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <Mic className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-4">Press to start recording</h3>
              <Button className="rounded-full w-16 h-16 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </Button>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-muted-foreground">
                After recording, our AI will transcribe your voice and structure the requirements.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Import</CardTitle>
              <CardDescription>
                Import requirements directly from email correspondence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Enter your email address" />
              </div>
              <div className="p-6 bg-muted/50 border border-border rounded-lg">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
                  <li>Enter your email address above</li>
                  <li>We'll send you an authorization link</li>
                  <li>Select which emails contain your requirements</li>
                  <li>Our AI will extract and structure the requirements</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Connect Email</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewRequirement;
