import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from './UserContext';
import { addComment as addCommentService, getComments as getCommentsService, deleteComment as deleteCommentService } from '../services/firebase/comments';
import type { Comment, CommentFormData } from '../types/comment';

interface CommentContextType {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  addComment: (recipeId: string, data: CommentFormData) => Promise<void>;
  deleteComment: (recipeId: string, commentId: string) => Promise<void>;
  fetchComments: (recipeId: string) => Promise<void>;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const CommentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fetchComments = useCallback(async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await getCommentsService(recipeId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = async (recipeId: string, data: CommentFormData) => {
    if (!user) throw new Error('Must be logged in to comment');
    
    setError(null);
    try {
      await addCommentService(recipeId, data, user);
      await fetchComments(recipeId);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
      throw error;
    }
  };

  const deleteComment = async (recipeId: string, commentId: string) => {
    if (!user) return;

    setError(null);
    try {
      await deleteCommentService(recipeId, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
      throw error;
    }
  };

  return (
    <CommentContext.Provider value={{
      comments,
      loading,
      error,
      addComment,
      deleteComment,
      fetchComments,
    }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
};