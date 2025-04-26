
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Brain, Network, BarChart3, CheckCircle, FileCheck, Layers, CircuitBoard } from "lucide-react";
import { AIBackground, AICard, AIGradientText, NeuralNetwork } from "@/components/ui/ai-elements";

const Features = () => {
  const features = [
    {
      title: "Neural Network Market Analysis",
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
      description: "Neural networks generate comprehensive test scenarios based on your product requirements for maximum coverage.",
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
      title: "Neural Network Data Processing",
      description: "Process and analyze large volumes of product data using our advanced neural network architectures.",
      icon: <Network className="w-6 h-6 text-primary" />
    },
    {
      title: "AI Insight Generation",
      description: "Turn data into actionable insights with our machine learning algorithms that identify patterns and opportunities.",
      icon: <CircuitBoard className="w-6 h-6 text-primary" />
    },
    {
      title: "Automated Documentation",
      description: "AI automatically generates comprehensive documentation based on your product requirements and specifications.",
      icon: <FileCheck className="w-6 h-6 text-primary" />
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
              Our comprehensive suite of AI-powered tools helps product teams build better products faster with neural network assistance
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
      
      {/* AI Benefits Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Our <AIGradientText>AI Technology</AIGradientText> Transforms Product Management
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <AICard className="p-8 flex flex-col h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Neural Networks</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Our advanced neural networks analyze patterns in your product data to provide insights that would be impossible to discover manually. These AI systems learn from your historical data and industry trends to make increasingly accurate predictions and recommendations.
              </p>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Pattern recognition in market data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Automated requirement analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Predictive modeling for product success</span>
                </li>
              </ul>
            </AICard>
            
            <AICard className="p-8 flex flex-col h-full">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-3 rounded-full bg-secondary/10">
                  <CircuitBoard className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">Machine Learning</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Our machine learning algorithms continually improve as they process more data from your product development lifecycle. This means the platform becomes more valuable over time, learning from your team's decisions and outcomes to provide increasingly relevant recommendations.
              </p>
              <ul className="space-y-2 mt-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Adaptive learning from your data</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Increasingly accurate predictions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Personalized insights for your products</span>
                </li>
              </ul>
            </AICard>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
