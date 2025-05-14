import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Filter,
  Sparkles,
  Lightbulb,
  Download,
  Edit,
  BrainCircuit,
  Check,
  RefreshCw,
  FileEdit,
} from "lucide-react";
import {
  AICard,
  AIBackground,
  AIBadge,
  AIGradientText,
} from "@/components/ui/ai-elements";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { capitalizeWords } from "@/utils/formatters";

type Requirement = {
  id: string;
  req_id: string;
  project_name: string;
  company_name: string | null;
  industry_type: string;
  project_idea: string | null;
  input_methods_used: string[];
  file_urls: string[];
  status: "Draft" | "Completed" | "Re_Draft";
  created_at: string;
};

const RequirementsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: requirements = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["requirements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requirements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    },
  });

  const filteredRequirements = requirements.filter((req) => {
    // Apply text search
    const matchesSearch =
      req.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.req_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.company_name &&
        req.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.industry_type.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter if active
    const matchesStatus = statusFilter
      ? req.status.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const triggerAnalysis = async (requirementId: string) => {
    try {
      toast({
        title: "Processing",
        description: "Analyzing requirement...",
      });

      const { data, error } = await supabase.functions.invoke(
        "process-project",
        {
          body: { projectId: requirementId },
        }
      );

      if (error) {
        throw error;
      }

      // Update status to Completed
      const { error: updateError } = await supabase
        .from("requirements")
        .update({ status: "Completed" })
        .eq("id", requirementId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Analysis completed successfully.",
      });

      // Refetch the requirements list
      refetch();
    } catch (error) {
      console.error("Error analyzing requirement:", error);
      toast({
        title: "Error",
        description: "Failed to analyze requirement. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigateToMarketSense = async (requirementId: string) => {
    try {
      // First, check if a market analysis entry already exists
      const { data: existingAnalysis, error: checkError } = await supabase
        .from("market_analysis")
        .select("id, status")
        .eq("requirement_id", requirementId)
        .maybeSingle();

      if (checkError) {
        console.error(
          "Error checking for existing market analysis:",
          checkError
        );
        toast({
          title: "Error",
          description: "Failed to check for existing market analysis.",
          variant: "destructive",
        });
        return;
      }

      // If no entry exists, create one
      if (!existingAnalysis) {
        const { error } = await supabase.from("market_analysis").insert({
          requirement_id: requirementId,
          status: "Draft",
        });

        if (error) {
          console.error("Error creating market analysis entry:", error);
          toast({
            title: "Error",
            description: "Failed to create market analysis entry.",
            variant: "destructive",
          });
          return;
        }

        // Verify the entry was created by fetching it again
        const { data: verifyCreation, error: verifyError } = await supabase
          .from("market_analysis")
          .select("id")
          .eq("requirement_id", requirementId)
          .maybeSingle();

        if (verifyError || !verifyCreation) {
          console.error(
            "Error verifying market analysis creation:",
            verifyError
          );
          toast({
            title: "Warning",
            description:
              "Market analysis entry may not have been created properly.",
          });
        } else {
          console.log(
            "Successfully created market analysis entry:",
            verifyCreation
          );
        }
      } else {
        console.log("Using existing market analysis:", existingAnalysis);
      }

      // Add a small delay to ensure the database has processed the entry
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Navigate to the main MarketSense dashboard with the requirement ID as a URL parameter
      navigate(`/dashboard/market-sense?requirementId=${requirementId}`);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium">Completed</span>
          </div>
        );
      case "re_draft":
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-xs font-medium">Re-Draft</span>
          </div>
        );
      case "draft":
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium">Draft</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <span className="text-xs font-medium">Unknown</span>
          </div>
        );
    }
  };

  // Get counts for stats - combine Draft and Re-Draft
  const stats = {
    total: requirements.length,
    completed: requirements.filter(
      (r) => r.status.toLowerCase() === "completed"
    ).length,
    draft: requirements.filter(
      (r) =>
        r.status.toLowerCase() === "draft" ||
        r.status.toLowerCase() === "re_draft"
    ).length,
  };

  return (
    <div className="space-y-6">
      <AIBackground
        variant="neural"
        intensity="high"
        className="rounded-lg mb-6 p-8 relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <AIGradientText>Requirements</AIGradientText> Engine
              </h1>
              <p className="text-muted-foreground mt-1 max-w-3xl">
                Create and validate product requirements with AI assistance.
                Create detailed specs that feed into AI-powered validation,
                architecture, and development.
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity w-full md:w-auto"
            >
              <Link to="/dashboard/requirements/new">
                <Plus size={16} className="mr-2" />
                New Requirement
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="shadow-sm border-t-4 border-t-primary/40 bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800 dark:to-slate-800/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Requirements
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                  </div>
                  <div className="p-2.5 bg-primary/10 rounded-full">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-green-500/40 bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800 dark:to-slate-800/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <h3 className="text-2xl font-bold mt-1">
                      {stats.completed}
                    </h3>
                  </div>
                  <div className="p-2.5 bg-green-500/10 rounded-full">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-blue-500/40 bg-gradient-to-b from-white to-slate-50/70 dark:from-slate-800 dark:to-slate-800/50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Draft & Re-Draft
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stats.draft}</h3>
                  </div>
                  <div className="p-2.5 bg-blue-500/10 rounded-full">
                    <FileEdit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AIBackground>

      <AICard className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Requirements Dashboard</CardTitle>
              <CardDescription>
                View, manage, and analyze your product requirements
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 gap-1 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by project name, ID, company, or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-10">
                  <Filter className="h-4 w-4" />
                  {statusFilter ? `Status: ${statusFilter}` : "Filter Status"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("re_draft")}>
                  Re-Draft
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead className="w-[15%]">ID</TableHead>
                  <TableHead className="w-[25%]">Project</TableHead>
                  <TableHead className="w-[15%]">Company</TableHead>
                  <TableHead className="w-[15%]">Industry</TableHead>
                  <TableHead className="w-[15%]">Created</TableHead>
                  <TableHead className="w-[10%]">Status</TableHead>
                  <TableHead className="text-right w-[5%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                        <p>Loading requirements...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-red-500"
                    >
                      <p>Error loading requirements. Please try again later.</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRequirements.length > 0 ? (
                  filteredRequirements.map((req) => (
                    <TableRow
                      key={req.id}
                      className="group hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="font-medium">
                        {req.req_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          to={`/dashboard/requirements/${req.id}`}
                          className="text-foreground hover:underline hover:text-primary transition-colors"
                        >
                          {req.project_name}
                        </Link>
                      </TableCell>
                      <TableCell>{req.company_name || "-"}</TableCell>
                      <TableCell>
                        {capitalizeWords(req.industry_type)}
                      </TableCell>
                      <TableCell>
                        {new Date(req.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 data-[state=open]:bg-muted opacity-70 group-hover:opacity-100"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/dashboard/requirements/${req.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `/dashboard/requirements/edit/${req.id}`
                                )
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {req.status === "Completed" && (
                              <DropdownMenuItem
                                onClick={() => navigateToMarketSense(req.id)}
                              >
                                <Sparkles className="h-4 w-4 mr-2" />
                                MarketSense
                              </DropdownMenuItem>
                            )}
                            {(req.status === "Draft" ||
                              req.status === "Re_Draft") && (
                              <DropdownMenuItem
                                onClick={() => triggerAnalysis(req.id)}
                              >
                                <BrainCircuit className="h-4 w-4 mr-2" />
                                Analyze
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground/60" />
                        <p>
                          No requirements found. Try a different search or
                          create a new requirement.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="mt-2"
                        >
                          <Link to="/dashboard/requirements/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Requirement
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </AICard>
    </div>
  );
};

export default RequirementsList;
