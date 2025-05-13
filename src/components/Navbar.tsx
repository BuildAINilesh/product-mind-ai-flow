import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { AIGradientText } from './ui/ai-elements';
import { useAuth } from '@/hooks/use-auth';

const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <header className={cn(
      "w-full py-4 px-4 md:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      transparent ? "bg-transparent" : "bg-background/95 backdrop-blur-sm border-b border-border/50"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
            <span className="text-white font-bold text-lg relative z-10">P</span>
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_70%,_rgba(255,255,255,0.2),_transparent_70%)]"></div>
          </div>
          <span className="font-bold text-xl">Product<AIGradientText>Mind</AIGradientText></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground/90 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-foreground/90 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/about" className="text-foreground/90 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Button variant="ghost" asChild>
              <Link to="/logout">Sign Out</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border animate-fade-in">
          <div className="container mx-auto p-4 flex flex-col space-y-4">
            <Link to="/" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
              Home
            </Link>
            <Link to="/features" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link to="/about" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              {user ? (
                <Button variant="outline" asChild className="w-full">
                  <Link to="/logout" onClick={() => setIsOpen(false)}>Sign Out</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                    <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
