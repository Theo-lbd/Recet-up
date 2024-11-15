import React, { useEffect, useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { useUser } from '../contexts/UserContext';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { Clock, Globe, Lock } from 'lucide-react';
import { FilterButton } from '../components/ui/FilterButton';

type FilterType = 'recent' | 'public' | 'private';

export const MyRecipes: React.FC = () => {
  const { recipes, fetchRecipes } = useRecipes();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<FilterType>('recent');

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Filter recipes where authorId matches current user's uid
  const myRecipes = recipes.filter(recipe => recipe.authorId === user?.uid);

  // Apply filters and sorting
  const filteredRecipes = React.useMemo(() => {
    let filtered = [...myRecipes];

    // Apply visibility filter
    switch (activeFilter) {
      case 'public':
        filtered = filtered.filter(recipe => !recipe.isPrivate);
        break;
      case 'private':
        filtered = filtered.filter(recipe => recipe.isPrivate);
        break;
      default:
        // For 'recent', no visibility filter needed
        break;
    }

    // Sort by creation date, newest first
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [myRecipes, activeFilter]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Connectez-vous pour voir vos recettes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Fixed Header with Filters */}
      <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <FilterButton
              icon={<Clock size={16} />}
              label="Récentes"
              active={activeFilter === 'recent'}
              onClick={() => setActiveFilter('recent')}
            />
            <FilterButton
              icon={<Globe size={16} />}
              label="Publiques"
              active={activeFilter === 'public'}
              onClick={() => setActiveFilter('public')}
            />
            <FilterButton
              icon={<Lock size={16} />}
              label="Privées"
              active={activeFilter === 'private'}
              onClick={() => setActiveFilter('private')}
            />
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="pt-28 px-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
              {activeFilter === 'public' ? (
                <p>Vous n'avez pas encore de recettes publiques</p>
              ) : activeFilter === 'private' ? (
                <p>Vous n'avez pas encore de recettes privées</p>
              ) : (
                <p>Vous n'avez pas encore créé de recettes</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};