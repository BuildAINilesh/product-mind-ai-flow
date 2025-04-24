
import Navbar from "@/components/Navbar";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-muted-foreground mb-6">
              Last updated: April 24, 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using ProductMind's services, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground">
                ProductMind grants you a limited, non-exclusive, non-transferable, revocable license to use our services for your internal business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Service Rules</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You must not misuse our services</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must comply with all applicable laws</li>
                <li>You must not interfere with our services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Modifications</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or discontinue our services at any time, with or without notice.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
