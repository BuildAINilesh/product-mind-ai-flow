
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import RequirementsList from "./pages/requirements/RequirementsList";
import NewRequirement from "./pages/requirements/NewRequirement";
import MarketSense from "./pages/dashboard/MarketSense";
import RequirementValidator from "./pages/dashboard/RequirementValidator";
import TestGen from "./pages/dashboard/TestGen";
import BugShield from "./pages/dashboard/BugShield";
import SmartSignoff from "./pages/dashboard/SmartSignoff";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="requirements" element={<RequirementsList />} />
              <Route path="requirements/new" element={<NewRequirement />} />
              <Route path="market-sense" element={<MarketSense />} />
              <Route path="validator" element={<RequirementValidator />} />
              <Route path="test-gen" element={<TestGen />} />
              <Route path="bug-shield" element={<BugShield />} />
              <Route path="signoff" element={<SmartSignoff />} />
            </Route>
            
            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
