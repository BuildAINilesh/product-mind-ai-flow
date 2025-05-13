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
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">Find answers to common questions about ProductMind's AI features</p>
        </div>
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
              question: "How does AI TestGen work?",
              answer: "AI TestGen analyzes your requirements and automatically generates comprehensive test cases based on best practices."
            },
            {
              question: "What is BugShield ML?",
              answer: "BugShield ML predicts potential defects and issues before they occur using advanced AI risk analysis algorithms."
            },
            {
              question: "How does AI Signoff streamline approvals?",
              answer: "AI Signoff provides automated validation and recommendations, making the approval process faster and more reliable."
            },
            {
              question: "What insights does AI Analytics provide?",
              answer: "AI Analytics creates comprehensive reports with visualizations and actionable insights from your product development process."
            },
            {
              question: "Can I edit or delete requirements after creation?",
              answer: "Yes, you can edit or delete requirements from your dashboard at any time."
            },
            {
              question: "Is my data secure?",
              answer: "Yes, ProductMind uses industry-standard security practices to keep your data safe and private."
            },
            {
              question: "How do I contact support?",
              answer: "You can reach out to us via the contact form on our website or email support@productmind.com."
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
