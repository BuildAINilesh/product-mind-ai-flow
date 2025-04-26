
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { Brain, Network, BarChart3, CheckCircle, FileCheck, Layers } from "lucide-react";
import { AIBackground, AIGradientText, NeuralNetwork } from "@/components/ui/ai-elements";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent />
      
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 overflow-hidden">
        <AIBackground variant="neural" className="absolute inset-0 z-0" />
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <AIGradientText>AI-Powered</AIGradientText> Product Management
              </h1>
              <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl mx-auto lg:mx-0">
                Transform your product development lifecycle with neural networks and machine learning assistance at every stage,
                from ideation to finalized requirements, testing, and approval.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="text-lg px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <Link to="/features">See Features</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 mt-8 lg:mt-0">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-1">
                  <div className="relative bg-card rounded-xl shadow-xl overflow-hidden border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1000" 
                      alt="ProductMind Dashboard" 
                      className="w-full h-auto rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent rounded-t-xl pointer-events-none"></div>
                    <div className="p-6 relative">
                      <div className="absolute -top-12 right-6 w-24 h-24 opacity-40">
                        <NeuralNetwork nodes={3} layers={3} />
                      </div>
                      <h3 className="text-lg font-medium mb-2">AI-Driven Insights Dashboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Make data-driven decisions with our comprehensive analytics and AI recommendations.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-secondary/20 w-40 h-40 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -top-4 -left-4 bg-primary/20 w-40 h-40 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full ai-grid"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supercharge Your Product Development with <AIGradientText>AI</AIGradientText></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform streamlines every stage of the product lifecycle with intelligent assistance and neural networks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="ai-card card-hover overflow-hidden border-border/50">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full data-flow"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How <AIGradientText>ProductMind AI</AIGradientText> Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-driven workflow helps product teams move from idea to approved requirements with machine learning assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4 relative overflow-hidden">
                    <div className="relative z-10">{index + 1}</div>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_70%,_rgba(255,255,255,0.2),_transparent_70%)]"></div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-secondary/50"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 px-4 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary">
          <div className="absolute inset-0 opacity-20">
            <NeuralNetwork nodes={8} layers={24} className="w-full h-full" />
          </div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Product Development with AI?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join the teams already using ProductMind's neural networks to build better products, faster.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 bg-white hover:bg-white/90 text-primary">
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                  <span className="text-white font-bold text-lg relative z-10">P</span>
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_70%,_rgba(255,255,255,0.2),_transparent_70%)]"></div>
                </div>
                <span className="font-bold text-xl">Product<AIGradientText>Mind</AIGradientText></span>
              </div>
              <p className="text-muted-foreground">
                AI-powered product management platform for modern teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ProductMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature data
const features = [
  {
    title: "Neural Requirements",
    description: "Transform ideas into structured requirements with AI assistance that identifies gaps and enhances quality.",
    icon: <Brain size={24} className="text-primary" />
  },
  {
    title: "MarketSense AI",
    description: "Get real-time market insights, competitor analysis, and gap identification powered by neural networks.",
    icon: <BarChart3 size={24} className="text-primary" />
  },
  {
    title: "AI TestGen",
    description: "Automatically generate comprehensive test cases and scenarios based on requirement analysis.",
    icon: <FileCheck size={24} className="text-primary" />
  },
  {
    title: "BugShield ML",
    description: "Predict potential defects and issues before they occur with our AI risk analysis algorithms.",
    icon: <Layers size={24} className="text-primary" />
  },
  {
    title: "Neural Signoff",
    description: "Streamline approvals with AI recommendations and automated validation of requirements.",
    icon: <CheckCircle size={24} className="text-primary" />
  },
  {
    title: "AI Analytics",
    description: "Create comprehensive reports with visualizations and insights from your product development process.",
    icon: <Network size={24} className="text-primary" />
  }
];

// Step data
const steps = [
  {
    title: "AI Requirement Creation",
    description: "Input your product ideas and let neural networks structure them into formal requirements."
  },
  {
    title: "Machine Learning Analysis",
    description: "Receive AI-powered market insights and competitive analysis for your requirements."
  },
  {
    title: "Neural Test Generation",
    description: "Generate comprehensive test cases to validate your requirements using AI models."
  },
  {
    title: "AI-Powered Approval",
    description: "Get intelligent validation and streamlined approval for your product requirements."
  }
];

export default Index;
