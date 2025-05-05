import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  CircuitBoard,
} from "lucide-react";
import { motion } from "framer-motion";
import { AIAnalyticsCard } from "@/components/analytics/AIAnalyticsCard";
import { AIChart } from "@/components/analytics/AIChart";
import {
  AIBackground,
  AICard,
  AIGradientText,
  NeuralNetwork,
} from "@/components/ui/ai-elements";

const lineChartData = [
  { month: "Jan", requirements: 4, validated: 2 },
  { month: "Feb", requirements: 6, validated: 3 },
  { month: "Mar", requirements: 8, validated: 5 },
  { month: "Apr", requirements: 14, validated: 8 },
  { month: "May", requirements: 18, validated: 12 },
  { month: "Jun", requirements: 24, validated: 18 },
];

const barChartData = [
  { category: "UI/UX", value: 85 },
  { category: "Backend", value: 63 },
  { category: "Security", value: 92 },
  { category: "Performance", value: 78 },
  { category: "Scalability", value: 56 },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <section className="relative z-0 overflow-hidden rounded-xl bg-background">
        <AIBackground
          variant="neural"
          className="relative overflow-hidden rounded-xl neural-bg"
        >
          {/* Main glow effect */}
          <div className="absolute inset-auto z-10 h-36 w-[28rem] -translate-y-[30%] rounded-full bg-primary/60 opacity-50 blur-3xl" />

          {/* Neural network visualization with improved opacity */}
          <div className="absolute inset-0 opacity-20">
            <NeuralNetwork nodes={8} layers={14} className="h-full w-full" />
          </div>

          {/* Left gradient cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            animate={{ opacity: 0.8, width: "30rem" }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto right-1/2 h-56 w-[30rem] overflow-visible bg-gradient-conic from-primary/40 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
          >
            <div className="absolute bottom-0 left-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>

          {/* Right gradient cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            animate={{ opacity: 0.8, width: "30rem" }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-secondary/40 [--conic-position:from_290deg_at_center_top]"
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
          >
            <div className="absolute bottom-0 right-0 z-20 h-40 w-[100%] bg-background [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>

          {/* Content container */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8"
          >
            <div className="max-w-2xl">
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-3"
              >
                <AIGradientText className="tracking-tight">
                  Build Smarter Products Faster
                </AIGradientText>
              </motion.h2>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-base md:text-lg max-w-xl"
              >
                Your AI-assisted platform to create, analyze and validate
                product requirements-smarter and faster.
              </motion.p>
            </div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="mt-4 md:mt-0"
            >
              <Button
                asChild
                size="lg"
                className="relative overflow-hidden group bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
              >
                <Link to="/dashboard/requirements/new">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <Plus size={18} className="mr-2" />
                  New Requirement
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </AIBackground>
      </section>

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
          yKeys={["requirements", "validated"]}
        />

        <AIChart
          title="Requirement Categories Analysis"
          description="AI scoring by requirement category"
          data={barChartData}
          type="bar"
          xKey="category"
          yKeys={["value"]}
        />
      </section>

      {/* Features Grid - Fixed links by using proper Link components */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Platform Features</h3>
          <div className="h-px flex-1 bg-border mx-4"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/requirements" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Requirements</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create structured product requirements with machine learning
                    assistance.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    View Requirements
                  </span>
                </div>
              </div>
            </Link>
          </AICard>

          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/market-sense" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">MarketSense AI</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get neural network-powered market insights and competitive
                    analysis.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Analyze Market
                  </span>
                </div>
              </div>
            </Link>
          </AICard>

          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/validator" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Requirement Validator</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Machine learning validation against industry best practices.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Validate Requirements
                  </span>
                </div>
              </div>
            </Link>
          </AICard>

          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/test-gen" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Network className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Neural TestGen</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate comprehensive test cases using advanced AI models.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Generate Tests
                  </span>
                </div>
              </div>
            </Link>
          </AICard>

          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/bug-shield" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">BugShield ML</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predict potential defects using predictive AI modeling.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Predict Defects
                  </span>
                </div>
              </div>
            </Link>
          </AICard>

          <AICard className="p-6 hover:shadow-lg transition-shadow">
            <Link to="/dashboard/signoff" className="block h-full">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <CircuitBoard className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">AI Signoff</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Streamline approvals with neural network validation.
                  </p>
                  <span className="text-primary text-sm font-medium">
                    Manage Approvals
                  </span>
                </div>
              </div>
            </Link>
          </AICard>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <AICard>
          <CardHeader>
            <CardTitle>AI Activity Feed</CardTitle>
            <CardDescription>
              Latest AI-processed updates from your product requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">
                  AI approved User Authentication System
                </p>
                <p className="text-sm text-muted-foreground">
                  2 hours ago · 98% confidence score
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">
                  Neural validation completed for Payment Processing Gateway
                </p>
                <p className="text-sm text-muted-foreground">
                  5 hours ago · 93% confidence score
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-amber-500"></div>
              <div>
                <p className="font-medium">
                  AI generated 24 test cases for Inventory Management
                </p>
                <p className="text-sm text-muted-foreground">
                  8 hours ago · 87% coverage
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">
                  AI flagged potential issues in Customer Feedback System
                </p>
                <p className="text-sm text-muted-foreground">
                  2 days ago · 4 critical issues detected
                </p>
              </div>
            </div>
          </CardContent>
        </AICard>
      </section>
    </div>
  );
};

export default Dashboard;
