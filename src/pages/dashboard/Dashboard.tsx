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
  MoveUpRight,
  MoveDownLeft,
  AlertCircle,
  Users,
  Activity,
  CheckCircle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useState } from "react";

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

// Stat card component for the dashboard
interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendUp?: boolean;
}

function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && trend > 0 && (
            <div className="flex items-center text-xs">
              {trendUp ? (
                <MoveUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <MoveDownLeft className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={trendUp ? "text-green-500" : "text-red-500"}>
                {trend}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const { data, loading, error } = useDashboardStats();
  const [activeTab, setActiveTab] = useState("activity");

  // Chart configurations
  const weeklyChartConfig = {
    requirements: {
      label: "Requirements",
      color: "hsl(var(--primary))",
    },
    validated: {
      label: "Validations",
      color: "hsl(var(--secondary))",
    },
  };

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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

      {loading ? (
        <div className="flex h-[600px] w-full items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Error Loading Data</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Requirements"
              value={data?.requirementStats.total || 0}
              description={`${data?.requirementStats.completed || 0} completed`}
              icon={<FileText size={18} />}
              trend={8}
              trendUp={true}
            />

            <StatCard
              title="AI Validated"
              value={data?.validationStats.passed || 0}
              description={`${
                Math.round(
                  ((data?.validationStats.passed || 0) /
                    ((data?.validationStats.passed || 0) +
                      (data?.validationStats.failed || 0) +
                      (data?.validationStats.pending || 0))) *
                    100
                ) || 0
              }% success rate`}
              icon={<Brain size={18} />}
              trend={12}
              trendUp={true}
            />

            <StatCard
              title="Test Coverage"
              value={`${Math.round(
                ((data?.testCoverage.functional || 0) +
                  (data?.testCoverage.integration || 0) +
                  (data?.testCoverage.edge || 0) +
                  (data?.testCoverage.negative || 0)) /
                  4
              )}%`}
              description="Average across test types"
              icon={<CheckSquare size={18} />}
              trend={5}
              trendUp={true}
            />

            <StatCard
              title="Approval Rate"
              value={`${
                Math.round(
                  ((data?.validationStats.passed || 0) /
                    ((data?.validationStats.passed || 0) +
                      (data?.validationStats.failed || 0))) *
                    100
                ) || 0
              }%`}
              description={`${
                data?.validationStats.pending || 0
              } pending review`}
              icon={<FileCheck size={18} />}
              trend={3}
              trendUp={true}
            />
          </section>

          {/* Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Progress Chart */}
            <div className="lg:col-span-2">
              <AIChart
                title="Weekly Progress"
                description="Requirements and validations completed over the past week"
                data={data?.weeklyProgress || []}
                type="bar"
                xKey="date"
                yKeys={["requirements", "validated"]}
                colors={["hsl(var(--primary))", "hsl(var(--secondary))"]}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Test Coverage</CardTitle>
                <CardDescription>
                  Distribution across test types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Functional",
                            value: data?.testCoverage.functional || 0,
                          },
                          { name: "Edge", value: data?.testCoverage.edge || 0 },
                          {
                            name: "Integration",
                            value: data?.testCoverage.integration || 0,
                          },
                          {
                            name: "Negative",
                            value: data?.testCoverage.negative || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {[0, 1, 2, 3].map((index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Tabs Section */}
          <Tabs
            defaultValue="activity"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates from your product requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.recentActivity.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">
                            {activity.user}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                activity.action === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : activity.action === "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : activity.action === "Updated"
                                  ? "bg-blue-100 text-blue-800"
                                  : activity.action === "Added"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {activity.action}
                            </span>
                          </TableCell>
                          <TableCell>{activity.item}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="requirements">
              <Card>
                <CardHeader>
                  <CardTitle>Requirements Breakdown</CardTitle>
                  <CardDescription>
                    Current status of all requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Completed
                      </span>
                      <span className="text-2xl font-bold">
                        {data?.requirementStats.completed || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.requirementStats.completed || 0) /
                            (data?.requirementStats.total || 1)) *
                            100
                        )}
                        % of total
                      </span>
                    </div>
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        In Progress
                      </span>
                      <span className="text-2xl font-bold">
                        {data?.requirementStats.inProgress || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.requirementStats.inProgress || 0) /
                            (data?.requirementStats.total || 1)) *
                            100
                        )}
                        % of total
                      </span>
                    </div>
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Pending
                      </span>
                      <span className="text-2xl font-bold">
                        {data?.requirementStats.pending || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.requirementStats.pending || 0) /
                            (data?.requirementStats.total || 1)) *
                            100
                        )}
                        % of total
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="validation">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Results</CardTitle>
                  <CardDescription>
                    Current validation status across the project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Passed
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {data?.validationStats.passed || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.validationStats.passed || 0) /
                            ((data?.validationStats.passed || 0) +
                              (data?.validationStats.failed || 0) +
                              (data?.validationStats.pending || 0))) *
                            100
                        )}
                        % success rate
                      </span>
                    </div>
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Failed
                      </span>
                      <span className="text-2xl font-bold text-red-600">
                        {data?.validationStats.failed || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.validationStats.failed || 0) /
                            ((data?.validationStats.passed || 0) +
                              (data?.validationStats.failed || 0) +
                              (data?.validationStats.pending || 0))) *
                            100
                        )}
                        % failure rate
                      </span>
                    </div>
                    <div className="flex flex-col p-4 border rounded-md">
                      <span className="text-sm text-muted-foreground">
                        Pending
                      </span>
                      <span className="text-2xl font-bold text-yellow-600">
                        {data?.validationStats.pending || 0}
                      </span>
                      <span className="text-sm text-muted-foreground mt-2">
                        {Math.round(
                          ((data?.validationStats.pending || 0) /
                            ((data?.validationStats.passed || 0) +
                              (data?.validationStats.failed || 0) +
                              (data?.validationStats.pending || 0))) *
                            100
                        )}
                        % awaiting validation
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Grid */}
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
                        Create structured product requirements with machine
                        learning assistance.
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
                      <Activity className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">MarketSense AI</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get neural network-powered market insights and
                        competitive analysis.
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
                      <h4 className="font-semibold mb-1">
                        Requirement Validator
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Machine learning validation against industry best
                        practices.
                      </p>
                      <span className="text-primary text-sm font-medium">
                        Validate Requirements
                      </span>
                    </div>
                  </div>
                </Link>
              </AICard>

              <AICard className="p-6 hover:shadow-lg transition-shadow">
                <Link to="/dashboard/ai-cases" className="block h-full">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">AI Case Generator</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Generate comprehensive test cases using advanced AI
                        models.
                      </p>
                      <span className="text-primary text-sm font-medium">
                        Generate Tests
                      </span>
                    </div>
                  </div>
                </Link>
              </AICard>

              <AICard className="p-6 hover:shadow-lg transition-shadow">
                <Link to="/dashboard/signoff" className="block h-full">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <FileCheck className="h-5 w-5 text-secondary" />
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
