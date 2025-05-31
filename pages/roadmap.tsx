
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Roadmap = () => {
  const milestones = [
    {
      quarter: "Q2 2024",
      features: [
        "Enhanced AI market analysis",
        "Real-time collaboration tools",
        "Advanced testing automation"
      ]
    },
    {
      quarter: "Q3 2024",
      features: [
        "Custom AI model training",
        "Integration with major CI/CD platforms",
        "Advanced analytics dashboard"
      ]
    },
    {
      quarter: "Q4 2024",
      features: [
        "Mobile app launch",
        "Enterprise SSO support",
        "Advanced security features"
      ]
    },
    {
      quarter: "Q1 2025",
      features: [
        "AI-powered code generation",
        "Cross-platform integration",
        "Advanced reporting tools"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Product Roadmap
          </h1>
          <p className="text-muted-foreground text-lg">
            Our vision for the future of ProductMind
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l" />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">
                    {milestone.quarter}
                  </h3>
                  <ul className="space-y-3">
                    {milestone.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
