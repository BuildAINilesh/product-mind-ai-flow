
// Types for the case generator hook and associated data

// Type for the dashboard item
export interface ForgeFlowItem {
  id: string;
  requirementId: string;
  projectName: string;
  industry: string;
  created: string;
  userStoriesStatus: string;
  useCasesStatus: string;
  testCasesStatus: string;
  reqId: string;
}

// Types for the case data elements
export interface UserStory {
  id: string;
  content: string;
  status: string;
}

export interface UseCase {
  id: string;
  content: string;
  status: string;
}

export interface TestCase {
  id: string;
  content: string;
  status: string;
}

// Type for the status data
export interface StatusData {
  userStoriesStatus: string;
  useCasesStatus: string;
  testCasesStatus: string;
}

// Type for requirement data
export interface Requirement {
  id: string;
  projectName: string;
  industry: string;
  created: string;
  description: string;
  req_id?: string;
  [key: string]: any;
}

// Type for the database requirement object which might have different field names
export interface DatabaseRequirement {
  id: string;
  project_name?: string;
  projectName?: string;
  industry_type?: string;
  industry?: string;
  created_at?: string;
  created?: string;
  description?: string;
  document_summary?: string;
  req_id?: string;
  [key: string]: any;
}
