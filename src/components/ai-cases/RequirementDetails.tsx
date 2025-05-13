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
    <section className="relative w-full rounded-xl overflow-hidden mb-10 shadow-md bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 border border-slate-200 animate-fadeIn max-w-5xl mx-auto">
      <div className="relative z-10 px-8 py-10 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Left: Title & Description */}
        <div className="flex-1 min-w-[250px]">
          <div className="flex items-center gap-4 mb-2">
            <Tag className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">Requirement Details</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-800 font-medium mb-4">
            {requirement.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold text-sm shadow flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {requirement.projectName}
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm shadow flex items-center gap-2">
              <Tag className="h-4 w-4" /> {requirement.industry}
            </Badge>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1 shadow-sm ${statusColors[status] || statusColors.Draft}`}>
              {statusIcons[status] || statusIcons.Draft} {status}
            </span>
          </div>
        </div>
        {/* Right: Meta info */}
        <div className="flex flex-col gap-4 min-w-[220px] bg-gradient-to-br from-white via-blue-50 to-slate-100 rounded-2xl p-6 shadow border border-blue-100">
          <div className="flex items-center gap-2 text-blue-500 text-xs uppercase font-semibold mb-1">
            <Hash className="h-4 w-4 text-blue-400" />
            ID
          </div>
          <div className="text-lg font-mono text-blue-900 mb-2">{requirement.req_id || requirement.id}</div>
          <div className="flex items-center gap-2 text-blue-500 text-xs uppercase font-semibold mb-1">
            <CalendarDays className="h-4 w-4 text-orange-400" />
            Created
          </div>
          <span className="flex items-center gap-2 text-blue-900 text-base">
            <CalendarDays className="h-4 w-4 text-orange-400" />
            {requirement.created}
          </span>
        </div>
      </div>
    </section>
  );
};

export default RequirementDetails;
