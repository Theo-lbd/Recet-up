import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useUser } from './UserContext';
import { useNotifications } from './NotificationContext';
import type { Recipe } from '../types';

interface RecipeContextType {
  recipes: Recipe[];
  favorites: string[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  fetchRecipes: () => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  rateRecipe: (recipeId: string, rating: number) => Promise<void>;
  addComment: (recipeId: string, content: string) => Promise<void>;
  getComments: (recipeId: string) => Promise<any[]>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user, users } = useUser();
  const { addNotification } = useNotifications();

  const fetchRecipes = useCallback(async () => {
    if (!user) return;

    try {
      const recipesRef = collection(db, 'recipes');
      const snapshot = await getDocs(recipesRef);
      const recipesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Recipe[];

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const userFavorites = userDoc.data()?.favorites || [];

      setRecipes(recipesData);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  }, [user]);

  const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Must be logged in to add recipes');

    try {
      const recipeData = {
        ...recipe,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        totalRatings: 0,
        userRatings: {}
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      
      // Get author details
      const author = users.find(u => u.uid === user.uid);
      const authorName = author?.displayName || 'Un utilisateur';

      // Find users who follow the author
      const followers = users.filter(u => u.following?.includes(user.uid));

      // Send notifications to followers
      for (const follower of followers) {
        await addNotification({
          userId: follower.uid,
          type: 'recipe_new',
          message: `${authorName} a publié une nouvelle recette : ${recipe.title}`,
          linkTo: `/recipe/${docRef.id}`
        });
      }

      setRecipes(prev => [...prev, { 
        id: docRef.id, 
        ...recipeData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Recipe]);

      return docRef.id;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, recipeUpdate: Partial<Recipe>) => {
    try {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, {
        ...recipeUpdate,
        updatedAt: serverTimestamp(),
      });

      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? { ...recipe, ...recipeUpdate, updatedAt: new Date() } : recipe
      ));
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const isFavorite = favorites.includes(recipeId);

      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(recipeId)
        });
        setFavorites(prev => prev.filter(id => id !== recipeId));
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(recipeId)
        });
        setFavorites(prev => [...prev, recipeId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  };

  const rateRecipe = async (recipeId: string, rating: number) => {
    if (!user) throw new Error('Must be logged in to rate recipes');

    try {
      const recipeRef = doc(db, 'recipes', recipeId);
      const recipeDoc = await getDoc(recipeRef);
      
      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found');
      }

      const recipeData = recipeDoc.data();
      const oldRating = recipeData.userRatings?.[user.uid] || 0;
      const isNewRating = oldRating === 0;
      
      const currentTotalRating = (recipeData.rating || 0) * (recipeData.totalRatings || 0);
      const newTotalRating = currentTotalRating - oldRating + rating;
      const newTotalRatings = isNewRating ? (recipeData.totalRatings || 0) + 1 : recipeData.totalRatings || 0;
      const newAverageRating = newTotalRating / newTotalRatings;

      await updateDoc(recipeRef, {
        [`userRatings.${user.uid}`]: rating,
        rating: newAverageRating,
        totalRatings: newTotalRatings,
        updatedAt: serverTimestamp(),
      });

      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId ? {
          ...recipe,
          rating: newAverageRating,
          totalRatings: newTotalRatings,
          userRatings: { ...recipe.userRatings, [user.uid]: rating },
          updatedAt: new Date(),
        } : recipe
      ));
    } catch (error) {
      console.error('Error rating recipe:', error);
      throw error;
    }
  };

  const addComment = async (recipeId: string, content: string) => {
    if (!user) return;

    try {
      const commentRef = collection(db, 'comments');
      await addDoc(commentRef, {
        recipeId,
        userId: user.uid,
        content,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  const getComments = async (recipeId: string) => {
    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('recipeId', '==', recipeId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      favorites,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      fetchRecipes,
      toggleFavorite,
      rateRecipe,
      addComment,
      getComments,
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};