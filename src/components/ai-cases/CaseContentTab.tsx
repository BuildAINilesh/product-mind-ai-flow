import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Loader from "@/components/shared/Loader";
import StatusBadge from "./StatusBadge";
import CasePendingGeneration from "./CasePendingGeneration";
import CaseItemCard from "./CaseItemCard";
import { LucideIcon, CheckCircle, AlertCircle, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Jira SVG logo
const JiraLogo = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M15.99 0c-.28 0-.55.11-.75.31L.31 15.24a1.06 1.06 0 0 0 0 1.5l7.6 7.6c.42.42 1.09.42 1.5 0l6.58-6.58a.53.53 0 0 1 .75 0l6.58 6.58c.42.42 1.09.42 1.5 0l7.6-7.6a1.06 1.06 0 0 0 0-1.5L16.74.31A1.06 1.06 0 0 0 15.99 0z" fill="#2684FF"/>
      <path d="M15.99 0c-.28 0-.55.11-.75.31L.31 15.24a1.06 1.06 0 0 0 0 1.5l7.6 7.6c.42.42 1.09.42 1.5 0l6.58-6.58a.53.53 0 0 1 .75 0l6.58 6.58c.42.42 1.09.42 1.5 0l7.6-7.6a1.06 1.06 0 0 0 0-1.5L16.74.31A1.06 1.06 0 0 0 15.99 0z" fill="url(#jira-gradient)"/>
      <defs>
        <linearGradient id="jira-gradient" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0052CC"/>
          <stop offset="1" stopColor="#2684FF"/>
        </linearGradient>
      </defs>
    </g>
  </svg>
);

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
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Status pill with icon
  const renderStatusPill = () => {
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold gap-1 shadow-sm">
          <CheckCircle className="h-4 w-4" /> Completed
        </span>
      );
    }
    if (status === "Failed") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold gap-1 shadow-sm">
          <AlertCircle className="h-4 w-4" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold gap-1 shadow-sm">
        {status}
      </span>
    );
  };

  // Quick stats
  const total = items.length;
  const completed = items.filter(i => i.status === "Completed").length;
  const failed = items.filter(i => i.status === "Failed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 font-sans p-4 md:p-8 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Icon className="h-8 w-8 text-blue-500" />
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h2>
          {renderStatusPill()}
        </div>
        {/* Quick stats */}
        <div className="flex gap-4 mb-4">
          <div className="rounded-lg bg-blue-50 px-4 py-2 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-lg font-bold text-blue-700">{total}</span>
            <span className="text-xs text-blue-500">Total</span>
          </div>
          <div className="rounded-lg bg-green-50 px-4 py-2 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-lg font-bold text-green-700">{completed}</span>
            <span className="text-xs text-green-500">Completed</span>
          </div>
          <div className="rounded-lg bg-red-50 px-4 py-2 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-lg font-bold text-red-700">{failed}</span>
            <span className="text-xs text-red-500">Failed</span>
          </div>
        </div>
        {/* Divider */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full mb-6" />
        <div className="rounded-2xl shadow-xl bg-white p-6 mb-6 flex flex-wrap gap-4 items-center justify-between transition-shadow duration-300">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={onGenerate}
              className="rounded-lg px-4 py-2 font-semibold shadow-sm transition hover:bg-blue-50 focus:ring-2 focus:ring-blue-400"
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
            {(type === "userStories" || type === "useCases" || type === "testCases") && (
              <Button
                variant="default"
                disabled={isGenerating}
                className="rounded-lg px-4 py-2 font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition active:scale-95 focus:ring-2 focus:ring-blue-400"
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

                  const payload = {
                    jiraUrl,
                    username: jiraUsername,
                    apiToken: jiraApiToken,
                    projectKey,
                    stories: items,
                  };
                  console.log('Sending to proxy:', payload);
                  let allSuccess = true;
                  let errorMsg = '';
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
                      description: `All ${type} added to Jira.`,
                      variant: 'default',
                    });
                  } else {
                    toast({
                      title: 'Jira Error',
                      description: errorMsg || `Failed to add ${type} to Jira.`,
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <JiraLogo />
                <span>Add to Jira</span>
              </Button>
            )}
          </div>
        </div>
        {/* Sub-section divider */}
        <div className="mb-2 mt-4 text-slate-500 font-semibold text-sm tracking-wide uppercase">{title} List</div>
        <div className="rounded-2xl shadow-lg bg-white p-0 overflow-hidden animate-fadeIn">
          {isDraft ? (
            <CasePendingGeneration 
              icon={Icon} 
              title={title} 
              isGenerating={isGenerating} 
              onGenerate={onGenerate} 
            />
          ) : items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Content</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const isExpanded = expandedRows[item.id];
                    const isLong = item.content.length > 120;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50 transition cursor-pointer group"
                        tabIndex={0}
                        onClick={() => { setModalItem(item); setShowModal(true); }}
                        onKeyDown={e => { if (e.key === 'Enter') { setModalItem(item); setShowModal(true); } }}
                      >
                        <td className="px-4 py-2 text-sm text-slate-700">{index + 1}</td>
                        <td className="px-4 py-2 text-sm text-slate-700 max-w-xs">
                          {isLong && !isExpanded ? (
                            <>
                              {item.content.slice(0, 120)}...{' '}
                              <button
                                className="text-blue-500 underline text-xs ml-1 focus:outline-none"
                                onClick={e => { e.stopPropagation(); setExpandedRows(r => ({ ...r, [item.id]: true })); }}
                              >Show More</button>
                            </>
                          ) : isLong && isExpanded ? (
                            <>
                              {item.content}{' '}
                              <button
                                className="text-blue-500 underline text-xs ml-1 focus:outline-none"
                                onClick={e => { e.stopPropagation(); setExpandedRows(r => ({ ...r, [item.id]: false })); }}
                              >Show Less</button>
                            </>
                          ) : (
                            item.content
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <StatusBadge status={item.status} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{item.status}</TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-700">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-slate-400" />
                                {item.actor || '-'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{item.actor || 'No actor'}</TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <CasePendingGeneration
              icon={Icon}
              title={title}
              isGenerating={isGenerating}
              onGenerate={onGenerate}
            />
          )}
        </div>
        {/* Modal for item details */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg">
            <DialogTitle>Details</DialogTitle>
            {modalItem && (
              <div className="space-y-2 mt-2">
                <div className="font-semibold text-slate-700">Content</div>
                <div className="bg-slate-50 rounded p-2 text-slate-800 whitespace-pre-wrap">{modalItem.content}</div>
                <div className="flex gap-4 mt-2">
                  <div>
                    <div className="text-xs text-slate-500">Status</div>
                    <StatusBadge status={modalItem.status} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Actor</div>
                    <span className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-slate-400" />
                      {modalItem.actor || '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CaseContentTab;
