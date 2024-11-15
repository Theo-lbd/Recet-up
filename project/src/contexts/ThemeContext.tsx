import React, { createContext, useContext, useEffect, useState } from 'react';

type AccentColor = 'emerald' | 'blue' | 'purple' | 'red' | 'orange' | 'indigo';

interface ThemeContextType {
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return 'light'; // Default to light theme
  });

  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    return (localStorage.getItem('accentColor') as AccentColor) || 'orange';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-accent', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};