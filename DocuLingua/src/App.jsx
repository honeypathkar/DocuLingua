import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider, MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import WelcomeScreen from './screens/auth/WelcomeScreen'; // Adjust path if needed
import BottomTabNavigator from './navigators/BottomTabNavigator'; // Adjust path if needed
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import UploadScreen from './screens/translate/UploadScreen';
import DocumentViewScreen from './screens/translate/DocumentViewSection';

const Stack = createNativeStackNavigator();

const primaryColor = '#3777F8';

// Define the custom theme
const theme = {
  ...DefaultTheme, // Start with the default light theme
  colors: {
    ...DefaultTheme.colors, // Inherit default colors

    // --- Primary Color Palette ---
    primary: primaryColor, // Your main brand color
    onPrimary: '#FFFFFF', // Text/icons on primary color (white for contrast)
    primaryContainer: '#DCE1FF', // Lighter container variant (e.g., SegmentedButton active background)
    onPrimaryContainer: '#001550', // Text/icons on primary container (darker shade of primary)

    // --- Secondary Color Palette (Example: using a neutral purple/grey) ---
    // You might want to choose a different secondary color based on your brand
    secondary: '#625B71', // Accent color
    onSecondary: '#FFFFFF', // Text/icons on secondary
    secondaryContainer: '#E8DEF8', // Lighter container variant
    onSecondaryContainer: '#1D192B', // Text/icons on secondary container

    // --- Tertiary Color Palette (Example: using a contrasting warm tone) ---
    // You might want to choose a different tertiary color based on your brand
    tertiary: '#7D5260', // Another accent color
    onTertiary: '#FFFFFF', // Text/icons on tertiary
    tertiaryContainer: '#FFD8E4', // Lighter container variant
    onTertiaryContainer: '#31111D', // Text/icons on tertiary container

    // --- Error Color Palette (Standard Material defaults) ---
    error: '#B3261E', // Error indication color
    onError: '#FFFFFF', // Text/icons on error
    errorContainer: '#F9DEDC', // Lighter container for error sections
    onErrorContainer: '#410E0B', // Text/icons on error container

    // --- Background and Surface Colors ---
    background: '#FFFBFF', // App background
    onBackground: '#1C1B1F', // Text/icons on background
    surface: '#FFFBFF', // Card, Appbar, Sheet backgrounds
    onSurface: '#1C1B1F', // Text/icons on surfaces
    surfaceVariant: '#E7E0EC', // Subtle variant surface (e.g., outlines, dividers, disabled)
    onSurfaceVariant: '#49454F', // Text/icons on surface variant
    outline: '#79747E', // Borders, dividers
    outlineVariant: '#CAC4D0', // Subtle borders (like your list item border)
    shadow: '#000000', // Shadow color
    scrim: '#000000', // Scrim overlay color (for modals)

    // --- Inverse Colors (For dark elements on light surfaces if needed) ---
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#B0C6FF', // Primary color for dark surfaces

    // --- Elevation Overlays (Handled by Paper components based on elevation prop) ---
    // elevation: { // Default elevation levels can be overridden if necessary
    //  level0: 'transparent',
    //  level1: 'rgb(247, 243, 249)', // Example - Paper calculates these
    //  level2: 'rgb(243, 237, 244)', // Example
    //  level3: 'rgb(238, 232, 240)', // Example
    //  level4: 'rgb(236, 230, 238)', // Example
    //  level5: 'rgb(233, 227, 235)', // Example
    // },

    // --- Specific component overrides if needed ---
    // surfaceDisabled: 'rgba(28, 27, 31, 0.12)', // Example
    // onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)', // Example
    // backdrop: 'rgba(50, 47, 55, 0.4)', // Example
  },
};

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{animation: 'simple_push'}}
            />

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{animation: 'ios_from_right'}}
            />

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{animation: 'ios_from_right'}}
            />

            <Stack.Screen
              name="MainApp"
              component={BottomTabNavigator}
              options={{animation: 'ios_from_right'}}
            />

            <Stack.Screen
              name="UploadScreen"
              component={UploadScreen}
              options={{animation: 'ios_from_right'}}
            />

            <Stack.Screen
              name="DocumentView"
              component={DocumentViewScreen}
              options={{animation: 'ios_from_right'}}
            />
            {/* You could add other screens like Signup, ForgotPassword here */}
            {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
            {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
