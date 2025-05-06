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
  Home,
  Brain,
  Layers,
  Network,
  CircuitBoard,
} from "lucide-react";
import { AIGradientText } from "./ui/ai-elements";

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
      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group overflow-hidden",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-0 before:opacity-20 before:bg-[radial-gradient(circle_at_center,_var(--sidebar-ring)_0%,_transparent_70%)]"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    <div
      className={cn(
        "w-6 h-6 flex items-center justify-center transition-all",
        isActive && "text-sidebar-primary"
      )}
    >
      {icon}
    </div>
    <span>{label}</span>
    {isActive && (
      <span className="absolute inset-y-0 left-0 w-0.5 bg-sidebar-primary" />
    )}
  </Link>
);

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      icon: <Home size={18} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <FileText size={18} />,
      label: "Requirements",
      href: "/dashboard/requirements",
    },
    {
      icon: <BarChart3 size={18} />,
      label: "MarketSense AI",
      href: "/dashboard/market-sense",
    },
    {
      icon: <Brain size={18} />,
      label: "AI Validator",
      href: "/dashboard/validator",
    },
    {
      icon: <Network size={18} />,
      label: "ForgeFlow AI",
      href: "/dashboard/forgeflow",
    },
    {
      icon: <Layers size={18} />,
      label: "BugShield ML",
      href: "/dashboard/bug-shield",
    },
    {
      icon: <CircuitBoard size={18} />,
      label: "AI Signoff",
      href: "/dashboard/signoff",
    },
  ];

  const bottomNavItems = [
    {
      icon: <Settings size={18} />,
      label: "Settings",
      href: "/dashboard/settings",
    },
    {
      icon: <HelpCircle size={18} />,
      label: "Help & Support",
      href: "/dashboard/support",
    },
  ];

  return (
    <aside className="bg-sidebar w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,_rgba(29,78,216,0.15),_transparent_80%)]"></div>
        <div className="relative p-4 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
            <span className="text-white font-bold text-lg relative z-10">
              P
            </span>
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_70%_70%,_rgba(255,255,255,0.2),_transparent_70%)]"></div>
          </div>
          <span className="ml-2 font-bold text-xl text-sidebar-foreground">
            Product<AIGradientText>Mind</AIGradientText>
          </span>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={
                item.href === "/dashboard"
                  ? currentPath === item.href
                  : currentPath.startsWith(item.href)
              }
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
