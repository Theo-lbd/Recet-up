import React from 'react';
import { useUser } from '../../contexts/UserContext';
import type { User } from '../../types';

interface UserCardProps {
  user: User;
  showFollowButton?: boolean;
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  user: displayUser, 
  showFollowButton = true,
  onClick 
}) => {
  const { user: currentUser, followUser, unfollowUser } = useUser();

  if (!currentUser) return null;

  const isFollowing = currentUser.following?.includes(displayUser.uid);
  const isCurrentUser = currentUser.uid === displayUser.uid;

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowUser(displayUser.uid);
      } else {
        await followUser(displayUser.uid);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-4 ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
      }`}
    >
      <img
        src={displayUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.uid}`}
        alt={displayUser.displayName || ''}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold dark:text-white truncate">{displayUser.displayName}</h3>
        {displayUser.bio && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{displayUser.bio}</p>
        )}
      </div>
      {showFollowButton && !isCurrentUser && (
        <button
          onClick={handleFollowClick}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-accent text-white hover:bg-accent-dark'
          }`}
        >
          {isFollowing ? 'Abonné' : "S'abonner"}
        </button>
      )}
    </div>
  );
};