import React from "react";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Tag, CalendarDays, Hash, Info, CheckCircle, AlertCircle } from "lucide-react";

interface RequirementDetailsProps {
  requirement: {
    id: string;
    projectName: string;
    industry: string;
    created: string;
    description: string;
    req_id?: string;
    status?: string;
  };
}

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  InProgress: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
  Draft: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  Completed: <CheckCircle className="h-4 w-4 mr-1" />,
  InProgress: <Info className="h-4 w-4 mr-1" />,
  Failed: <AlertCircle className="h-4 w-4 mr-1" />,
  Draft: <Info className="h-4 w-4 mr-1" />,
};

const RequirementDetails: React.FC<RequirementDetailsProps> = ({ requirement }) => {
  const status = requirement.status || "Draft";
  return (
    <section className="relative w-full rounded-3xl overflow-hidden mb-10 shadow-2xl animate-fadeIn">
      {/* SaaS hero background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/70 via-purple-400/60 to-pink-300/60 blur-[2px] opacity-80" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />
      <div className="relative z-10 px-8 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Left: Title & Description */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-4 mb-2">
            <Tag className="h-8 w-8 text-white drop-shadow" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Requirement Details</h1>
          </div>
          <p className="text-lg md:text-xl text-white/90 font-medium mb-4 drop-shadow-sm">
            {requirement.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <Badge className="bg-purple-700/90 text-white px-3 py-1 rounded-full font-semibold text-sm shadow flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {requirement.projectName}
            </Badge>
            <Badge className="bg-green-600/90 text-white px-3 py-1 rounded-full font-semibold text-sm shadow flex items-center gap-2">
              <Tag className="h-4 w-4" /> {requirement.industry}
            </Badge>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1 shadow-sm ${statusColors[status] || statusColors.Draft}`}>
              {statusIcons[status] || statusIcons.Draft} {status}
            </span>
          </div>
        </div>
        {/* Right: Meta info */}
        <div className="flex flex-col gap-4 min-w-[220px] bg-white/80 rounded-2xl p-6 shadow-lg backdrop-blur-md border border-white/30">
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-semibold mb-1">
            <Hash className="h-4 w-4 text-blue-400" />
            ID
          </div>
          <div className="text-lg font-mono text-slate-800 mb-2">{requirement.req_id || requirement.id}</div>
          <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-semibold mb-1">
            <CalendarDays className="h-4 w-4 text-orange-400" />
            Created
          </div>
          <span className="flex items-center gap-2 text-slate-800 text-base">
            <CalendarDays className="h-4 w-4 text-orange-400" />
            {requirement.created}
          </span>
        </div>
      </div>
    </section>
  );
};

export default RequirementDetails;
