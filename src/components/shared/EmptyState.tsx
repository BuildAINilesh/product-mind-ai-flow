import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      {actionLabel && actionLink && (
        <Button asChild className="mt-2">
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
