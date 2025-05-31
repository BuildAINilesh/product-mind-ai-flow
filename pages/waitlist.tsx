import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const Waitlist = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    jobTitle: "",
    interest: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      toast.error("Please accept the terms and conditions to continue.");
      return;
    }

    setLoading(true);
    try {
      // Use the type-safe approach with properly typed data
      const { error } = await supabase.from("waitlist").insert({
        full_name: formData.fullName,
        email: formData.email,
        company: formData.company || null,
        job_title: formData.jobTitle || null,
        interest: formData.interest || null,
      });

      if (error) {
        console.error("Error submitting to waitlist:", error);

        if (error.code === "23505") {
          toast.error("This email is already on our waitlist.");
        } else if (error.code === "42P01") {
          toast.error(
            "The waitlist feature is not yet fully set up. Please try again later."
          );
        } else {
          toast.error(
            "There was an error joining the waitlist. Please try again."
          );
        }
        return;
      }

      setSuccess(true);
      toast.success("You've been added to our waitlist!");
    } catch (error) {
      console.error("Error in waitlist submission:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-md">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Thank You! 🎉</CardTitle>
              <CardDescription>
                You've successfully joined our waitlist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <p>
                We appreciate your interest in ProductMind. We'll notify you as
                soon as we're ready to welcome you aboard.
              </p>
              <p className="text-muted-foreground">
                While you wait, feel free to check out our feature pages and
                learn more about what we're building.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button onClick={() => navigate("/")} className="w-full">
                Return to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/features")}
                className="w-full"
              >
                Explore Features
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Join Our Waitlist</CardTitle>
            <CardDescription>
              Be the first to know when ProductMind launches
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Product Manager"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">
                  What interests you about ProductMind?
                </Label>
                <Textarea
                  id="interest"
                  name="interest"
                  placeholder="Tell us why you're interested..."
                  value={formData.interest}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Join Waitlist"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Waitlist;
