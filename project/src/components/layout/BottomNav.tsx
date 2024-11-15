import React from 'react';
import { Home, Book, Users, Settings, Plus, LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 ${
      isActive ? 'text-accent' : 'text-gray-600 dark:text-gray-400'
    }`}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const currentPath = location.pathname;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around shadow-lg z-10">
        <NavButton
          icon={<Home size={24} />}
          label="Accueil"
          isActive={currentPath === '/'}
          onClick={() => handleNavigation('/')}
        />
        <NavButton
          icon={<LogIn size={24} />}
          label="Connexion"
          isActive={currentPath === '/auth'}
          onClick={() => handleNavigation('/auth')}
        />
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around shadow-lg z-10">
      <NavButton
        icon={<Home size={24} />}
        label="Accueil"
        isActive={currentPath === '/'}
        onClick={() => handleNavigation('/')}
      />
      <NavButton
        icon={<Book size={24} />}
        label="Mes Recettes"
        isActive={currentPath === '/my-recipes'}
        onClick={() => handleNavigation('/my-recipes')}
      />
      <div className="relative -mt-8">
        <button
          onClick={() => handleNavigation('/create')}
          className="bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent-dark transition-all"
        >
          <Plus size={24} />
        </button>
      </div>
      <NavButton
        icon={<Users size={24} />}
        label="Abonnements"
        isActive={currentPath === '/following'}
        onClick={() => handleNavigation('/following')}
      />
      <NavButton
        icon={<Settings size={24} />}
        label="Paramètres"
        isActive={currentPath === '/settings'}
        onClick={() => handleNavigation('/settings')}
      />
    </nav>
  );
};