// App.jsx
import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider} from 'react-native-paper'; // Removed MD3DarkTheme import here as it's handled by ThemeContext
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {Platform, Linking, Alert} from 'react-native'; // Import Platform, Linking, Alert

import WelcomeScreen from './screens/auth/WelcomeScreen';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import UploadScreen from './screens/translate/UploadScreen';
import DocumentViewScreen from './screens/translate/DocumentViewSection';
import EditProfileScreen from './screens/profile/EditProfileScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ChangePasswordScreen from './screens/auth/ChangePasswordScreen';

import {ThemeProvider, useThemeContext} from './context/ThemeContext'; // Adjust path if needed
import {LightTheme, DarkTheme} from './theme/theme'; // Adjust path if needed

const Stack = createNativeStackNavigator();

const PLATFORM_PERMISSIONS = {
  ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY],
  android: [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, // For Android 13+
    // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, // Uncomment if targeting older Android or need broader access
  ],
};

// Helper function to request permissions
const requestPermissions = async () => {
  const requiredPermissions = PLATFORM_PERMISSIONS[Platform.OS];
  if (!requiredPermissions) {
    console.warn('Permissions not defined for this platform:', Platform.OS);
    return true; // Assume granted or not applicable if platform definition missing
  }

  // On Android < 13, READ_MEDIA_IMAGES doesn't exist, READ_EXTERNAL_STORAGE might be needed.
  // This basic example uses READ_MEDIA_IMAGES. Add logic here if supporting older Android extensively.
  // Example check:
  // if (Platform.OS === 'android' && Platform.Version < 33) {
  //   requiredPermissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  //   requiredPermissions = requiredPermissions.filter(p => p !== PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
  // }

  try {
    // Check current status
    const statuses = await checkMultiple(requiredPermissions);
    console.log('Initial permission statuses:', statuses);

    // Filter permissions that need requesting (are DENIED)
    const permissionsToRequest = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.DENIED,
    );

    // If any permissions need requesting
    if (permissionsToRequest.length > 0) {
      console.log('Requesting permissions:', permissionsToRequest);
      const requestResults = await requestMultiple(permissionsToRequest);
      console.log('Permission request results:', requestResults);
      // Update statuses after request
      permissionsToRequest.forEach(permission => {
        statuses[permission] = requestResults[permission];
      });
    }

    // Check final statuses: Are any BLOCKED or still DENIED?
    const blockedPermissions = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.BLOCKED,
    );
    const deniedPermissions = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.DENIED,
    ); // Check denied *again* in case user denied during request

    if (blockedPermissions.length > 0) {
      console.warn('Permissions blocked:', blockedPermissions);
      Alert.alert(
        'Permissions Required',
        'Some permissions are permanently blocked. Please enable Camera and Photos/Media access in your device settings to use related features.',
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings()},
        ],
      );
      // Decide if the app should proceed even if blocked. Here we allow it.
      return true; // Or return false if critical permissions are blocked and app shouldn't load
    }

    if (deniedPermissions.length > 0) {
      console.warn('Permissions denied:', deniedPermissions);
      // You could show a non-blocking message here if needed, but often
      // it's better to request again when the feature is actually used.
      // Alert.alert('Permissions Denied', 'Some features requiring Camera or Media access might not work.');
    }

    // Check if all required permissions are granted or limited (iOS)
    const allGranted = requiredPermissions.every(
      permission =>
        statuses[permission] === RESULTS.GRANTED ||
        statuses[permission] === RESULTS.LIMITED,
    );

    console.log('All required permissions granted/limited:', allGranted);
    return allGranted; // Return true if all essential permissions are okay (granted/limited)
  } catch (error) {
    console.error('Error checking/requesting permissions:', error);
    return false; // Indicate failure in permission check
  }
};

// --- App Content Component ---
function AppContent() {
  const {isDarkMode} = useThemeContext();
  const [initialRouteName, setInitialRouteName] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Represents overall loading state

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run login check and permission check concurrently
        const [loginStatusResult, permissionsResult] = await Promise.all([
          // 1. Check Login Status
          (async () => {
            try {
              const userToken = await AsyncStorage.getItem('userToken');
              const rememberMe = await AsyncStorage.getItem('rememberMe');
              console.log('Login Check:', {userToken, rememberMe});
              return userToken && rememberMe === 'true' ? 'MainApp' : 'Welcome';
            } catch (error) {
              console.error('Error checking login status:', error);
              return 'Welcome'; // Default to Welcome on error
            }
          })(),

          // 2. Check and Request Permissions
          requestPermissions(), // This now returns a boolean/status
        ]);

        // Set initial route based on login status
        setInitialRouteName(loginStatusResult);

        // Handle permission result (e.g., log, decide if app can proceed)
        console.log('Permission check completed:', permissionsResult);
        // You could potentially alter navigation or state here based on permissionsResult
        // For now, we let the app load regardless, but show alerts if blocked.
      } catch (error) {
        // Catch errors from Promise.all itself (unlikely here)
        console.error('Error during app initialization:', error);
        setInitialRouteName('Welcome'); // Default route on unexpected error
      } finally {
        // Mark loading as complete once both checks are done
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []); // Run only once on mount

  const paperTheme = isDarkMode ? DarkTheme : LightTheme;

  // Render loading indicator or null while checking
  if (isLoading) {
    // Optionally return a splash screen or loading indicator here
    return null;
    // Example: return <SplashScreen />;
  }

  // Render navigator only when loading is finished and initial route is set
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        {/* Ensure initialRouteName is not null before rendering Stack.Navigator */}
        {initialRouteName && (
          <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
              headerShown: false,
            }}>
            {/* Your Stack Screens remain the same */}
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
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{animation: 'ios_from_right'}}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{animation: 'ios_from_right'}}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{animation: 'ios_from_right'}}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

// --- Main App Component ---
function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
