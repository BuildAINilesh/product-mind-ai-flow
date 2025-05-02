
import React from 'react';

interface AnalysisSectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export const AnalysisSectionHeader = ({ 
  icon, 
  title, 
  description 
}: AnalysisSectionHeaderProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground ml-7">{description}</p>}
    </div>
  );
};
