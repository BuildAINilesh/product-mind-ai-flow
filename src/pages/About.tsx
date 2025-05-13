import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const stats = [
    { number: "10k+", label: "Users" },
    { number: "50+", label: "Countries" },
    { number: "1M+", label: "Requirements Processed" },
    { number: "99.9%", label: "Uptime" }
  ];

  const values = [
    {
      title: "Innovation",
      description: "We leverage cutting-edge AI to automate and enhance every stage of product management—from requirements analysis to test case generation, validation, and signoff. ProductMind empowers teams to move faster and smarter."
    },
    {
      title: "Quality & Trust",
      description: "Our platform ensures your requirements are validated against industry best practices, risks are identified early, and recommendations are always data-driven. We prioritize accuracy, reliability, and actionable insights."
    },
    {
      title: "Customer Success",
      description: "We're dedicated to helping you build better products. With AI-powered dashboards, analytics, and market insights, ProductMind gives you the tools to make informed decisions and achieve your goals."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-6">
            About ProductMind
          </h1>
          <p className="text-muted-foreground text-lg">
            Revolutionizing product development with AI-powered insights
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
