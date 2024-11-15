export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  isPrivate: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  totalRatings: number;
  userRatings: { [userId: string]: number };
  isFavorite?: boolean;
  category: 'soup' | 'starter' | 'main' | 'dessert' | 'other';
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio?: string;
  phone?: string;
  location?: string;
  following?: string[];
  followers?: string[];
}