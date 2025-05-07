
import { Calendar, MessageSquare } from "lucide-react";

interface Comment {
  id: number;
  user: string;
  message: string;
  date: string;
}

interface CommentsSectionProps {
  comments: Comment[];
}

export const CommentsSection = ({ comments }: CommentsSectionProps) => {
  return (
    <div>
      <div className="flex items-center mb-2">
        <MessageSquare className="h-4 w-4 mr-1" />
        <h3 className="text-sm font-medium">Comments</h3>
      </div>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-muted/50 rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium">{comment.user}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {comment.date}
              </div>
            </div>
            <p className="text-sm">{comment.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
