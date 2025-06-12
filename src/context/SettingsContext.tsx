import React, { createContext, useState, useContext, type ReactNode } from 'react';

// Define the shape of your settings
interface AppSettings {
  // Video settings
  maxRecordingDuration: number;

  // Photo settings
  countdownDuration: number;
  pauseBetweenPhotos: number;

  // Filter settings
  contrast: number;
  brightness: number;
  grain: number;
  
  // Overlay settings
  stripOverlay: string | null; // A base64 data URL for the overlay image

  // File System settings
  directoryHandle: FileSystemDirectoryHandle | null;
}

// Define the shape of the context value
interface SettingsContextType {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

// Default settings
const defaultSettings: AppSettings = {
  maxRecordingDuration: 20,
  countdownDuration: 3,
  pauseBetweenPhotos: 1500, // in ms
  contrast: 140, // as a percentage
  brightness: 110, // as a percentage
  grain: 60, // alpha value for grain, 0-255
  stripOverlay: null,
  directoryHandle: null,
};

// Create the context
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
});

// Create a provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 