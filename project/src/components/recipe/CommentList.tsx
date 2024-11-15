import React from 'react';
import { Reply, Trash } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useComments } from '../../contexts/CommentContext';
import { formatDistanceToNow } from '../../utils/date';
import type { Comment } from '../../types/comment';

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: string) => void;
  onCommentDeleted: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({ 
  comments, 
  onReply,
  onCommentDeleted
}) => {
  const { user } = useUser();
  const { deleteComment, error } = useComments();

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-4">
        {error}
      </div>
    );
  }

  const rootComments = comments.filter(comment => !comment.parentId);
  const getReplies = (parentId: string) => 
    comments.filter(comment => comment.parentId === parentId);

  const CommentCard: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => {
    const isAuthor = user?.uid === comment.userId;
    const replies = getReplies(comment.id);

    const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this comment?')) {
        return;
      }
      await deleteComment(comment.recipeId, comment.id);
      onCommentDeleted();
    };

    return (
      <div className={`${isReply ? 'ml-12' : ''}`}>
        <div className="flex space-x-3">
          <img
            src={comment.userAvatar}
            alt={comment.userName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.userName}
                </span>
                {isAuthor && (
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {comment.content}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm">
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
              <span className="text-gray-400">
                {formatDistanceToNow(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {rootComments.length > 0 ? (
        rootComments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};