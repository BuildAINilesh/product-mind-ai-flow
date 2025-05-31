
import { supabase } from "@/integrations/supabase/client";

export interface DatabaseUserStory {
  id: string;
  requirement_id: string;
  actor: string;
  story: string;
  acceptance_criteria: any; // jsonb field
  created_at: string;
}

export const getUserStoriesForRequirement = async (requirementId: string): Promise<DatabaseUserStory[]> => {
  try {
    const { data, error } = await supabase
      .from("user_stories")
      .select("*")
      .eq("requirement_id", requirementId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching user stories:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserStoriesForRequirement:", error);
    throw error;
  }
};
