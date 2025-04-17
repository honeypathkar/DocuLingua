// App.jsx
import React, {useContext} from 'react'; // Import useContext
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// Use MD3DarkTheme for dark mode base
import {PaperProvider, MD3DarkTheme} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Import your screens
import WelcomeScreen from './screens/auth/WelcomeScreen';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import UploadScreen from './screens/translate/UploadScreen';
import DocumentViewScreen from './screens/translate/DocumentViewSection';

// Import Theme Context and Themes
import {ThemeProvider, useThemeContext} from './context/ThemeContext'; // Adjust path if needed
import {LightTheme, DarkTheme} from './theme/theme'; // Adjust path if needed

const Stack = createNativeStackNavigator();

// --- App Content Component ---
// This component exists within the ThemeProvider's scope
function AppContent() {
  // Get the theme mode from our context
  const {isDarkMode} = useThemeContext();

  // Select the appropriate theme object
  const paperTheme = isDarkMode ? DarkTheme : LightTheme;

  return (
    // Apply the selected theme to PaperProvider
    <PaperProvider theme={paperTheme}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// --- Main App Component ---
function App() {
  return (
    <SafeAreaProvider>
      {/* Wrap everything that needs theme context with ThemeProvider */}
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
