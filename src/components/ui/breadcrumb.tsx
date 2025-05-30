import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
}

interface BreadcrumbItem {
  text: string;
  path: string;
  isLast: boolean;
}

interface NavigationHistoryItem {
  path: string;
  text: string;
}

interface ParentFlow {
  parent: string;
  children: string[];
  childLabels: Record<string, string>;
  displayName: string;
  fullPath: string[];
  alternateFullPath?: string[];
  marketSensePath?: string[];
  validatorPath?: string[];
  aiCasesPath?: string[];
  newRequirementPath?: string[];
  requirementsPath?: string[];
}

interface ChildFlow {
  parent: string;
  displayName: string;
  group?: string;
  children?: string[];
  childLabels?: Record<string, string>;
  fullPath: string[];
  alternateFullPath?: string[];
  marketSensePath?: string[];
  validatorPath?: string[];
  aiCasesPath?: string[];
  newRequirementPath?: string[];
  requirementsPath?: string[];
}

type NavigationFlow = ParentFlow | ChildFlow;

// Define the navigation flow relationships
const navigationFlows: Record<string, NavigationFlow> = {
  requirements: {
    parent: "dashboard",
    children: ["new-requirement", "analysis"],
    childLabels: {
      "new-requirement": "New Requirement",
      "analysis": "Analysis"
    },
    displayName: "Requirements",
    fullPath: ["dashboard", "requirements"]
  },
  "new-requirement": {
    parent: "requirements",
    children: ["analysis", "signoff"],
    childLabels: {
      "analysis": "Analysis",
      "signoff": "Smart Signoff"
    },
    displayName: "New Requirement",
    fullPath: ["dashboard", "requirements", "new-requirement"]
  },
  "analysis": {
    parent: "new-requirement",
    children: ["market-sense", "validator", "ai-cases", "signoff"],
    childLabels: {
      "market-sense": "Market Sense",
      "validator": "AI Validator",
      "ai-cases": "AI Cases",
      "signoff": "Smart Signoff"
    },
    displayName: "Analysis",
    fullPath: ["dashboard", "requirements", "new-requirement", "analysis"]
  },
  "market-sense": {
    parent: "dashboard",
    children: ["validator", "signoff"],
    childLabels: {
      "validator": "AI Validator",
      "signoff": "Smart Signoff"
    },
    displayName: "Market Sense",
    fullPath: ["dashboard", "market-sense"],
    alternateFullPath: ["dashboard", "requirements", "new-requirement", "analysis", "market-sense"],
    requirementsPath: ["dashboard", "requirements", "market-sense"]
  },
  validator: {
    parent: "dashboard",
    children: ["ai-cases", "signoff"],
    childLabels: {
      "ai-cases": "AI Cases",
      "signoff": "Smart Signoff"
    },
    displayName: "AI Validator",
    fullPath: ["dashboard", "validator"],
    alternateFullPath: ["dashboard", "requirements", "new-requirement", "analysis", "market-sense", "validator"],
    marketSensePath: ["dashboard", "market-sense", "validator"],
    requirementsPath: ["dashboard", "requirements", "validator"]
  },
  "ai-cases": {
    parent: "dashboard",
    children: ["signoff"],
    childLabels: {
      "signoff": "Smart Signoff"
    },
    displayName: "AI Cases",
    fullPath: ["dashboard", "ai-cases"],
    alternateFullPath: ["dashboard", "requirements", "new-requirement", "analysis", "market-sense", "validator", "ai-cases"],
    marketSensePath: ["dashboard", "market-sense", "validator", "ai-cases"],
    validatorPath: ["dashboard", "validator", "ai-cases"],
    requirementsPath: ["dashboard", "requirements", "ai-cases"]
  },
  signoff: {
    parent: "dashboard",
    displayName: "Smart Signoff",
    group: "analysis",
    fullPath: ["dashboard", "signoff"],
    alternateFullPath: ["dashboard", "requirements", "new-requirement", "analysis", "market-sense", "validator", "ai-cases", "signoff"],
    marketSensePath: ["dashboard", "market-sense", "validator", "ai-cases", "signoff"],
    validatorPath: ["dashboard", "validator", "ai-cases", "signoff"],
    aiCasesPath: ["dashboard", "ai-cases", "signoff"],
    newRequirementPath: ["dashboard", "requirements", "new-requirement", "signoff"],
    requirementsPath: ["dashboard", "requirements", "signoff"]
  }
};

