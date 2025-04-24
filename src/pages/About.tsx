
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
      description: "Pushing the boundaries of what's possible with AI in product development"
    },
    {
      title: "Quality",
      description: "Maintaining the highest standards in everything we do"
    },
    {
      title: "Customer Success",
      description: "Dedicated to helping our customers achieve their goals"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
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
