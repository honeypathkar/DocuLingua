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

  // Define colors for clarity
  const ACTIVE_ICON_COLOR = '#FFFFFF'; // White for active icon
  const ACTIVE_LABEL_COLOR = '#000000'; // Black for active label
  const INACTIVE_COLOR = theme.colors.onSurfaceVariant; // Default inactive color from theme, or choose your own like 'grey' or '#6c757d'
  const ACTIVE_INDICATOR_BACKGROUND = '#3777F8'; // Your existing indicator color
  const BAR_BACKGROUND_COLOR = '#FFFFFF'; // Your existing bar background

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
          activeColor={ACTIVE_LABEL_COLOR} // Set active *label* color to black
          inactiveColor={INACTIVE_COLOR} // Set inactive icon and label color
          activeIndicatorStyle={{
            backgroundColor: ACTIVE_INDICATOR_BACKGROUND, // Your desired background color for the indicator
          }}
          // Labeled is true by default, Shifting is false by default
          labeled={true}
          shifting={true} // Keeps the shifting animation
          style={{
            backgroundColor: BAR_BACKGROUND_COLOR, // Bar background
            // Add elevation or border if needed for separation
            // borderTopWidth: 1,
            // borderTopColor: theme.colors.outlineVariant, // Example border
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
            // Determine icon color based on focus state
            const iconColor = focused ? ACTIVE_ICON_COLOR : color; // Use white if focused, otherwise use the inactive color passed

            if (options.tabBarIcon) {
              // Pass the determined color and size to the original tabBarIcon function
              return options.tabBarIcon({focused, color: iconColor, size: 24});
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
      {/* Define the four tabs (no changes needed here) */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home', // Label text
          tabBarIcon: ({color, size}) => {
            // Icon name might change based on focus, handled in renderIcon now
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
