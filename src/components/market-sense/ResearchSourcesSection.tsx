import { useState } from "react";
import { ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  legacySources,
}: ResearchSourcesSectionProps) => {
  if (!researchSources.length && !legacySources) {
    return null;
  }

  // Count the number of sources
  const sourceCount =
    researchSources.length ||
    (legacySources
      ? legacySources.split(/[\n\r]/).filter((s) => s.trim().length > 0).length
      : 0);

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        Sources {sourceCount > 0 ? `(${sourceCount})` : ""}
      </h3>

      <div className="border rounded-lg bg-background p-4">
        {/* Always visible content */}
        {researchSources.length > 0 ? (
          <div className="space-y-3">
            {researchSources.map((source, index) => (
              <div
                key={source.id || index}
                className="flex items-start py-2 border-b border-gray-100 last:border-0"
              >
                <Link2 className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-primary" />
                <div>
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
                  {source.snippet && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {source.snippet}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : legacySources ? (
          <div className="space-y-3">
            {legacySources
              .split(/[\n\r]/)
              .filter((source) => source.trim().length > 0)
              .map((source, index) => {
                // Extract URL if present in the source text
                const urlMatch = source.match(/https?:\/\/[^\s]+/);
                const url = urlMatch ? urlMatch[0] : "";

                // Clean up the source text to get just the title
                let title = source.replace(/https?:\/\/[^\s]+/, "").trim();
                // Remove list markers if any
                title = title.replace(/^[•\-\d.]+\s*/, "");

                return (
                  <div
                    key={index}
                    className="flex items-start py-2 border-b border-gray-100 last:border-0"
                  >
                    <Link2 className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-primary" />
                    <div>
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
                  </div>
                );
              })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResearchSourcesSection;
