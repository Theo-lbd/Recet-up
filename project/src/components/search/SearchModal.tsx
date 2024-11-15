import React, { useState, useEffect } from 'react';
import { Search, X, User, Book, Heart, Globe } from 'lucide-react';
import { useRecipes } from '../../contexts/RecipeContext';
import { useUser } from '../../contexts/UserContext';
import { SearchFilter } from './SearchFilter';
import { SearchResults } from './SearchResults';

interface SearchModalProps {
  onClose: () => void;
  onRecipeClick: (id: string) => void;
  onUserClick: (id: string) => void;
}

type SearchScope = 'all' | 'my-recipes' | 'favorites';

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  onRecipeClick,
  onUserClick,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('all');
  const [activeTab, setActiveTab] = useState<'recipes' | 'users'>('recipes');
  const { recipes, favorites } = useRecipes();
  const { user, users } = useUser();

  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const filterRecipes = () => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    let filteredRecipes = recipes;

    switch (scope) {
      case 'my-recipes':
        filteredRecipes = recipes.filter(recipe => recipe.authorId === user?.uid);
        break;
      case 'favorites':
        filteredRecipes = recipes.filter(recipe => favorites.includes(recipe.id));
        break;
      case 'all':
        filteredRecipes = recipes.filter(recipe => !recipe.isPrivate || recipe.authorId === user?.uid);
        break;
    }

    return filteredRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.description.toLowerCase().includes(searchTerm)
    );
  };

  const filterUsers = () => {
    if (!query.trim() || !users) return [];

    const searchTerm = query.toLowerCase();
    return users.filter(u => 
      (u.displayName?.toLowerCase() || '').includes(searchTerm) ||
      (u.email?.toLowerCase() || '').includes(searchTerm) ||
      (u.bio?.toLowerCase() || '').includes(searchTerm)
    );
  };

  const handleResultClick = (type: 'recipe' | 'user', id: string) => {
    if (type === 'recipe') {
      onRecipeClick(id);
    } else {
      onUserClick(id);
    }
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-xl mx-4"
        onClick={handleSearchClick}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-accent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                activeTab === 'recipes'
                  ? 'bg-accent text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Book size={16} className="mr-2" />
              Recettes
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                activeTab === 'users'
                  ? 'bg-accent text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <User size={16} className="mr-2" />
              Utilisateurs
            </button>
          </div>

          {activeTab === 'recipes' && (
            <div className="flex items-center space-x-2 mt-3">
              <SearchFilter
                icon={<Globe size={16} />}
                label="Toutes"
                active={scope === 'all'}
                onClick={() => setScope('all')}
              />
              <SearchFilter
                icon={<Book size={16} />}
                label="Mes recettes"
                active={scope === 'my-recipes'}
                onClick={() => setScope('my-recipes')}
              />
              <SearchFilter
                icon={<Heart size={16} />}
                label="Favoris"
                active={scope === 'favorites'}
                onClick={() => setScope('favorites')}
              />
            </div>
          )}
        </div>

        <SearchResults
          query={query}
          activeTab={activeTab}
          recipes={filterRecipes()}
          users={filterUsers()}
          onRecipeClick={(id) => handleResultClick('recipe', id)}
          onUserClick={(id) => handleResultClick('user', id)}
        />
      </div>
    </div>
  );
};