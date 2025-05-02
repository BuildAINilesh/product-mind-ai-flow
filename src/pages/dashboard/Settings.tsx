
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Mail, BellRing, Key } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [firecrawlApiKey, setFirecrawlApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("firecrawlApiKey");
    if (storedApiKey) {
      // Mask the stored API key for display
      setFirecrawlApiKey(storedApiKey);
    }
  }, []);

  const saveApiKey = () => {
    setIsSaving(true);
    try {
      // Store the API key in localStorage
      localStorage.setItem("firecrawlApiKey", firecrawlApiKey);
      
      toast({
        title: "API Key Saved",
        description: "Your Firecrawl API key has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was a problem saving your API key.",
        variant: "destructive",
      });
      console.error("Error saving API key:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and settings</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information and email settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* API Configuration Settings */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Configure your API keys for external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firecrawlApiKey">Firecrawl API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="firecrawlApiKey" 
                  type="password" 
                  placeholder="Enter your Firecrawl API key" 
                  value={firecrawlApiKey}
                  onChange={(e) => setFirecrawlApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={saveApiKey} 
                  disabled={isSaving || !firecrawlApiKey}
                >
                  {isSaving ? 'Saving...' : 'Save Key'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                This key will be used for market research features.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="toggle"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in-app</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="toggle"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
