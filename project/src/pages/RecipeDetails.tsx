import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Clock, Users, Edit, Trash, ChefHat, UtensilsCrossed } from 'lucide-react';
import { useRecipes } from '../contexts/RecipeContext';
import { useUser } from '../contexts/UserContext';
import { RecipeRating } from '../components/recipe/RecipeRating';
import { Comments } from '../components/recipe/Comments';

const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800&h=600';

const CATEGORY_LABELS = {
  soup: 'Soupe',
  starter: 'Entrée',
  main: 'Plat',
  dessert: 'Dessert',
  other: 'Autre'
};

export const RecipeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, deleteRecipe, toggleFavorite, favorites } = useRecipes();
  const { user, users } = useUser();

  const recipe = recipes.find(r => r.id === id);
  const author = users.find(u => u.uid === recipe?.authorId);

  useEffect(() => {
    if (!recipe) {
      navigate('/');
    }
  }, [recipe, navigate]);

  if (!recipe) return null;

  const isAuthor = user?.uid === recipe.authorId;
  const isFavorite = favorites.includes(id || '');

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return;
    }

    try {
      await deleteRecipe(recipe.id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleFavoriteClick = async () => {
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
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <div className="relative h-96">
        <img
          src={recipe.imageUrl || DEFAULT_RECIPE_IMAGE}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
          >
            <ArrowLeft size={24} />
          </button>
          {user && (
            <div className="flex items-center space-x-2">
              {isAuthor && (
                <>
                  <button
                    onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                    className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
                  >
                    <Edit size={24} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-red-500 hover:bg-white dark:hover:bg-gray-700"
                  >
                    <Trash size={24} />
                  </button>
                </>
              )}
              <button
                onClick={handleFavoriteClick}
                className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
              >
                <Heart
                  size={24}
                  className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-6 -mt-12 relative">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {recipe.title}
            </h1>
            <div className="flex items-center space-x-2">
              {recipe.isPrivate && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm">
                  Privé
                </span>
              )}
              <span className="px-2 py-1 bg-accent text-white rounded-full text-sm flex items-center">
                <UtensilsCrossed size={12} className="mr-1" />
                {CATEGORY_LABELS[recipe.category]}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate(`/user/${recipe.authorId}`)}
              className="flex items-center space-x-2 text-accent hover:text-accent-dark"
            >
              <img
                src={author?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipe.authorId}`}
                alt={author?.displayName || ''}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{author?.displayName || 'Utilisateur'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center">
              <Clock size={20} className="mr-2" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center">
              <ChefHat size={20} className="mr-2" />
              <span>{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center">
              <Users size={20} className="mr-2" />
              <span>{recipe.servings} portions</span>
            </div>
          </div>

          <RecipeRating
            recipeId={recipe.id}
            initialRating={recipe.rating}
            totalRatings={recipe.totalRatings}
            userRating={recipe.userRatings?.[user?.uid || '']}
            className="mb-6"
          />

          <div className="prose dark:prose-invert max-w-none mb-8">
            <p>{recipe.description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Ingrédients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center text-gray-700 dark:text-gray-300"
                >
                  <span className="w-2 h-2 bg-accent rounded-full mr-3" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 pt-8 border-t dark:border-gray-700">
            <Comments recipeId={recipe.id} />
          </div>
        </div>
      </div>
    </div>
  );
};