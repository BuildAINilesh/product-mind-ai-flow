
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <header className={cn(
      "w-full py-4 px-4 md:px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      transparent ? "bg-transparent" : "bg-background/95 backdrop-blur-sm shadow-sm"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-xl text-foreground">ProductMind</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-foreground/90 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/features" className="text-foreground/90 hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-foreground/90 hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-foreground/90 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
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
            <Link to="/pricing" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            <Link to="/about" className="p-2 hover:bg-accent rounded-md" onClick={() => setIsOpen(false)}>
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
