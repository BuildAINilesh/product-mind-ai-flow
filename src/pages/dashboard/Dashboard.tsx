
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
  Plus
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to ProductMind</h2>
            <p className="text-muted-foreground">
              Your AI-powered product management platform. Create, analyze, and validate requirements with ease.
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/requirements/new">
              <Plus size={16} className="mr-2" />
              New Requirement
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2 added this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Validated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              50% of total requirements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25%</div>
            <p className="text-xs text-muted-foreground mt-1">
              1 out of 4 requirements
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 of 4 requirements approved
            </p>
          </CardContent>
        </Card>
      </section>
      
      {/* Features Grid */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Platform Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Requirements</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create and manage structured product requirements with AI assistance.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/requirements" className="text-primary">
                      View Requirements
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">MarketSense</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get AI-powered market insights and competitive analysis.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/market-sense" className="text-primary">
                      Analyze Market
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Requirement Validator</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically validate requirements against best practices.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/validator" className="text-primary">
                      Validate Requirements
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <ClipboardList className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">TestGen</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generate comprehensive test cases from your requirements.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/test-gen" className="text-primary">
                      Generate Tests
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">BugShield</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Predict potential defects before they occur.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/bug-shield" className="text-primary">
                      Predict Defects
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <FileCheck className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">SmartSignoff</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Streamline approvals with AI-assisted validation.
                  </p>
                  <Button variant="link" asChild className="p-0 h-auto" size="sm">
                    <Link to="/dashboard/signoff" className="text-primary">
                      Manage Approvals
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Recent Activity */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your product requirements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">User Authentication System was approved</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">AI validation completed for Payment Processing Gateway</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-amber-500"></div>
              <div>
                <p className="font-medium">New requirement created: Inventory Management Dashboard</p>
                <p className="text-sm text-muted-foreground">8 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 mt-2 rounded-full bg-red-500"></div>
              <div>
                <p className="font-medium">Customer Feedback System was rejected</p>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
