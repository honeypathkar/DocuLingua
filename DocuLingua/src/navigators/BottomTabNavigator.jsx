// navigation/MainNavigator.tsx
import React from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {BottomNavigation, useTheme} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Import your screens
import HomeScreen from '../screens/home/HomeScreen';
import TranslateScreen from '../screens/translate/TranslateScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
// import FilesScreen from '../screens/FilesScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // --- Define Theme-Based Colors ---
  const activeLabelColor = theme.colors.primary; // Active LABEL color
  const activeIconColor = '#FFFFFF'; // Active ICON color (hardcoded white)
  const inactiveColor = theme.colors.onSurfaceVariant; // Inactive icon & label color
  const activeIndicatorBackground = theme.colors.primary; // Indicator background
  const barBackgroundColor = theme.colors.surface; // Bar background

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({navigation, state, descriptors}) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          // --- Apply Theme Colors ---
          activeColor={activeLabelColor} // Set active LABEL color to theme's primary
          inactiveColor={inactiveColor}
          activeIndicatorStyle={{
            backgroundColor: activeIndicatorBackground,
          }}
          style={{
            backgroundColor: barBackgroundColor,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.outlineVariant,
          }}
          labeled={true}
          shifting={true}
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
            // 'color' passed = inactiveColor when focused=false
            // Explicitly set ACTIVE icon color here
            const iconColor = focused ? activeIconColor : color; // Use hardcoded white for active icon

            const {options} = descriptors[route.key];
            if (options.tabBarIcon) {
              // Pass the determined color to the original icon function
              return options.tabBarIcon({focused, color: iconColor, size: 24});
            }
            return null;
          }}
          getLabelText={({route}) => {
            const {options} = descriptors[route.key];
            return typeof options.title === 'string'
              ? options.title
              : route.name;
          }}
        />
      )}>
      {/* Screens remain the same */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{
          title: 'Translate',
          tabBarIcon: ({color, size}) => (
            <Icon name="translate" size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen name="Files" ... /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
