import React from "react";
import { cn } from "@/lib/utils";

interface AIBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neural" | "grid";
}

export const AIBackground = React.forwardRef<HTMLDivElement, AIBackgroundProps>(
  ({ className, variant = "neural", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          {
            "bg-gradient-to-br from-background to-background/80":
              variant === "neural",
            "bg-grid-pattern": variant === "grid",
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AIBackground.displayName = "AIBackground";

interface AIGradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const AIGradientText: React.FC<AIGradientTextProps> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
};

interface NeuralNetworkProps {
  nodes?: number;
  layers?: number;
  className?: string;
}

export const NeuralNetwork: React.FC<NeuralNetworkProps> = ({
  nodes = 4,
  layers = 3,
  className,
}) => {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-full h-full">
          {Array.from({ length: layers }).map((_, layerIndex) => (
            <div
              key={layerIndex}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${100 - layerIndex * 20}%`,
                height: `${100 - layerIndex * 20}%`,
              }}
            >
              {Array.from({ length: nodes }).map((_, nodeIndex) => (
                <div
                  key={nodeIndex}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  style={{
                    top: `${(nodeIndex * 100) / (nodes - 1)}%`,
                    left: `${(layerIndex * 100) / (layers - 1)}%`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
