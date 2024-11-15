import React, { useEffect } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { RecipeCard } from '../components/recipe/RecipeCard';

export const Favorites: React.FC = () => {
  const { recipes, favorites, fetchRecipes } = useRecipes();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const favoriteRecipes = recipes.filter(recipe => favorites.includes(recipe.id));

  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
          />
        ))}
        {favoriteRecipes.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Vous n'avez pas encore de recettes favorites</p>
          </div>
        )}
      </div>
    </div>
  );
};