// src/context/ThemeContext.js
import React, {createContext, useState, useContext, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Appearance} from 'react-native';

// Create Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}, // Placeholder function
});

// Custom Hook
export const useThemeContext = () => useContext(ThemeContext);

// Storage Key
const THEME_STORAGE_KEY = '@doculingua_theme_mode'; // Use a unique key

// Provider Component
export const ThemeProvider = ({children}) => {
  const systemTheme = Appearance.getColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  // Load theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'dark');
        } else {
          // Use system theme if nothing stored
          setIsDarkMode(systemTheme === 'dark');
        }
      } catch (e) {
        console.error('ThemeContext: Failed to load theme preference.', e);
        setIsDarkMode(systemTheme === 'dark'); // Fallback on error
      } finally {
        setIsLoadingTheme(false);
      }
    };
    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemTheme]); // Reload if system theme changes and no value is stored

  // Toggle and save theme
  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('ThemeContext: Failed to save theme preference.', e);
    }
  };

  // Prevent rendering children until theme is loaded
  if (isLoadingTheme) {
    return null; // Or render a loading indicator/splash screen
  }

  const contextValue = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
