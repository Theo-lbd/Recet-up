import React from 'react';
import type { Recipe } from '../../types';
import type { User } from '../../contexts/UserContext';
import { Clock, Users } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  activeTab: 'recipes' | 'users';
  recipes: Recipe[];
  users: User[];
  onRecipeClick: (id: string) => void;
  onUserClick: (id: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  activeTab,
  recipes,
  users,
  onRecipeClick,
  onUserClick,
}) => {
  if (!query.trim()) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Commencez à taper pour rechercher des {activeTab === 'recipes' ? 'recettes' : 'utilisateurs'}
      </div>
    );
  }

  if (activeTab === 'recipes' && recipes.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Aucune recette trouvée
      </div>
    );
  }

  if (activeTab === 'users' && users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Aucun utilisateur trouvé
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
      {activeTab === 'recipes' ? (
        <div className="divide-y dark:divide-gray-700">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onRecipeClick(recipe.id)}
              className="w-full p-4 flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {recipe.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {recipe.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {recipe.prepTime + recipe.cookTime} min
                  </span>
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {recipe.servings} portions
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="divide-y dark:divide-gray-700">
          {users.map((user) => (
            <button
              key={user.uid}
              onClick={() => onUserClick(user.uid)}
              className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                alt={user.displayName || ''}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {user.displayName}
                </h3>
                {user.bio && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};