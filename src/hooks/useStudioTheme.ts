
import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface StudioThemeSettings {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
}

const defaultSettings: StudioThemeSettings = {
  name: "Studio Sandy Yasmin",
  logoUrl: "",
  bannerUrl: "",
  primaryColor: "#D0A638", // Gold color
  secondaryColor: "#FFEFEF", // Light pink
};

export function useStudioTheme() {
  const [settings, setSettings] = useLocalStorage<StudioThemeSettings>(
    "studioSettings", 
    defaultSettings
  );
  
  // Helper function to convert hex to HSL values
  const hexToHSL = (hex: string) => {
    // This is a simplified version that doesn't actually convert to HSL
    // For a real implementation, you'd need proper color conversion
    return hex;
  };
  
  // Apply theme settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply colors as CSS variables
    // Note: In a real implementation, you'd convert these to HSL values
    // properly before setting them
    root.style.setProperty('--primary', hexToHSL(settings.primaryColor));
    root.style.setProperty('--secondary', hexToHSL(settings.secondaryColor));
    
    // Update document title
    if (settings.name) {
      document.title = settings.name;
    }
  }, [settings]);
  
  return { 
    settings,
    updateSettings: (newSettings: Partial<StudioThemeSettings>) => {
      setSettings({...settings, ...newSettings});
    },
    updateTheme: (newSettings: Partial<StudioThemeSettings>) => {
      setSettings({...settings, ...newSettings});
    }
  };
}
