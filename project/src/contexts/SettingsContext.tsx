import React, { createContext, useContext, useState } from 'react';
import { useUser } from './UserContext';

interface SettingsContextType {
  notifications: {
    recipes: boolean;
    comments: boolean;
    reminders: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    recipeDefaultVisibility: 'public' | 'private';
  };
  dietary: {
    preferences: string[];
    allergies: string[];
    restrictions: string[];
  };
  theme: 'light' | 'dark';
  updateNotifications: (settings: Partial<SettingsContextType['notifications']>) => void;
  updatePrivacy: (settings: Partial<SettingsContextType['privacy']>) => void;
  updateDietary: (settings: Partial<SettingsContextType['dietary']>) => void;
  updateTheme: (theme: 'light' | 'dark') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();

  const [settings, setSettings] = useState<Omit<SettingsContextType, 'updateNotifications' | 'updatePrivacy' | 'updateDietary' | 'updateTheme'>>({
    notifications: {
      recipes: true,
      comments: true,
      reminders: true,
    },
    privacy: {
      profileVisibility: 'public',
      recipeDefaultVisibility: 'public',
    },
    dietary: {
      preferences: user?.dietary || [],
      allergies: [],
      restrictions: [],
    },
    theme: 'light',
  });

  const updateNotifications = (newSettings: Partial<SettingsContextType['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...newSettings },
    }));
  };

  const updatePrivacy = (newSettings: Partial<SettingsContextType['privacy']>) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, ...newSettings },
    }));
  };

  const updateDietary = (newSettings: Partial<SettingsContextType['dietary']>) => {
    setSettings(prev => ({
      ...prev,
      dietary: { ...prev.dietary, ...newSettings },
    }));
  };

  const updateTheme = (theme: 'light' | 'dark') => {
    setSettings(prev => ({ ...prev, theme }));
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        updateNotifications,
        updatePrivacy,
        updateDietary,
        updateTheme,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};