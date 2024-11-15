import React, { useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useComments } from '../../contexts/CommentContext';

interface CommentsProps {
  recipeId: string;
}

export const Comments: React.FC<CommentsProps> = ({ recipeId }) => {
  const { user } = useUser();
  const { comments, fetchComments } = useComments();
  const [replyTo, setReplyTo] = React.useState<string | null>(null);

  useEffect(() => {
    if (recipeId) {
      fetchComments(recipeId);
    }
  }, [recipeId, fetchComments]);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Connectez-vous pour commenter cette recette
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Commentaires ({comments.length})
      </h2>

      <CommentForm 
        recipeId={recipeId}
        onSuccess={() => {
          setReplyTo(null);
          fetchComments(recipeId);
        }}
      />

      {replyTo && (
        <div className="mt-4 ml-12">
          <CommentForm
            recipeId={recipeId}
            parentId={replyTo}
            onSuccess={() => {
              setReplyTo(null);
              fetchComments(recipeId);
            }}
          />
        </div>
      )}

      <CommentList
        comments={comments}
        onReply={setReplyTo}
        onCommentDeleted={() => fetchComments(recipeId)}
      />
    </div>
  );
};