// navigation/MainNavigator.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {BottomNavigation, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import your screens
import HomeScreen from '../screens/HomeScreen';
import TranslateScreen from '../screens/TranslateScreen';
import FilesScreen from '../screens/FilesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const theme = useTheme(); // Access the theme

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Use Appbar inside screens
      }}
      // Use Paper's BottomNavigation.Bar as the tab bar component
      tabBar={({navigation, state, descriptors, insets}) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          // Use theme colors automatically or uncomment to override
          // activeColor={'#89A6F4'}
          activeIndicatorStyle={{
            backgroundColor: '#3777F8', // <-- Your desired background color for the indicator
          }}
          // Labeled is true by default, Shifting is false by default
          // which matches the appearance in the image.
          labeled={true}
          shifting={true}
          style={{
            // You might adjust the background slightly if needed,
            // but default elevation/surface colors usually work well.
            backgroundColor: '#FFFFFF',
          }}
          onTabPress={({route, preventDefault}) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({route, focused, color}) => {
            const {options} = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({focused, color, size: 24});
            }
            return null;
          }}
          getLabelText={({route}) => {
            const {options} = descriptors[route.key];
            // Use the title option as the label
            return typeof options.title === 'string'
              ? options.title
              : route.name;
          }}
        />
      )}>
      {/* Define the four tabs */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home', // Label text
          tabBarIcon: ({color, size}) => {
            // Use an appropriate icon (outline usually for inactive)
            return <Icon name="home-outline" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          title: 'Translate', // Label text
          tabBarIcon: ({color, size}) => {
            // 'translate' or 'book-open-outline' might work
            return <Icon name="translate" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Files"
        component={FilesScreen}
        options={{
          title: 'Files', // Label text
          tabBarIcon: ({color, size}) => {
            // 'folder-outline' or 'file-cabinet'
            return <Icon name="folder-outline" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile', // Label text
          tabBarIcon: ({color, size}) => {
            return <Icon name="account-outline" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
}
