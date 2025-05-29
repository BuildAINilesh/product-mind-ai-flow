import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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
        <main className="flex-1 p-3 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
