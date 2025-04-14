// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {PaperProvider, MD3LightTheme as DefaultTheme} from 'react-native-paper'; // Use Light Theme
import BottomTabNavigator from './navigators/BottomTabNavigator';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const theme = {
  ...DefaultTheme,
};

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
