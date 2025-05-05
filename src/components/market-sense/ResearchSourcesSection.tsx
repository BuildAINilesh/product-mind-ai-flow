import { useRef, useState } from "react";
import { ExternalLink, ChevronDown, Link2 } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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

// Enhanced Accordion components
const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) => (
  <AccordionPrimitive.Item
    className={cn(
      "overflow-hidden border-b border-border rounded-md mb-2",
      "shadow-sm transition-all duration-200 ease-in-out",
      "data-[state=open]:bg-muted/50",
      className
    )}
    {...props}
  />
);

const AccordionTrigger = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "flex flex-1 items-center justify-between p-3 font-medium transition-all",
        "hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      <span className="text-start">{children}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    className={cn(
      "overflow-hidden transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="px-4 pb-5 pt-1">{children}</div>
  </AccordionPrimitive.Content>
);

export const ResearchSourcesSection = ({
  researchSources,
  legacySources,
}: ResearchSourcesSectionProps) => {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const accordionRef = useRef(null);

  if (!researchSources.length && !legacySources) {
    return null;
  }

  const handleValueChange = (value: string) => {
    setOpenItem(value === openItem ? null : value);
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <ExternalLink className="h-5 w-5 text-primary" />
        Sources
      </h3>
      <div className="p-4 border rounded-lg bg-background">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={openItem || undefined}
          onValueChange={handleValueChange}
          ref={accordionRef}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              View Research Sources{" "}
              {researchSources.length ? `(${researchSources.length})` : ""}
            </AccordionTrigger>
            <AccordionContent>
              {researchSources.length > 0 ? (
                <div className="space-y-3 mt-2">
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
                <div className="space-y-3 mt-2">
                  {legacySources
                    .split(/[\n\r]/)
                    .filter((source) => source.trim().length > 0)
                    .map((source, index) => {
                      // Extract URL if present in the source text
                      const urlMatch = source.match(/https?:\/\/[^\s]+/);
                      const url = urlMatch ? urlMatch[0] : "";

                      // Clean up the source text to get just the title
                      let title = source
                        .replace(/https?:\/\/[^\s]+/, "")
                        .trim();
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ResearchSourcesSection;
