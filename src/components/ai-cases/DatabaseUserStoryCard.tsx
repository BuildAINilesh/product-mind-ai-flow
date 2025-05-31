
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
    <Card className="p-6 mb-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-slate-800">
          User Story #{index + 1}
        </h3>
        {userStory.actor && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1 px-3 py-1">
            <User size={14} />
            {userStory.actor}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* User Story Content */}
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
            📝 Story
          </h4>
          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-slate-700 leading-relaxed">
              {userStory.story}
            </p>
          </div>
        </div>

        {/* Acceptance Criteria */}
        {acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              Acceptance Criteria ({acceptanceCriteria.length})
            </h4>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-2">
                {acceptanceCriteria.map((criteria: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="text-green-600 font-bold mt-0.5 text-base">✓</span>
                    <span className="flex-1">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>ID: {userStory.id.slice(0, 8)}...</span>
            <span>Created: {new Date(userStory.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DatabaseUserStoryCard;
