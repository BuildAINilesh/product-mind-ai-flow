import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Brain, Network, BarChart3, CheckCircle, FileCheck, Layers, CircuitBoard } from "lucide-react";
import { AIBackground, AICard, AIGradientText, NeuralNetwork } from "@/components/ui/ai-elements";

const Features = () => {
  const features = [
    {
      title: "AI Market Analysis",
      description: "Our AI algorithms analyze market data to identify trends, opportunities, and potential threats to your product strategy.",
      icon: <BarChart3 className="w-6 h-6 text-primary" />
    },
    {
      title: "AI-Powered Requirement Validation",
      description: "Machine learning models validate your requirements against industry standards and best practices to ensure quality.",
      icon: <Brain className="w-6 h-6 text-primary" />
    },
    {
      title: "Automated Test Case Generation",
      description: "AI networks generate comprehensive test scenarios based on your product requirements for maximum coverage.",
      icon: <FileCheck className="w-6 h-6 text-primary" />
    },
    {
      title: "Predictive Bug Detection",
      description: "AI algorithms analyze your requirements to identify potential bugs and defects before they happen.",
      icon: <Layers className="w-6 h-6 text-primary" />
    },
    {
      title: "AI-Assisted Approval Workflow",
      description: "Streamline the approval process with intelligent validation and automated workflows powered by AI.",
      icon: <CheckCircle className="w-6 h-6 text-primary" />
    },
    {
      title: "AI Insight Generation",
      description: "Turn data into actionable insights with our machine learning algorithms that identify patterns and opportunities.",
      icon: <CircuitBoard className="w-6 h-6 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <AIBackground variant="neural" className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-6">
              Powerful <AIGradientText>AI Features</AIGradientText> for Modern Product Teams
            </h1>
            <p className="text-muted-foreground text-lg">
              Our comprehensive suite of AI-powered tools helps product teams build better products faster with AI network assistance
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 opacity-10">
              <NeuralNetwork nodes={6} layers={12} className="w-full h-full" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {features.map((feature, index) => (
                <AICard key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    {feature.icon}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </AICard>
              ))}
            </div>
          </div>
        </div>
      </AIBackground>
    </div>
  );
};

export default Features;
