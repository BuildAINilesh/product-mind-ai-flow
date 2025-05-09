import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loader from "@/components/shared/Loader";
import StatusBadge from "./StatusBadge";
import CasePendingGeneration from "./CasePendingGeneration";
import CaseItemCard from "./CaseItemCard";
import { LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaseContentTabProps {
  title: string;
  icon: LucideIcon;
  status: string;
  items: Array<{ id: string; content: string; status: string; actor?: string }>;
  type: "userStories" | "useCases" | "testCases";
  isGenerating: boolean;
  onGenerate: () => void;
}

const CaseContentTab: React.FC<CaseContentTabProps> = ({
  title,
  icon: Icon,
  status,
  items,
  type,
  isGenerating,
  onGenerate,
}) => {
  const isDraft = status === "Draft";
  const isGeneratingStatus = isGenerating;
  const { toast } = useToast();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center">
          {/* Only show status badge for useCases and testCases at the header level */}
          {type !== "userStories" && <StatusBadge status={status} />}
          <Button
            variant="outline"
            disabled={isGenerating}
            onClick={onGenerate}
            className="ml-3 flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <Loader size="small" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>
                  {status === "Draft" || status === "Failed"
                    ? "Generate"
                    : "Regenerate"}
                </span>
              </>
            )}
          </Button>
          {/* Add to Jira button for userStories only */}
          {type === "userStories" && (
            <Button
              variant="default"
              disabled={isGenerating}
              className="ml-3 flex items-center space-x-2"
              onClick={async () => {
                const jiraUrl = localStorage.getItem('jiraUrl');
                const jiraUsername = localStorage.getItem('jiraUsername');
                const jiraApiToken = localStorage.getItem('jiraApiToken');

                if (!jiraUrl || !jiraUsername || !jiraApiToken) {
                  toast({
                    title: 'Jira settings missing',
                    description: 'Please set your Jira settings in the Settings page.',
                    variant: 'destructive',
                  });
                  return;
                }

                const projectKey = window.prompt('Enter your Jira Project Key (e.g. PROJ):');
                if (!projectKey) {
                  toast({
                    title: 'Jira Project Key required',
                    description: 'You must enter a Jira Project Key to create issues.',
                    variant: 'destructive',
                  });
                  return;
                }

                let allSuccess = true;
                let errorMsg = '';
                const payload = {
                  jiraUrl,
                  username: jiraUsername,
                  apiToken: jiraApiToken,
                  projectKey,
                  stories: items,
                };
                console.log('Sending to proxy:', payload);
                try {
                  const res = await fetch('http://localhost:4000/api/jira', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    allSuccess = false;
                    errorMsg = data.error || res.statusText;
                  }
                } catch (e) {
                  allSuccess = false;
                  errorMsg = e.message || 'Unknown error';
                }

                if (allSuccess) {
                  toast({
                    title: 'Success!',
                    description: 'All user stories added to Jira.',
                    variant: 'default',
                  });
                } else {
                  toast({
                    title: 'Jira Error',
                    description: errorMsg || 'Failed to add user stories to Jira.',
                    variant: 'destructive',
                  });
                }
              }}
            >
              <span>Add to Jira</span>
            </Button>
          )}
        </div>
      </div>

      {isDraft ? (
        <CasePendingGeneration 
          icon={Icon} 
          title={title} 
          isGenerating={isGenerating} 
          onGenerate={onGenerate} 
        />
      ) : items.length > 0 ? (
        items.map((item, index) => (
          <CaseItemCard
            key={item.id}
            item={item}
            index={index}
            type={type}
          />
        ))
      ) : (
        <CasePendingGeneration
          icon={Icon}
          title={title}
          isGenerating={isGenerating}
          onGenerate={onGenerate}
        />
      )}
    </>
  );
};

export default CaseContentTab;
