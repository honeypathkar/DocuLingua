import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PaperProvider, MD3LightTheme as DefaultTheme} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import WelcomeScreen from './screens/WelcomeScreen'; // Adjust path if needed
import BottomTabNavigator from './navigators/BottomTabNavigator'; // Adjust path if needed
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3777F8', // Set primary color globally
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
