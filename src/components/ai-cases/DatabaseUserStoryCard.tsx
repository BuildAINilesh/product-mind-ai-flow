
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle } from "lucide-react";
import { DatabaseUserStory } from "@/services/userStoriesService";

interface DatabaseUserStoryCardProps {
  userStory: DatabaseUserStory;
  index: number;
}

const DatabaseUserStoryCard: React.FC<DatabaseUserStoryCardProps> = ({
  userStory,
  index,
}) => {
  // Parse acceptance criteria if it's a JSON object
  const getAcceptanceCriteria = () => {
    if (!userStory.acceptance_criteria) return [];
    
    try {
      if (typeof userStory.acceptance_criteria === 'string') {
        return JSON.parse(userStory.acceptance_criteria);
      }
      if (Array.isArray(userStory.acceptance_criteria)) {
        return userStory.acceptance_criteria;
      }
      return [];
    } catch (error) {
      console.error("Error parsing acceptance criteria:", error);
      return [];
    }
  };

  const acceptanceCriteria = getAcceptanceCriteria();

  return (
    <Card className="p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          User Story #{index + 1}
        </h3>
        {userStory.actor && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
            <User size={12} />
            {userStory.actor}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* User Story */}
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Story</h4>
          <p className="text-slate-700 bg-slate-50 p-3 rounded-md">
            {userStory.story}
          </p>
        </div>

        {/* Acceptance Criteria */}
        {acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
              <CheckCircle size={16} />
              Acceptance Criteria
            </h4>
            <div className="space-y-2">
              {acceptanceCriteria.map((criteria: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>{criteria}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DatabaseUserStoryCard;
