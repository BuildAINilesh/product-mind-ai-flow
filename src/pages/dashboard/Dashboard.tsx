
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  BarChart3,
  CheckSquare,
  ClipboardList,
  AlertTriangle,
  FileCheck,
  Plus,
  Brain,
  Layers,
  Network,
  BarChart,
  CircuitBoard
} from "lucide-react";
import { AIAnalyticsCard } from "@/components/analytics/AIAnalyticsCard";
import { AIChart } from "@/components/analytics/AIChart";
import { AIBackground, AICard, AIGradientText, NeuralNetwork } from "@/components/ui/ai-elements";

const lineChartData = [
  { month: 'Jan', requirements: 4, validated: 2 },
  { month: 'Feb', requirements: 6, validated: 3 },
  { month: 'Mar', requirements: 8, validated: 5 },
  { month: 'Apr', requirements: 14, validated: 8 },
  { month: 'May', requirements: 18, validated: 12 },
  { month: 'Jun', requirements: 24, validated: 18 },
];

const barChartData = [
  { category: 'UI/UX', value: 85 },
  { category: 'Backend', value: 63 },
  { category: 'Security', value: 92 },
  { category: 'Performance', value: 78 },
  { category: 'Scalability', value: 56 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <AIBackground variant="neural" className="relative overflow-hidden rounded-lg p-6 neural-bg">
        <div className="absolute inset-0 opacity-10">
          <NeuralNetwork nodes={6} layers={12} className="h-full w-full" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to <AIGradientText>ProductMind AI</AIGradientText></h2>
            <p className="text-muted-foreground">
              Your AI-powered product management platform. Create, analyze, and validate requirements with machine learning assistance.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
            <Link to="/dashboard/requirements/new">
              <Plus size={16} className="mr-2" />
              New Requirement
            </Link>
          </Button>
        </div>
      </AIBackground>
      
      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AIAnalyticsCard
          title="Total Requirements"
          value="24"
          trend={12}
          trendLabel="vs last month"
          icon={<FileText size={18} />}
        />
        
        <AIAnalyticsCard
          title="AI Validated"
          value="18"
          trend={50}
          trendLabel="completion rate"
          icon={<Brain size={18} />}
        />
        
        <AIAnalyticsCard
          title="Test Coverage"
          value="75%"
          trend={8}
          trendLabel="improvement"
          icon={<CheckSquare size={18} />}
        />
        
        <AIAnalyticsCard
          title="Approval Rate"
          value="92%"
          trend={4}
          trendLabel="improvement"
          icon={<FileCheck size={18} />}
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIChart
          title="Requirements & Validation Trends"
          description="Monthly comparison of new requirements and AI validations"
          data={lineChartData}
          type="line"
          xKey="month"
          yKeys={['requirements', 'validated']}
        />
        
        <AIChart
          title="Requirement Categories Analysis"
          description="AI scoring by requirement category"
          data={barChartData}
          type="bar"
          xKey="category"
          yKeys={['value']}
        />
      </section>
      
      {/* Features Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Platform Features</h3>
          <div className="h-px flex-1 bg-border mx-4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI Requirements</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Create structured product requirements with machine learning assistance.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/requirements" className="text-primary">
                    View Requirements
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
          
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-secondary/10">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">MarketSense AI</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Get neural network-powered market insights and competitive analysis.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/market-sense" className="text-primary">
                    Analyze Market
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
          
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Requirement Validator</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Machine learning validation against industry best practices.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/validator" className="text-primary">
                    Validate Requirements
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
          
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Network className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Neural TestGen</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Generate comprehensive test cases using advanced AI models.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/test-gen" className="text-primary">
                    Generate Tests
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
          
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">BugShield ML</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Predict potential defects using predictive AI modeling.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/bug-shield" className="text-primary">
                    Predict Defects
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
          
          <AICard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-secondary/10">
                <CircuitBoard className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">AI Signoff</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Streamline approvals with neural network validation.
                </p>
                <Button variant="link" asChild className="p-0 h-auto" size="sm">
                  <Link to="/dashboard/signoff" className="text-primary">
                    Manage Approvals
                  </Link>
                </Button>
              </div>
            </div>
          </AICard>
        </div>
      </section>
      
      {/* Recent Activity */}
      <section>
        <AICard>
          <CardHeader>
            <CardTitle>AI Activity Feed</CardTitle>
            <CardDescription>Latest AI-processed updates from your product requirements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">AI approved User Authentication System</p>
                <p className="text-sm text-muted-foreground">2 hours ago · 98% confidence score</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">Neural validation completed for Payment Processing Gateway</p>
                <p className="text-sm text-muted-foreground">5 hours ago · 93% confidence score</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-amber-500"></div>
              <div>
                <p className="font-medium">AI generated 24 test cases for Inventory Management</p>
                <p className="text-sm text-muted-foreground">8 hours ago · 87% coverage</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">AI flagged potential issues in Customer Feedback System</p>
                <p className="text-sm text-muted-foreground">2 days ago · 4 critical issues detected</p>
              </div>
            </div>
          </CardContent>
        </AICard>
      </section>
    </div>
  );
};

export default Dashboard;
