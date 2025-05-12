import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Mail, BellRing } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { toast } = useToast();

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
        {/* Jira API Connection Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Jira API Connection</CardTitle>
            <CardDescription>Connect to your Jira instance by providing the required details below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jiraUrl">Jira URL</Label>
              <Input id="jiraUrl" placeholder="https://your-domain.atlassian.net" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jiraUsername">Username</Label>
              <Input id="jiraUsername" placeholder="your-email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jiraApiToken">Password/API Token</Label>
              <Input id="jiraApiToken" type="password" placeholder="Jira API Token or Password" />
            </div>
            <Button
              onClick={() => {
                const url = (document.getElementById('jiraUrl') as HTMLInputElement)?.value;
                const username = (document.getElementById('jiraUsername') as HTMLInputElement)?.value;
                const token = (document.getElementById('jiraApiToken') as HTMLInputElement)?.value;

                // Save to localStorage
                localStorage.setItem('jiraUrl', url);
                localStorage.setItem('jiraUsername', username);
                localStorage.setItem('jiraApiToken', token);

                toast({
                  title: 'Jira settings saved',
                  description: 'Your Jira integration settings have been saved locally.',
                  variant: 'default',
                });
              }}
            >
              Save Jira Settings
            </Button>
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
