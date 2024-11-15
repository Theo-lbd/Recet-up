import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, Edit } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useRecipes } from '../contexts/RecipeContext';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { ProfileSettings } from '../components/settings/ProfileSettings';

export const UserProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, user: currentUser, followUser, unfollowUser } = useUser();
  const { recipes } = useRecipes();
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  const profileUser = users.find(u => u.uid === id);
  
  if (!profileUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Utilisateur non trouvé</p>
      </div>
    );
  }

  const isCurrentUser = currentUser?.uid === profileUser.uid;
  const isFollowing = currentUser?.following?.includes(profileUser.uid);
  
  const userRecipes = recipes.filter(recipe => 
    recipe.authorId === profileUser.uid && (!recipe.isPrivate || isCurrentUser)
  );

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await unfollowUser(profileUser.uid);
      } else {
        await followUser(profileUser.uid);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="relative px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft size={24} />
          </button>

          {isCurrentUser && (
            <button
              onClick={() => setShowEditProfile(true)}
              className="absolute right-4 top-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Edit size={24} />
            </button>
          )}
          
          <div className="flex flex-col items-center">
            <img
              src={profileUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.uid}`}
              alt={profileUser.displayName || ''}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {profileUser.displayName}
            </h1>
            {profileUser.bio && (
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                {profileUser.bio}
              </p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{profileUser.followers?.length || 0} abonnés</span>
              </div>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{userRecipes.length} recettes</span>
              </div>
            </div>

            {!isCurrentUser && currentUser && (
              <button
                onClick={handleFollowClick}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-accent text-white hover:bg-accent-dark'
                }`}
              >
                {isFollowing ? 'Abonné' : "S'abonner"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Recettes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))}
        </div>
        {userRecipes.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>Aucune recette publiée</p>
          </div>
        )}
      </div>

      {showEditProfile && (
        <ProfileSettings onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};