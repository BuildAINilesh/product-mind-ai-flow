import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Roadmap from "./pages/Roadmap";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Career from "./pages/Career";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import RequirementsList from "./pages/requirements/RequirementsList";
import RequirementView from "./pages/requirements/RequirementView";
import NewRequirement from "./pages/requirements/NewRequirement";
import MarketSense from "./pages/dashboard/MarketSense";
import RequirementValidator from "./pages/dashboard/RequirementValidator";
import TestGen from "./pages/dashboard/TestGen";
import BugShield from "./pages/dashboard/BugShield";
import SmartSignoff from "./pages/dashboard/SmartSignoff";
import Profile from "./pages/dashboard/Profile";

// Add imports for Settings and Support
import Settings from "./pages/dashboard/Settings";
import Support from "./pages/dashboard/Support";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Career />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="requirements" element={<RequirementsList />} />
                <Route path="requirements/:id" element={<RequirementView />} />
                <Route path="requirements/new" element={<NewRequirement />} />
                <Route path="market-sense" element={<MarketSense />} />
                <Route path="validator" element={<RequirementValidator />} />
                <Route path="test-gen" element={<TestGen />} />
                <Route path="bug-shield" element={<BugShield />} />
                <Route path="signoff" element={<SmartSignoff />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<Support />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
