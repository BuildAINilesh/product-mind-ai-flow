
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  FileText, 
  BarChart3, 
  CheckSquare, 
  AlertTriangle, 
  FileCheck, 
  ClipboardList, 
  Settings, 
  HelpCircle,
  Home
} from "lucide-react";

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
};

const NavItem = ({ icon, label, href, isActive }: NavItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
      isActive 
        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    <div className="w-6 h-6 flex items-center justify-center">
      {icon}
    </div>
    <span>{label}</span>
  </Link>
);

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { 
      icon: <Home size={18} />, 
      label: "Dashboard", 
      href: "/dashboard" 
    },
    { 
      icon: <FileText size={18} />, 
      label: "Requirements", 
      href: "/dashboard/requirements" 
    },
    { 
      icon: <BarChart3 size={18} />, 
      label: "MarketSense", 
      href: "/dashboard/market-sense" 
    },
    { 
      icon: <CheckSquare size={18} />, 
      label: "Requirement Validator", 
      href: "/dashboard/validator" 
    },
    { 
      icon: <ClipboardList size={18} />, 
      label: "TestGen", 
      href: "/dashboard/test-gen" 
    },
    { 
      icon: <AlertTriangle size={18} />, 
      label: "BugShield", 
      href: "/dashboard/bug-shield" 
    },
    { 
      icon: <FileCheck size={18} />, 
      label: "SmartSignoff", 
      href: "/dashboard/signoff" 
    },
  ];
  
  const bottomNavItems = [
    { 
      icon: <Settings size={18} />, 
      label: "Settings", 
      href: "/dashboard/settings" 
    },
    { 
      icon: <HelpCircle size={18} />, 
      label: "Help & Support", 
      href: "/dashboard/support" 
    },
  ];
  
  return (
    <aside className="bg-sidebar w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="p-4 flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-secondary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="ml-2 font-bold text-xl text-sidebar-foreground">ProductMind</span>
      </div>
      
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={currentPath === item.href}
            />
          ))}
        </nav>
      </div>
      
      <div className="px-3 py-4 border-t border-sidebar-border">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={currentPath === item.href}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
