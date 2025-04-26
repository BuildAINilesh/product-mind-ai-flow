import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface AIBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "neural" | "data-flow" | "grid";
  intensity?: "low" | "medium" | "high";
  children: React.ReactNode;
}

export function AIBackground({
  variant = "neural",
  intensity = "medium",
  className,
  children,
  ...props
}: AIBackgroundProps) {
  const intensityClasses = {
    low: "opacity-10",
    medium: "opacity-20",
    high: "opacity-30",
  };

  const variantClasses = {
    neural: "neural-bg",
    "data-flow": "data-flow",
    grid: "ai-grid",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AICardProps extends HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

export function AICard({
  gradient = true,
  hover = true,
  className,
  children,
  ...props
}: AICardProps) {
  return (
    <div
      className={cn(
        "ai-card overflow-hidden",
        gradient && "bg-gradient-to-br from-card to-accent/10",
        hover && "card-hover glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface NeuralNodeProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

export function NeuralNode({
  active = false,
  size = "md",
  className,
  ...props
}: NeuralNodeProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-primary/30 transition-all duration-300",
        active && "bg-primary shadow-glow",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

interface AIGradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "neural";
}

export function AIGradientText({
  variant = "primary",
  className,
  children,
  ...props
}: AIGradientTextProps) {
  const variantClasses = {
    primary: "from-primary to-secondary",
    secondary: "from-secondary to-primary",
    neural: "from-[#4570EA] via-[#38CFEB] to-[#7D60F5]",
  };

  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

interface DataFlowProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  speed?: "slow" | "medium" | "fast";
}

export function DataFlow({
  direction = "horizontal",
  speed = "medium",
  className,
  children,
  ...props
}: DataFlowProps) {
  const directionClasses = {
    horizontal: "data-flow",
    vertical: "data-flow-vertical",
  };

  const speedClasses = {
    slow: "animate-[dataFlow_8s_infinite_linear]",
    medium: "animate-[dataFlow_5s_infinite_linear]",
    fast: "animate-[dataFlow_3s_infinite_linear]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        directionClasses[direction],
        speedClasses[speed],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface NeuralNetworkProps extends HTMLAttributes<HTMLDivElement> {
  nodes?: number;
  layers?: number;
  active?: number;
}

export function NeuralNetwork({
  nodes = 4,
  layers = 3,
  active = -1,
  className,
  ...props
}: NeuralNetworkProps) {
  return (
    <div 
      className={cn("flex items-center justify-center gap-6", className)}
      {...props}
    >
      {Array.from({ length: layers }).map((_, layerIndex) => (
        <div 
          key={`layer-${layerIndex}`} 
          className="flex flex-col gap-3"
        >
          {Array.from({ length: nodes }).map((_, nodeIndex) => {
            const isActive = active === nodeIndex || active === -1;
            return (
              <NeuralNode 
                key={`node-${layerIndex}-${nodeIndex}`} 
                active={isActive}
                className="transition-all duration-700"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface AIBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "processing" | "analyzing" | "complete" | "neural";
}

export function AIBadge({
  variant = "neural",
  className,
  children,
  ...props
}: AIBadgeProps) {
  const variantClasses = {
    processing: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    analyzing: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    complete: "bg-green-500/10 text-green-500 border-green-500/30",
    neural: "bg-primary/10 text-primary border-primary/30",
  };

  return (
    <div
      className={cn(
        "px-2.5 py-0.5 text-xs font-medium rounded-full border",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
