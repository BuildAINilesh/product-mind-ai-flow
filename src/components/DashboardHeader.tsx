
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CircleUser,
  Search,
  Plus,
  Menu
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const DashboardHeader = ({ title, onMenuClick }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement search functionality
  };
  
  return (
    <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-3 md:px-6">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu size={20} />
          </Button>
        )}
        <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSearch} className="hidden md:flex relative">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9"
          />
          <Search 
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
        </form>
        
        <Button asChild size="sm" className="hidden sm:flex">
          <Link to="/dashboard/requirements/new">
            <Plus size={16} className="mr-2" />
            New Requirement
          </Link>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              <span className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col w-full">
                <span className="font-medium text-sm">New requirement needs review</span>
                <span className="text-xs md:text-sm text-muted-foreground">E-commerce checkout flow - 2 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col w-full">
                <span className="font-medium text-sm">Test cases generated</span>
                <span className="text-xs md:text-sm text-muted-foreground">Mobile app login - 5 hours ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Link to="/dashboard/notifications" className="text-primary text-sm">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <CircleUser size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
