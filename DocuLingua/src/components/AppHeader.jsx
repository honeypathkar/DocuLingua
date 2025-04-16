// components/AppHeader.tsx
import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
  ToastAndroid,
} from 'react-native';
import {Appbar, useTheme, Searchbar, Menu} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export default function AppHeader({showSearchIcon = false}) {
  const theme = useTheme();
  const navigation = useNavigation(); // Standard hook

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false); // State for menu

  const userName = 'Honey Pathkar';

  useEffect(() => {}, [theme]);

  // --- Styles ---
  const styles = useMemo(
    () =>
      StyleSheet.create({
        appBar: {
          backgroundColor: theme.colors.surface || 'white',
          elevation: 4,
          alignItems: 'center',
          height: 60,
          paddingHorizontal: 5,
        },
        logoTitleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 5, // Adjusted margin
        },
        appIconSmall: {
          width: 32,
          height: 32,
          marginRight: 10,
        },
        appBarTitle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.colors.onSurface || '#000000',
        },
        profileImage: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'white', // Added background color for placeholder
        },
        profileTouchable: {
          marginLeft: 8, // Adjusted margin
          marginRight: 5, // Adjusted margin
          borderRadius: 20, // Make touchable area round
        },
        backAction: {
          marginRight: 5,
          marginLeft: 0,
        },
        searchbar: {
          flex: 1,
          height: 48,
          marginHorizontal: 5,
          backgroundColor: theme.colors.primaryContainer || '#EEE', // Use surfaceVariant
          // alignItems: 'center', // Often not needed for searchbar container
        },
        searchInput: {
          fontSize: 16,
          // Adjust internal alignment if needed, often defaults work
          // textAlignVertical: 'center', // Try for Android if text is off-center
          paddingBottom: 20,
        },
        menuItemTitle: {
          // Style for Menu.Item titles
          fontSize: 16,
        },
        menuItemDisabledTitle: {
          // Specific style for disabled item (username)
          fontSize: 16,
          fontWeight: 'bold',
          color: theme.colors.onSurface, // Make it look like regular text
        },
        menuItemLogoutTitle: {
          // Specific style for logout item
          fontSize: 16,
          color: theme.colors.error, // Use error color for logout
        },
      }),
    [theme],
  );

  // --- Handlers ---
  const handleSearchIconPress = () => {
    setIsSearchActive(true);
  };
  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery('');
  };
  const performSearch = () => {
    Keyboard.dismiss();
    console.log('Performing search for:', searchQuery);
  };

  // --- Menu Handlers ---
  const openProfileMenu = () => setIsProfileMenuVisible(true);
  const closeProfileMenu = () => setIsProfileMenuVisible(false);

  const handleLogout = () => {
    closeProfileMenu();
    console.log('Logout pressed');
    // Reset navigation stack to Welcome screen
    // Ensure 'Welcome' matches the screen name in your root navigator (App.js)
    navigation.reset({
      index: 0,
      routes: [{name: 'Welcome'}],
    });
    ToastAndroid.showWithGravity(
      'Logout Successfull.',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
    );
  };
  // ---------------------

  // --- Render ---
  return (
    <Appbar.Header style={styles.appBar}>
      {isSearchActive ? (
        // --- Search Active View ---
        <>
          <Appbar.Action
            icon="arrow-left"
            onPress={handleCloseSearch}
            color={theme.colors.onSurface}
            size={24}
            style={styles.backAction}
          />
          <Searchbar
            placeholder="Search documents..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchInput}
            iconColor={theme.colors.primary}
            onSubmitEditing={performSearch}
            autoFocus={true}
            elevation={0} // Set elevation to 0 if using mode="bar" for flatter look
            mode="bar" // Recommended mode for inline search in appbar
          />
        </>
      ) : (
        // --- Default View ---
        <>
          {/* Logo and Title */}
          <View style={styles.logoTitleContainer}>
            <Image
              source={require('../assets/images/logo.png')} // Verify path
              style={styles.appIconSmall}
              resizeMode="contain"
            />
            <Text style={styles.appBarTitle}>
              <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
            </Text>
          </View>

          {/* Spacer fills remaining space */}
          <View style={{flex: 1}} />

          {/* Search Icon (Conditional) */}
          {showSearchIcon && (
            <Appbar.Action
              icon="magnify"
              onPress={handleSearchIconPress}
              color={theme.colors.onSurface}
              size={28}
            />
          )}

          {/* Profile Image with Dropdown Menu */}
          <Menu
            visible={isProfileMenuVisible}
            onDismiss={closeProfileMenu}
            anchor={
              <TouchableOpacity
                onPress={openProfileMenu}
                style={styles.profileTouchable}>
                <Image
                  source={require('../assets/images/no-user-image.png')} // Verify path
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            }
            // Optional: Adjust content styling if needed
            // contentStyle={{ backgroundColor: theme.colors.surface }}
          >
            {/* User Name Item */}
            <Menu.Item
              title={userName || 'Not logged in'}
              disabled // Non-interactive
              style={{minWidth: 150}} // Give it some width
              titleStyle={styles.menuItemDisabledTitle}
            />

            {/* Logout Item */}
            <Menu.Item
              onPress={handleLogout}
              title="Logout"
              leadingIcon="logout"
              titleStyle={styles.menuItemLogoutTitle}
            />
          </Menu>
        </>
      )}
    </Appbar.Header>
  );
}
