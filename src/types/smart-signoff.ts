
export interface Stakeholder {
  id: number;
  name: string;
  role: string;
  approved: boolean;
  avatar: string;
}

export interface Comment {
  id: number;
  user: string;
  message: string;
  date: string;
}

export interface BRDRequirement {
  id: string;
  req_id: string;
  title: string;
  description: string;
  status: "draft" | "ready" | "signed_off" | "rejected";
  stakeholders: Stakeholder[];
  qualityScore: number;
  lastUpdated: string;
  comments: Comment[];
  brd_document?: any;
}
