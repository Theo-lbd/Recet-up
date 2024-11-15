import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserCard } from '../components/user/UserCard';

export const Following: React.FC = () => {
  const navigate = useNavigate();
  const { user, users } = useUser();
  
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Connectez-vous pour voir vos abonnements</p>
      </div>
    );
  }

  const followingUsers = users.filter(u => user.following?.includes(u.uid));

  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Abonnements</h2>
        <div className="space-y-4">
          {followingUsers.map((followedUser) => (
            <UserCard 
              key={followedUser.uid}
              user={followedUser}
              onClick={() => navigate(`/user/${followedUser.uid}`)}
            />
          ))}
          {followingUsers.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p>Vous ne suivez personne pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};