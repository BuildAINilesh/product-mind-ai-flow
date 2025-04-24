import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bug, AlertTriangle, Shield, Info, Check, Zap } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Progress } from "@/components/ui/progress";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

// Mock vulnerability data
const mockVulnerabilities = [
  {
    id: "BUG001",
    severity: "high",
    title: "SQL Injection Vulnerability",
    description: "Potential SQL injection vulnerability in user input handling",
    riskLevel: 85,
    remediation: "Implement parameterized queries and input validation"
  },
  {
    id: "BUG002",
    severity: "medium",
    title: "Cross-Site Scripting (XSS)",
    description: "Possible XSS vulnerability in comment submission form",
    riskLevel: 65,
    remediation: "Sanitize user input and implement Content Security Policy"
  },
  {
    id: "BUG003",
    severity: "low",
    title: "Insecure Direct Object Reference",
    description: "Inadequate access control for user resources",
    riskLevel: 40,
    remediation: "Implement proper authorization checks for resource access"
  },
  {
    id: "BUG004",
    severity: "high",
    title: "Authentication Bypass",
    description: "Potential authentication bypass in password reset flow",
    riskLevel: 90,
    remediation: "Implement secure token validation and expiration"
  },
  {
    id: "BUG005",
    severity: "medium",
    title: "Insecure Storage of Sensitive Data",
    description: "User preferences stored in plaintext",
    riskLevel: 60,
    remediation: "Encrypt sensitive data at rest"
  }
];

const BugShield = () => {
  const [codeInput, setCodeInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);

  const handleAnalyze = () => {
    if (!codeInput.trim()) {
      toast("Please enter code or requirements to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setVulnerabilities([]);
    setSecurityScore(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setVulnerabilities(mockVulnerabilities);
      setSecurityScore(65);
      setIsAnalyzing(false);
      toast("Security analysis complete.");
    }, 2500);
  };

  const handleClear = () => {
    setCodeInput("");
    setVulnerabilities([]);
    setSecurityScore(null);
  };

  // Count vulnerabilities by severity
  const highCount = vulnerabilities.filter(v => v.severity === "high").length;
  const mediumCount = vulnerabilities.filter(v => v.severity === "medium").length;
  const lowCount = vulnerabilities.filter(v => v.severity === "low").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BugShield</h1>
        <p className="text-muted-foreground">
          Proactive security analysis to identify potential vulnerabilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Security Analysis
              </CardTitle>
              <CardDescription>
                Enter your code or requirements for security analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste your code or describe your feature here..."
                className="min-h-[250px] font-mono text-sm"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClear}>Clear</Button>
              <Button 
                disabled={isAnalyzing} 
                onClick={handleAnalyze}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>Analyzing<span className="animate-pulse">...</span></>
                ) : (
                  <>
                    <Bug className="h-4 w-4" />
                    Analyze Security
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {securityScore !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-2 ${
                    securityScore > 80 ? "border-green-500" : 
                    securityScore > 60 ? "border-yellow-500" : 
                    "border-red-500"
                  }`}>
                    <span className="text-3xl font-bold">{securityScore}</span>
                  </div>
                  <div className="text-sm font-medium mb-4">{
                    securityScore > 80 ? "Good" : 
                    securityScore > 60 ? "Needs Improvement" : 
                    "At Risk"
                  }</div>
                  
                  <div className="w-full space-y-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>High Severity</span>
                      <span className="font-medium">{highCount}</span>
                    </div>
                    <Progress value={highCount > 0 ? 100 : 0} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                    
                    <div className="flex justify-between text-sm mb-1">
                      <span>Medium Severity</span>
                      <span className="font-medium">{mediumCount}</span>
                    </div>
                    <Progress value={mediumCount > 0 ? 100 : 0} className="h-2 bg-muted" indicatorClassName="bg-yellow-500" />
                    
                    <div className="flex justify-between text-sm mb-1">
                      <span>Low Severity</span>
                      <span className="font-medium">{lowCount}</span>
                    </div>
                    <Progress value={lowCount > 0 ? 100 : 0} className="h-2 bg-muted" indicatorClassName="bg-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {vulnerabilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detected Vulnerabilities</CardTitle>
                <CardDescription>
                  Potential security issues in your code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {vulnerabilities.map((vulnerability) => (
                    <div 
                      key={vulnerability.id}
                      className={`p-3 border rounded-md ${
                        vulnerability.severity === "high" ? "bg-red-50 border-red-200" :
                        vulnerability.severity === "medium" ? "bg-yellow-50 border-yellow-200" :
                        "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-2">
                          {vulnerability.severity === "high" ? (
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                          ) : vulnerability.severity === "medium" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className="text-sm font-medium">{vulnerability.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{vulnerability.description}</p>
                          </div>
                        </div>
                        
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Info className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Remediation</h4>
                              <p className="text-sm">{vulnerability.remediation}</p>
                              <div className="pt-2">
                                <div className="text-xs text-muted-foreground mb-1">Risk Level</div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      vulnerability.riskLevel > 70 ? "bg-red-500" : 
                                      vulnerability.riskLevel > 40 ? "bg-yellow-500" : "bg-blue-500"
                                    }`}
                                    style={{ width: `${vulnerability.riskLevel}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BugShield;