const isChildFlow = (flow: NavigationFlow | undefined): flow is ChildFlow => {
  return flow !== undefined && 'group' in flow;
};

const isParentFlow = (flow: NavigationFlow | undefined): flow is ParentFlow => {
  return flow !== undefined && 'children' in flow;
};

const formatSegmentText = (segment: string): string => {
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const NAVIGATION_HISTORY_KEY = 'navigationHistory';
const WORKFLOW_CONTEXT_KEY = 'workflowContext';

export const Breadcrumb = ({ className }: BreadcrumbProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const pathSegments = location.pathname.split("/").filter(Boolean);

  useEffect(() => {
    try {
      const storedHistory = sessionStorage.getItem(NAVIGATION_HISTORY_KEY);
      const currentHistory: NavigationHistoryItem[] = storedHistory ? JSON.parse(storedHistory) : [];
      
      const currentSegment = pathSegments[pathSegments.length - 1];
      const flowInfo = navigationFlows[currentSegment];
      const currentPath = location.pathname;
      const requirementId = searchParams.get('requirementId');
      
      let newHistory: NavigationHistoryItem[] = [];

      if (currentPath === '/dashboard') {
        newHistory = [{
          path: '/dashboard',
          text: 'Dashboard'
        }];
      } else {
        // Start with Dashboard
        newHistory = [{
          path: '/dashboard',
          text: 'Dashboard'
        }];

        // Always add Requirements as the second level
        newHistory.push({
          path: '/dashboard/requirements',
          text: 'Requirements'
        });

        // Add the current section based on the workflow
        if (currentSegment === 'market-sense') {
          newHistory.push({
            path: '/dashboard/market-sense' + location.search,
            text: 'Market Sense'
          });
        } else if (currentSegment === 'validator') {
          // For validator, include market-sense in the path
          newHistory.push({
            path: '/dashboard/market-sense' + location.search,
            text: 'Market Sense'
          });
          newHistory.push({
            path: '/dashboard/validator' + location.search,
            text: 'AI Validator'
          });
        } else if (currentSegment === 'ai-cases') {
          // For AI Cases, include the full path
          newHistory.push({
            path: '/dashboard/market-sense' + location.search,
            text: 'Market Sense'
          });
          newHistory.push({
            path: '/dashboard/validator' + location.search,
            text: 'AI Validator'
          });
          newHistory.push({
            path: '/dashboard/ai-cases' + location.search,
            text: 'AI Cases'
          });
        } else if (currentSegment === 'signoff') {
          // For Signoff, include the full path
          newHistory.push({
            path: '/dashboard/market-sense' + location.search,
            text: 'Market Sense'
          });
          newHistory.push({
            path: '/dashboard/validator' + location.search,
            text: 'AI Validator'
          });
          newHistory.push({
            path: '/dashboard/ai-cases' + location.search,
            text: 'AI Cases'
          });
          newHistory.push({
            path: currentPath + location.search,
            text: 'Smart Signoff'
          });
        }

        // If we have a requirement ID, add it to all paths except dashboard
        if (requirementId) {
          newHistory = newHistory.map((item, index) => {
            if (index === 0) return item; // Skip dashboard
            return {
              ...item,
              path: item.path.includes('?') ? item.path : `${item.path}?requirementId=${requirementId}`
            };
          });
        }
      }

      sessionStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(newHistory));
      setNavigationHistory(newHistory);
    } catch (error) {
      console.error('Error managing navigation history:', error);
    }
  }, [location.pathname, location.search]);

  // Don't show breadcrumb on dashboard
  if (pathSegments.length === 1 && pathSegments[0] === "dashboard") {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto scrollbar-none",
        "min-h-[32px] px-2 py-1 bg-background/95 backdrop-blur-sm rounded-md",
        "border border-border/50 shadow-sm",
        className
      )}
    >
      <Link 
        to="/dashboard"
        className="flex items-center hover:text-foreground transition-colors min-w-fit"
      >
        <Home size={16} className="shrink-0" />
        <span className="sr-only">Home</span>
      </Link>
      
      {navigationHistory.slice(1).map((item, index) => (
        <React.Fragment key={item.path}>
          <ChevronRight size={14} className="shrink-0 text-muted-foreground/50" />
          <div className="flex items-center min-w-fit">
            {index === navigationHistory.length - 2 ? (
              <span className="text-foreground font-medium">{item.text}</span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors"
              >
                {item.text}
              </Link>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};
