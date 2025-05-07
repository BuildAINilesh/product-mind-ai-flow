import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  BarChartBig,
  Settings,
  HelpCircle,
  BrainCircuit,
  Menu,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Requirements', href: '/dashboard/requirements', icon: ListChecks },
  { name: 'MarketSense', href: '/dashboard/market-sense', icon: BarChartBig },
  { name: 'Requirement Validator', href: '/dashboard/validator', icon: BrainCircuit },
  { name: 'AI Case Generator', href: '/dashboard/ai-cases', icon: BrainCircuit },
  { name: 'Test Generator', href: '/dashboard/test-gen', icon: BrainCircuit },
  { name: 'SmartSignoff', href: '/dashboard/signoff', icon: ListChecks },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/support', icon: HelpCircle },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ isOpen, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-lg font-bold">ForgeFlow</span>
        </Link>
      </div>
      <div className="flex-grow p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center space-x-3 p-3 rounded-md font-medium transition-colors hover:bg-muted ${location.pathname === item.href ? 'bg-muted' : ''}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ForgeFlow. All rights reserved.
        </p>
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <aside className="fixed left-0 top-0 z-20 h-full w-64 flex-col border-r bg-background">
        {renderSidebarContent()}
      </aside>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onToggle}>
      <SheetTrigger asChild>
        <Menu className="md:hidden absolute left-4 top-4" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>ForgeFlow</SheetTitle>
        </SheetHeader>
        {renderSidebarContent()}
      </SheetContent>
    </Sheet>
  );
};

export default DashboardSidebar;
