// src/theme/themes.js
import {
  MD3LightTheme, // Using alias DefaultTheme in App.jsx, but this is the source
  MD3DarkTheme,
} from 'react-native-paper';

const PRIMARY_COLOR = '#3777F8';

// --- Light Theme ---
export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: PRIMARY_COLOR,
    onPrimary: '#FFFFFF',
    primaryContainer: '#DCE1FF',
    onPrimaryContainer: '#001550',
    secondary: '#625B71',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    tertiary: '#7D5260',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFD8E4',
    onTertiaryContainer: '#31111D',
    error: '#B3261E',
    onError: '#FFFFFF',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    background: '#FFFBFF',
    onBackground: '#1C1B1F',
    surface: '#FFFBFF',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#B0C6FF',
    // elevation: { ... } // Usually handled by Paper
    // surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    // onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    // backdrop: 'rgba(50, 47, 55, 0.4)',
  },
};

// --- Dark Theme ---
export const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#B0C6FF', // Lighter primary
    onPrimary: '#002B75',
    primaryContainer: '#1F418B',
    onPrimaryContainer: '#DCE1FF',
    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    tertiary: '#EFB8C8',
    onTertiary: '#492532',
    tertiaryContainer: '#633B48',
    onTertiaryContainer: '#FFD8E4',
    error: '#F2B8B5',
    onError: '#601410',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    background: '#1C1B1F',
    onBackground: '#E6E1E5',
    surface: '#1C1B1F', // Often same as background in dark mode
    onSurface: '#E6E1E5',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
    outlineVariant: '#49454F',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E6E1E5',
    inverseOnSurface: '#313033',
    inversePrimary: '#3777F8', // Original primary for elements on inverse surfaces
    // elevation: { ... }
    // surfaceDisabled: 'rgba(230, 225, 229, 0.12)',
    // onSurfaceDisabled: 'rgba(230, 225, 229, 0.38)',
    // backdrop: 'rgba(50, 47, 55, 0.4)',
  },
};
