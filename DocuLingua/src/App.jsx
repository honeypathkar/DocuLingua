import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {Platform, Linking, Alert, StatusBar} from 'react-native';

import WelcomeScreen from './screens/auth/WelcomeScreen';
import BottomTabNavigator from './navigators/BottomTabNavigator';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import UploadScreen from './screens/translate/UploadScreen';
import DocumentViewScreen from './screens/translate/DocumentViewSection';
import EditProfileScreen from './screens/profile/EditProfileScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import ChangePasswordScreen from './screens/auth/ChangePasswordScreen';

import {ThemeProvider, useThemeContext} from './context/ThemeContext';
import {LightTheme, DarkTheme} from './theme/theme';
import useUserStore from './store/userStore';

const Stack = createNativeStackNavigator();

const PLATFORM_PERMISSIONS = {
  ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY],
  android: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES],
};

const requestPermissions = async () => {
  const requiredPermissions = PLATFORM_PERMISSIONS[Platform.OS];
  if (!requiredPermissions) {
    console.warn('Permissions not defined for this platform:', Platform.OS);
    return true;
  }

  try {
    const statuses = await checkMultiple(requiredPermissions);
    console.log('Initial permission statuses:', statuses);

    const permissionsToRequest = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.DENIED,
    );

    if (permissionsToRequest.length > 0) {
      console.log('Requesting permissions:', permissionsToRequest);
      const requestResults = await requestMultiple(permissionsToRequest);
      console.log('Permission request results:', requestResults);
      permissionsToRequest.forEach(permission => {
        statuses[permission] = requestResults[permission];
      });
    }

    const blockedPermissions = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.BLOCKED,
    );
    const deniedPermissions = requiredPermissions.filter(
      permission => statuses[permission] === RESULTS.DENIED,
    );

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
      return true;
    }

    if (deniedPermissions.length > 0) {
      console.warn('Permissions denied:', deniedPermissions);
    }

    const allGranted = requiredPermissions.every(
      permission =>
        statuses[permission] === RESULTS.GRANTED ||
        statuses[permission] === RESULTS.LIMITED,
    );

    console.log('All required permissions granted/limited:', allGranted);
    return allGranted;
  } catch (error) {
    console.error('Error checking/requesting permissions:', error);
    return false;
  }
};

function AppContent() {
  const {isDarkMode} = useThemeContext();
  const [initialRouteName, setInitialRouteName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const {fetchDetails} = useUserStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [loginStatusResult, permissionsResult] = await Promise.all([
          (async () => {
            try {
              const userToken = await AsyncStorage.getItem('userToken');
              const rememberMe = await AsyncStorage.getItem('rememberMe');
              console.log('Login Check:', {userToken, rememberMe});
              return userToken && rememberMe === 'true' ? 'MainApp' : 'Welcome';
            } catch (error) {
              console.error('Error checking login status:', error);
              return 'Welcome';
            }
          })(),
          requestPermissions(),
        ]);

        setInitialRouteName(loginStatusResult);

        if (loginStatusResult === 'MainApp') {
          fetchDetails();
        }

        console.log('Permission check completed:', permissionsResult);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setInitialRouteName('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [fetchDetails]);

  const paperTheme = isDarkMode ? DarkTheme : LightTheme;

  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        backgroundColor={paperTheme.colors.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer>
        {initialRouteName && (
          <Stack.Navigator
            initialRouteName={initialRouteName}
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
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="MainApp"
              component={BottomTabNavigator}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="UploadScreen"
              component={UploadScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="DocumentView"
              component={DocumentViewScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{animation: 'slide_from_right'}}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

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
