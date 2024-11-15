import React from 'react';
import { Clock, Users, Heart, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../../contexts/RecipeContext';
import { useUser } from '../../contexts/UserContext';
import type { Recipe } from '../../types';

const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800&h=600';

const CATEGORY_LABELS = {
  soup: 'Soupe',
  starter: 'Entrée',
  main: 'Plat',
  dessert: 'Dessert',
  other: 'Autre'
};

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useRecipes();
  const { users } = useUser();

  const isFavorite = favorites.includes(recipe.id);
  const author = users.find(u => u.uid === recipe.authorId);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(recipe.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = DEFAULT_RECIPE_IMAGE;
  };

  return (
    <article
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
    >
      <div className="relative h-48">
        <img
          src={recipe.imageUrl || DEFAULT_RECIPE_IMAGE}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}
          />
        </button>
        {recipe.isPrivate && (
          <span className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
            Privé
          </span>
        )}
        <span className="absolute bottom-2 left-2 bg-accent text-white px-2 py-1 rounded-full text-xs flex items-center">
          <UtensilsCrossed size={12} className="mr-1" />
          {CATEGORY_LABELS[recipe.category]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 dark:text-white line-clamp-1">{recipe.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-1" />
              <span>{recipe.servings}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/user/${recipe.authorId}`);
            }}
            className="text-sm text-accent hover:text-accent-dark truncate max-w-[120px]"
          >
            {author?.displayName || 'Utilisateur'}
          </button>
        </div>
      </div>
    </article>
  );
};