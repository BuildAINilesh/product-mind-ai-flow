
import { DatabaseRequirement, Requirement } from "./types";

// Helper function to format a database requirement to our Requirement interface
export const formatRequirement = (data: DatabaseRequirement): Requirement => {
  return {
    id: data.id,
    projectName: data.projectName || data.project_name || "Unknown Project",
    industry: data.industry || data.industry_type || "Unknown Industry",
    created: data.created || 
      (data.created_at ? new Date(data.created_at).toLocaleDateString() : "Unknown Date"),
    description: data.description || data.document_summary || "No description available",
    req_id: data.req_id,
  };
};
