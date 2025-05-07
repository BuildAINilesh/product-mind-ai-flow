
import { toast } from "sonner";

export const validateGenerationDependencies = (
  type: "userStories" | "useCases" | "testCases" | undefined,
  statusData: {
    userStoriesStatus: string;
    useCasesStatus: string;
    testCasesStatus: string;
  }
): boolean => {
  if (type === "useCases" && statusData.userStoriesStatus !== "Completed") {
    toast.error("User stories must be generated first before generating use cases");
    return false;
  }
  
  if (type === "testCases" && 
      (statusData.userStoriesStatus !== "Completed" || statusData.useCasesStatus !== "Completed")) {
    toast.error("User stories and use cases must be generated first before generating test cases");
    return false;
  }
  
  return true;
};
