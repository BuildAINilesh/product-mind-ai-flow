
import { ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type ResearchSource = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  requirement_id: string;
  snippet?: string | null;
  status?: string | null;
};

interface ResearchSourcesSectionProps {
  researchSources: ResearchSource[];
  legacySources?: string;
}

export const ResearchSourcesSection = ({ 
  researchSources, 
  legacySources 
}: ResearchSourcesSectionProps) => {
  if (!researchSources.length && !legacySources) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        Sources
      </h3>
      <div className="p-4 border rounded-lg bg-background">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="text-sm font-medium py-2">
              View Research Sources {researchSources.length ? `(${researchSources.length})` : ''}
            </AccordionTrigger>
            <AccordionContent>
              {researchSources.length > 0 ? (
                <div className="space-y-3 mt-2">
                  {researchSources.map((source, index) => (
                    <div key={source.id || index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                      <ExternalLink className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-primary" />
                      {source.url ? (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {source.title || source.url}
                        </a>
                      ) : (
                        <span>{source.title}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : legacySources ? (
                <div className="space-y-3 mt-2">
                  {legacySources.split(/[\n\r]/)
                    .filter(source => source.trim().length > 0)
                    .map((source, index) => {
                      // Extract URL if present in the source text
                      const urlMatch = source.match(/https?:\/\/[^\s]+/);
                      const url = urlMatch ? urlMatch[0] : "";
                      
                      // Clean up the source text to get just the title
                      let title = source.replace(/https?:\/\/[^\s]+/, "").trim();
                      // Remove list markers if any
                      title = title.replace(/^[•\-\d.]+\s*/, "");
                      
                      return (
                        <div key={index} className="flex items-start py-2 border-b border-gray-100 last:border-0">
                          <ExternalLink className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-primary" />
                          {url ? (
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {title || url}
                            </a>
                          ) : (
                            <span>{title || source}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ResearchSourcesSection;
