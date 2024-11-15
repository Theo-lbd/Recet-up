import React from 'react';
import { X, Book } from 'lucide-react';
import type { User } from '../../types';
import type { Recipe } from '../../types';

interface UserStatsModalProps {
  users: User[];
  recipes: Recipe[];
  onClose: () => void;
}

export const UserStatsModal: React.FC<UserStatsModalProps> = ({ users, recipes, onClose }) => {
  const getUserRecipeCount = (userId: string) => {
    return recipes.filter(recipe => recipe.authorId === userId).length;
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aCount = getUserRecipeCount(a.uid);
    const bCount = getUserRecipeCount(b.uid);
    return bCount - aCount;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Liste des utilisateurs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedUsers.map((user) => (
              <div key={user.uid} className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  alt={user.displayName || ''}
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium dark:text-white">{user.displayName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Book size={16} className="mr-1" />
                  <span>{getUserRecipeCount(user.uid)} recettes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};