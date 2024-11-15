import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import type { Recipe } from '../../types';

const RECIPES_COLLECTION = 'recipes';

export const getRecipes = async () => {
  try {
    const recipesRef = collection(db, RECIPES_COLLECTION);
    const snapshot = await getDocs(recipesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Recipe[];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
};

export const addRecipe = async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const recipesRef = collection(db, RECIPES_COLLECTION);
    const docRef = await addDoc(recipesRef, {
      ...recipe,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
  try {
    const recipeRef = doc(db, RECIPES_COLLECTION, id);
    await updateDoc(recipeRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

export const deleteRecipe = async (id: string) => {
  try {
    const recipeRef = doc(db, RECIPES_COLLECTION, id);
    await deleteDoc(recipeRef);
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

export const uploadRecipeImage = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `recipe-images/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const onRecipesChange = (callback: (recipes: Recipe[]) => void) => {
  const recipesRef = collection(db, RECIPES_COLLECTION);
  return onSnapshot(recipesRef, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Recipe[];
    callback(recipes);
  });
};