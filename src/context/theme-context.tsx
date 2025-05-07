
import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface StudioTheme {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeContextType {
  studioTheme: StudioTheme;
  updateStudioTheme: (theme: Partial<StudioTheme>) => void;
}

const defaultTheme: StudioTheme = {
  name: "Studio Sandy Yasmin",
  logoUrl: "",
  bannerUrl: "",
  primaryColor: "#D0A638", // Gold color
  secondaryColor: "#FFEFEF", // Light pink
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useStudioSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useStudioSettings must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studioTheme, setStudioTheme] = useLocalStorage<StudioTheme>("studioSettings", defaultTheme);

  const updateStudioTheme = (newTheme: Partial<StudioTheme>) => {
    setStudioTheme(prev => ({ ...prev, ...newTheme }));
  };

  // Apply theme settings to document
  useEffect(() => {
    // Update document title
    if (studioTheme.name) {
      document.title = studioTheme.name;
    }

    // In a real app, you'd convert hex to HSL values properly
    // Apply theme colors to CSS variables
    document.documentElement.style.setProperty('--studio-name', `"${studioTheme.name}"`);
    
    // For now, just apply the colors directly (in a real app, these would be converted to HSL)
    document.documentElement.style.setProperty('--studio-primary', studioTheme.primaryColor);
    document.documentElement.style.setProperty('--studio-secondary', studioTheme.secondaryColor);

  }, [studioTheme]);

  return (
    <ThemeContext.Provider value={{ studioTheme, updateStudioTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
