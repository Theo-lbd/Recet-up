import React, { useEffect, useState } from 'react';
import { Book, Users } from 'lucide-react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRecipes } from '../../contexts/RecipeContext';
import { useUser } from '../../contexts/UserContext';
import { UserStatsModal } from './UserStatsModal';

interface StatsData {
  totalRecipes: number;
  totalUsers: number;
}

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalRecipes: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showUserStats, setShowUserStats] = useState(false);
  const { recipes } = useRecipes();
  const { users } = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const recipesRef = collection(db, 'recipes');
        const usersRef = collection(db, 'users');

        const [recipesSnapshot, usersSnapshot] = await Promise.all([
          getCountFromServer(recipesRef),
          getCountFromServer(usersRef),
        ]);

        setStats({
          totalRecipes: recipesSnapshot.data().count,
          totalUsers: usersSnapshot.data().count,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 animate-pulse">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-accent mb-2">
            <Book size={20} />
            <h3 className="font-medium">Total Recettes</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {stats.totalRecipes}
          </p>
        </div>

        <button
          onClick={() => setShowUserStats(true)}
          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
        >
          <div className="flex items-center space-x-2 text-accent mb-2">
            <Users size={20} />
            <h3 className="font-medium">Total Utilisateurs</h3>
          </div>
          <p className="text-2xl font-bold dark:text-white">
            {stats.totalUsers}
          </p>
        </button>
      </div>

      {showUserStats && (
        <UserStatsModal
          users={users}
          recipes={recipes}
          onClose={() => setShowUserStats(false)}
        />
      )}
    </>
  );
};