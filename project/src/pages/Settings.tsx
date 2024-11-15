import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Camera,
  X,
  MessageSquare,
  BarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useSettings } from '../contexts/SettingsContext';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { PrivacySettings } from '../components/settings/PrivacySettings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { HelpSupportModal } from '../components/support/HelpSupportModal';
import { AdminStats } from '../components/admin/AdminStats';

interface SettingsModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <X size={20} />
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/auth');
    return null;
  }

  const isAdmin = user.email === 'theo.labadie@outlook.com';

  const closeModal = () => setActiveModal(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16">
      <div className="bg-white dark:bg-gray-800">
        {/* Profile Section */}
        <div className="p-6 flex items-center space-x-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <button
              onClick={() => setActiveModal('profile')}
              className="absolute bottom-0 right-0 bg-accent p-2 rounded-full text-white"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold dark:text-white">{user.displayName}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Admin Stats Section */}
        {isAdmin && (
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
              <BarChart className="mr-2" />
              Statistiques
            </h2>
            <AdminStats />
          </div>
        )}

        {/* Settings List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <button
            onClick={() => setActiveModal('profile')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              <User className="text-gray-500 dark:text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-200">Modifier le profil</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              <Bell className="text-gray-500 dark:text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-200">Notifications</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
          <button
            onClick={() => setActiveModal('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              <Lock className="text-gray-500 dark:text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-200">Confidentialité</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin/messages')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="text-accent" size={20} />
                <span className="text-gray-700 dark:text-gray-200">Messages Admin</span>
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Admin
                </span>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </button>
          )}
          <button
            onClick={() => setActiveModal('help')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="text-gray-500 dark:text-gray-400" size={20} />
              <span className="text-gray-700 dark:text-gray-200">Aide et support</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Settings Modals */}
      {activeModal === 'notifications' && (
        <SettingsModal title="Notifications" onClose={closeModal}>
          <NotificationSettings />
        </SettingsModal>
      )}
      {activeModal === 'privacy' && (
        <SettingsModal title="Confidentialité" onClose={closeModal}>
          <PrivacySettings />
        </SettingsModal>
      )}
      {activeModal === 'profile' && (
        <ProfileSettings onClose={closeModal} />
      )}
      {activeModal === 'help' && (
        <HelpSupportModal onClose={closeModal} />
      )}
    </div>
  );
};