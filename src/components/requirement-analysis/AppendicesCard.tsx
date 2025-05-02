
import { Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisSectionHeader } from "./AnalysisSectionHeader";

interface AppendicesCardProps {
  appendices: string[] | null;
}

export const AppendicesCard = ({ appendices }: AppendicesCardProps) => {
  if (!appendices || appendices.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Appendices</CardTitle>
      </CardHeader>
      <CardContent>
        <section>
          <AnalysisSectionHeader
            icon={<Paperclip className="h-5 w-5 text-primary" />}
            title="Referenced Documents"
            description="Links to uploaded docs, chat transcripts, emails, references etc."
          />
          <div className="bg-muted/30 p-4 rounded-md">
            <ul className="list-disc pl-5 space-y-1">
              {appendices.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {item.split('/').pop()}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </CardContent>
    </Card>
  );
};
