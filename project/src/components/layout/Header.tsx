import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';
import { NotificationList } from '../notifications/NotificationList';
import { SearchModal } from '../search/SearchModal';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  const isHomePage = location.pathname === '/';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (isHomePage) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-30 border-b dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <h1 className="text-xl font-bold text-accent">Recet'Up</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-accent"
                >
                  <Search size={24} />
                </button>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="text-gray-600 dark:text-gray-300 hover:text-accent relative"
                >
                  <Bell size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/user/${user.uid}`)}
                  className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent transition-all"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors"
              >
                <User size={20} />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>

        {showNotifications && (
          <NotificationList onClose={() => setShowNotifications(false)} />
        )}

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
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10">
      <div className="flex items-center">
        <h1 
          onClick={() => handleNavigation('/')}
          className="text-xl font-bold text-accent cursor-pointer"
        >
          Recet'Up
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <button
              onClick={() => setShowSearch(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-accent dark:hover:text-accent"
            >
              <Search size={24} />
            </button>
            <button
              onClick={() => navigate(`/user/${user.uid}`)}
              className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent transition-all"
            >
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleNavigation('/auth')}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors"
          >
            <User size={20} />
            <span>Connexion</span>
          </button>
        )}
      </div>
    </header>
  );
};