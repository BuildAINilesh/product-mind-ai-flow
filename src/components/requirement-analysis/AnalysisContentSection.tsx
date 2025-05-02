
import { AnalysisSectionHeader } from "./AnalysisSectionHeader";

interface AnalysisContentSectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  content: string | null;
  fallback?: string;
}

export const AnalysisContentSection = ({
  icon,
  title,
  description,
  content,
  fallback = "Not available yet"
}: AnalysisContentSectionProps) => {
  const renderContent = () => {
    if (!content) return <p className="text-muted-foreground">{fallback}</p>;
    return <div className="whitespace-pre-line">{content}</div>;
  };

  return (
    <section>
      <AnalysisSectionHeader 
        icon={icon}
        title={title}
        description={description}
      />
      <div className="bg-muted/30 p-4 rounded-md">
        {renderContent()}
      </div>
    </section>
  );
};
