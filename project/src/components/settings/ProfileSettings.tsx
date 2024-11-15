import React, { useState } from 'react';
import { Camera, X, Lock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeSelector } from './ThemeSelector';
import { ChangePasswordModal } from './ChangePasswordModal';

interface ProfileForm {
  name: string;
  email: string;
  bio: string;
  phone: string;
  location: string;
}

export const ProfileSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, updateProfile } = useUser();
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();
  
  const [form, setForm] = useState<ProfileForm>({
    name: user?.displayName || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setError(null);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setIsDirty(true);
  };

  const handleAccentChange = (newAccent: string) => {
    setAccentColor(newAccent);
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isDirty) return;
    
    setIsSaving(true);
    setError(null);

    try {
      await updateProfile({
        displayName: form.name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
      });
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold dark:text-white">Modifier le profil</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full shadow-lg hover:bg-accent-dark transition-colors"
                >
                  <Camera size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="flex items-center space-x-2 text-accent hover:text-accent-dark"
              >
                <Lock size={16} />
                <span>Changer le mot de passe</span>
              </button>
            </div>

            <div className="mt-8">
              <ThemeSelector
                currentTheme={theme}
                currentAccent={accentColor}
                onThemeChange={handleThemeChange}
                onAccentChange={handleAccentChange}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isDirty || isSaving}
                className={`px-6 py-2 rounded-md text-white ${
                  isDirty && !isSaving
                    ? 'bg-accent hover:bg-accent-dark'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};