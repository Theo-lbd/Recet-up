import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { formatDistanceToNow } from '../../utils/date';
import { Reply, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: Date;
  parentId?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  recipeId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
}

const CommentInput: React.FC<{ onSubmit: (content: string) => Promise<void> }> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="w-full p-2 border rounded-lg resize-none focus:ring-accent focus:border-accent dark:bg-gray-700 dark:border-gray-600"
          rows={2}
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={20} />
      </button>
    </form>
  );
};

const CommentCard: React.FC<{
  comment: Comment;
  onReply: (content: string) => Promise<void>;
}> = ({ comment, onReply }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex space-x-3">
        <img
          src={comment.authorAvatar}
          alt={comment.authorName}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.authorName}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
          </div>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="mt-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center"
          >
            <Reply size={16} className="mr-1" />
            Répondre
          </button>
        </div>
      </div>

      {showReplyInput && (
        <div className="ml-11">
          <CommentInput
            onSubmit={async (content) => {
              await onReply(content);
              setShowReplyInput(false);
            }}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-4">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onReply={(content) => onReply(content)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  recipeId,
  comments,
  onAddComment,
}) => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Connectez-vous pour commenter cette recette
        </p>
      </div>
    );
  }

  const rootComments = comments.filter((comment) => !comment.parentId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Commentaires ({comments.length})
      </h2>

      <CommentInput onSubmit={(content) => onAddComment(content)} />

      <div className="space-y-6">
        {rootComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            onReply={(content) => onAddComment(content, comment.id)}
          />
        ))}
      </div>
    </div>
  );
};