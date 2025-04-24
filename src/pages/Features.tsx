
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { CheckCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Market Analysis",
      description: "AI-powered market analysis to identify trends and opportunities"
    },
    {
      title: "Requirement Validation",
      description: "Automated validation of product requirements against industry standards"
    },
    {
      title: "Test Generation",
      description: "Intelligent test case generation for comprehensive coverage"
    },
    {
      title: "Bug Detection",
      description: "Advanced bug detection and prevention system"
    },
    {
      title: "Smart Approval",
      description: "Streamlined approval workflow with AI assistance"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Powerful Features for Modern Product Teams
          </h1>
          <p className="text-muted-foreground text-lg">
            Our comprehensive suite of tools helps product teams build better products faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
