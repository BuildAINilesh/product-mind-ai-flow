import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  FileText,
  BarChart3,
  Brain,
  Network,
  CircuitBoard,
} from "lucide-react";

const DashboardLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [path, isMobile]);

  // Generate title based on current path
  const getTitle = () => {
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/requirements")) return "Requirements";
    if (path.includes("/market-sense")) return "MarketSense";
    if (path.includes("/validator")) return "Requirement Validator";
    if (path.includes("/ai-cases")) return "AI Case Generator";
    if (path.includes("/test-gen")) return "Test Generator";
    if (path.includes("/signoff")) return "SmartSignoff";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/support")) return "Help & Support";

    return "Dashboard";
  };

  // Map path segments to label and icon
  const breadcrumbMap: Record<string, { label: string; icon: React.ReactNode; href: string }> = {
    dashboard: { label: "Dashboard", icon: <Home size={16} />, href: "/dashboard" },
    requirements: { label: "Requirements", icon: <FileText size={16} />, href: "/dashboard/requirements" },
    "market-sense": { label: "MarketSense AI", icon: <BarChart3 size={16} />, href: "/dashboard/market-sense" },
    validator: { label: "AI Validator", icon: <Brain size={16} />, href: "/dashboard/validator" },
    "ai-cases": { label: "AI Case Generator", icon: <Network size={16} />, href: "/dashboard/ai-cases" },
    signoff: { label: "AI Signoff", icon: <CircuitBoard size={16} />, href: "/dashboard/signoff" },
  };

  // Build breadcrumbs from path
  const pathSegments = path.replace(/^\//, "").split("/").filter(Boolean);
  const breadcrumbs = pathSegments.reduce<{ label: string; icon: React.ReactNode; href: string }[]>((acc, segment, idx) => {
    const key = segment;
    if (breadcrumbMap[key]) {
      acc.push({
        ...breadcrumbMap[key],
        href: "/" + pathSegments.slice(0, idx + 1).join("/"),
      });
    } else if (acc.length > 0) {
      // For dynamic/unknown segments, just show as text
      acc.push({ label: segment.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), icon: null, href: "" });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar 
        isOpen={isMobile ? sidebarOpen : true} 
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <DashboardHeader 
          title={getTitle()} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        {/* Breadcrumbs */}
        <div className="px-3 md:px-6 pt-2 pb-1">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {crumb.icon && <span className="mr-1 align-middle inline-flex">{crumb.icon}</span>}
                    {idx < breadcrumbs.length - 1 && crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <main className="flex-1 p-3 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
