import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useComments } from '../../contexts/CommentContext';
import type { CommentFormData } from '../../types/comment';

interface CommentFormProps {
  recipeId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  recipeId,
  parentId,
  onSuccess
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment, error } = useComments();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData: CommentFormData = {
        content: content.trim(),
        parentId
      };

      await addComment(recipeId, commentData);
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-accent focus:border-accent dark:bg-gray-700 dark:text-white resize-none"
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
      </div>
    </form>
  );
};