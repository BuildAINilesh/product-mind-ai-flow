
import { CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentMetadataCardProps {
  updatedAt: string | undefined;
  requirementId: string | null;
}

export const DocumentMetadataCard = ({
  updatedAt,
  requirementId
}: DocumentMetadataCardProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-1" />
            Last updated: {updatedAt && new Date(updatedAt).toLocaleString()}
          </div>
          <div>
            Document ID: <span className="font-mono">{requirementId || "Not assigned"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
