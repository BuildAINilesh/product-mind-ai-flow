
import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { useLocation } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Generate title based on current path
  const getTitle = () => {
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/requirements")) return "Requirements";
    if (path.includes("/market-sense")) return "MarketSense";
    if (path.includes("/validator")) return "Requirement Validator";
    if (path.includes("/test-gen")) return "TestGen";
    if (path.includes("/bug-shield")) return "BugShield";
    if (path.includes("/signoff")) return "SmartSignoff";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/support")) return "Help & Support";
    
    return "Dashboard";
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader title={getTitle()} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
