
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HelpCircle, MessageSquare, Mail, PhoneCall } from "lucide-react";

const Support = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <HelpCircle className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help with your account and product features</p>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat Support
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Available 24/7 for all your queries</p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Send us an email</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">support@productmind.com</p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Phone Support
            </CardTitle>
            <CardDescription>Call our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">+1 (555) 123-4567</p>
            <Button variant="outline" className="w-full">Call Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              question: "How do I create a new requirement?",
              answer: "Click on the 'New Requirement' button in the dashboard, then fill in the required fields in the form."
            },
            {
              question: "What is MarketSense?",
              answer: "MarketSense is our AI-powered market analysis tool that helps you understand market trends and competition."
            },
            {
              question: "How does the test case generation work?",
              answer: "Our AI analyzes your requirements and automatically generates comprehensive test cases based on best practices."
            }
          ].map((faq, index) => (
            <div key={index} className="border-b pb-4 last:border-none last:pb-0">
              <h3 className="font-medium mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
