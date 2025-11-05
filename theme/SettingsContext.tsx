import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, View } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from './theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Language = 'en' | 'pl' | 'uk';

interface Settings {
  themeMode: ThemeMode;
  language: Language;
}

interface SettingsContextProps {
  settings: Settings;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  theme: AppTheme;
}

const defaultSettings: Settings = {
  themeMode: 'system',
  language: 'en',
};

const SettingsContext = createContext<SettingsContextProps>({
  settings: defaultSettings,
  setThemeMode: () => {},
  setLanguage: () => {},
  theme: darkTheme,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [theme, setTheme] = useState<AppTheme>(darkTheme);
  const [isReady, setIsReady] = useState(false);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>(Appearance.getColorScheme() || 'dark');

  // Listen for system color scheme changes
  React.useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) setSystemColorScheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  // Load settings from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('app_settings').then(data => {
      if (data) setSettings(JSON.parse(data));
      setIsReady(true);
    });
  }, []);

  // Save settings to AsyncStorage and update theme
  useEffect(() => {
    AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    const colorScheme = Appearance.getColorScheme();
    if (settings.themeMode === 'system') {
      setTheme(colorScheme === 'light' ? lightTheme : darkTheme);
    } else {
      setTheme(settings.themeMode === 'light' ? lightTheme : darkTheme);
    }
  }, [settings]);

  const setThemeMode = (mode: ThemeMode) => setSettings(s => ({ ...s, themeMode: mode }));
  const setLanguage = (lang: Language) => setSettings(s => ({ ...s, language: lang }));

  if (!isReady) {
    // Show splash with correct background color (dark or light)
    const splashColor = systemColorScheme === 'light' ? lightTheme.colors.background : darkTheme.colors.background;
    return <View style={{ flex: 1, backgroundColor: splashColor }} />;
  }

  return (
    <SettingsContext.Provider value={{ settings, setThemeMode, setLanguage, theme }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext); 