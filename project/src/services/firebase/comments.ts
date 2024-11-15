import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Comment, CommentFormData } from '../../types/comment';
import type { User } from '../../contexts/UserContext';

export const addComment = async (
  recipeId: string, 
  data: CommentFormData, 
  user: User
): Promise<void> => {
  try {
    const commentsRef = collection(db, `recipes/${recipeId}/comments`);
    await addDoc(commentsRef, {
      recipeId,
      userId: user.uid,
      userName: user.displayName,
      userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      content: data.content,
      parentId: data.parentId || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (recipeId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, `recipes/${recipeId}/comments`);
    const q = query(
      commentsRef,
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const deleteComment = async (recipeId: string, commentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `recipes/${recipeId}/comments/${commentId}`));
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};