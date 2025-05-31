
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const Career = () => {
  const positions = [
    {
      title: "Senior Frontend Engineer",
      location: "Remote",
      type: "Full-time",
      description: "Join our team to build the next generation of product development tools"
    },
    {
      title: "Product Manager",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Shape the future of our product and work with cutting-edge AI technology"
    },
    {
      title: "AI/ML Engineer",
      location: "Remote",
      type: "Full-time",
      description: "Develop AI models for product analysis and automation"
    }
  ];

  const benefits = [
    "Competitive salary and equity",
    "Remote-first culture",
    "Health, dental, and vision insurance",
    "Unlimited PTO",
    "Professional development budget",
    "Home office setup allowance"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Join Our Team
          </h1>
          <p className="text-muted-foreground text-lg">
            Help us revolutionize product development with AI
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
          <div className="space-y-6">
            {positions.map((position, index) => (
              <Card key={index}>
                <CardHeader>
                  <h3 className="text-xl font-semibold">{position.title}</h3>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{position.location}</span>
                    <span>{position.type}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{position.description}</p>
                  <Button>Apply Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Benefits & Perks</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {benefit}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
