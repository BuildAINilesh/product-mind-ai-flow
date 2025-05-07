
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface Stakeholder {
  id: number;
  name: string;
  role: string;
  approved: boolean;
  avatar: string;
}

interface StakeholderListProps {
  stakeholders: Stakeholder[];
}

export const StakeholderList = ({ stakeholders }: StakeholderListProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Stakeholder Approval</h3>
      <div className="space-y-3">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={stakeholder.avatar} />
                <AvatarFallback>
                  {stakeholder.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{stakeholder.name}</p>
                <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
              </div>
            </div>
            <div>
              {stakeholder.approved ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                  <Check className="mr-1 h-3 w-3" /> Approved
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Pending
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
