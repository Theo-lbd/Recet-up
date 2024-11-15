import React, { useEffect, useState } from 'react';
import { useRecipes } from '../contexts/RecipeContext';
import { useUser } from '../contexts/UserContext';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { Clock, Users, Heart, ChevronDown } from 'lucide-react';
import { FilterButton } from '../components/ui/FilterButton';
import { CategoryFilter } from '../components/ui/CategoryFilter';
import { useNavigate } from 'react-router-dom';
import { SearchModal } from '../components/search/SearchModal';
import { NotificationList } from '../components/notifications/NotificationList';
import { HomeHeader } from '../components/layout/HomeHeader';
import { useScrollDirection } from '../hooks/useScrollDirection';

type FilterType = 'all' | 'following' | 'favorites';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { recipes, favorites, fetchRecipes } = useRecipes();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchRecipes();
      } catch (err) {
        setError('Une erreur est survenue lors du chargement des recettes');
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [fetchRecipes]);

  const filteredRecipes = React.useMemo(() => {
    const publicRecipes = recipes.filter(recipe => 
      !recipe.isPrivate || (user && recipe.authorId === user.uid)
    );

    let filtered = activeCategory === 'all' 
      ? publicRecipes 
      : publicRecipes.filter(recipe => recipe.category === activeCategory);

    const sortedRecipes = [...filtered].sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    if (!user) return sortedRecipes;

    switch (activeFilter) {
      case 'following':
        return sortedRecipes.filter(recipe => 
          user.following?.includes(recipe.authorId)
        );
      case 'favorites':
        return sortedRecipes.filter(recipe => 
          favorites.includes(recipe.id)
        );
      default:
        return sortedRecipes;
    }
  }, [recipes, user, favorites, activeFilter, activeCategory]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchRecipes()}
            className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeHeader
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      {/* Filters Section */}
      <div
        className={`fixed left-0 right-0 bg-white dark:bg-gray-800 z-20 transition-transform duration-300 ${
          scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ top: '64px' }}
      >
        {/* Primary Navigation */}
        <div className="border-b dark:border-gray-700">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide px-4 h-14">
            <FilterButton
              icon={<Clock size={14} />}
              label="Récents"
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              compact
            />
            {user && (
              <>
                <FilterButton
                  icon={<Users size={14} />}
                  label="Abonnements"
                  active={activeFilter === 'following'}
                  onClick={() => setActiveFilter('following')}
                  compact
                />
                <FilterButton
                  icon={<Heart size={14} />}
                  label="Favoris"
                  active={activeFilter === 'favorites'}
                  onClick={() => setActiveFilter('favorites')}
                  compact
                />
              </>
            )}
          </div>
        </div>

        {/* Categories Section */}
        <div className="border-b dark:border-gray-700">
          <div className="px-4 py-3">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300"
            >
              <span>Catégories</span>
              <ChevronDown
                size={16}
                className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}
              />
            </button>

            {showCategories && (
              <div className="mt-2">
                <CategoryFilter
                  activeCategory={activeCategory}
                  onCategoryChange={(category) => {
                    setActiveCategory(category);
                    setShowCategories(false);
                  }}
                  isMobile
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="pt-[144px] px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
              {activeFilter === 'following' ? (
                <p>Aucune recette de vos abonnements</p>
              ) : activeFilter === 'favorites' ? (
                <p>Aucune recette dans vos favoris</p>
              ) : (
                <p>Aucune recette disponible</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onRecipeClick={(id) => {
            navigate(`/recipe/${id}`);
            setShowSearch(false);
          }}
          onUserClick={(id) => {
            navigate(`/user/${id}`);
            setShowSearch(false);
          }}
        />
      )}

      {showNotifications && (
        <NotificationList onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
};