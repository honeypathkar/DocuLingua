// components/AppHeader.jsx
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
  ToastAndroid,
  Platform,
  ActivityIndicator,
  LogBox,
} from 'react-native';
import {Appbar, useTheme, Searchbar, Menu, Avatar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native'; // Standard hook call for JSX
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../store/userStore';
// import useUserDetails from '../store/userStore';

const defaultUserImageSource = require('../assets/images/no-user-image.png'); // Verify path

export default function AppHeader({showSearchIcon = false}) {
  const theme = useTheme();
  const navigation = useNavigation(); // No generic type needed for JSX

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);

  const {user, loading, error} = useUserStore(); // <-- Use the hook
  LogBox.ignoreAllLogs();

  // useEffect(() => {
  //   console.log('AppHeader mounted, fetching user details...');
  //   fetchDetails();
  // }, [fetchDetails]); // fetchDetails is stable due to useCallback in the hook

  useEffect(() => {
    if (error && error.type === 'AUTH') {
      console.error('AppHeader: Auth error detected from hook, logging out.');
      handleLogout(false); // Logout without toast
    }
  }, [error, handleLogout]); // Added handleLogout as dependency

  const styles = useMemo(
    () =>
      StyleSheet.create({
        appBar: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
          alignItems: 'center',
          height: 60,
          paddingHorizontal: 5,
        },
        logoTitleContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 5,
        },
        appIconSmall: {width: 32, height: 32, marginRight: 10},
        appBarTitle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.colors.onSurface,
        },
        profileAnchorContainer: {
          width: 40,
          height: 40,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.surfaceVariant,
        },
        profileImage: {width: 40, height: 40, borderRadius: 20},
        profileTouchable: {marginLeft: 8, marginRight: 5, borderRadius: 20},
        backAction: {marginRight: 5, marginLeft: 0},
        searchbar: {
          flex: 1,
          height: 48,
          marginHorizontal: 5,
          backgroundColor: theme.colors.primaryContainer,
        },
        searchInput: {fontSize: 16 /* Adjusted */, paddingBottom: 20},
        menuItemTitle: {fontSize: 16},
        menuItemDisabledTitle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: theme.colors.onSurfaceVariant,
        },
        menuItemLogoutTitle: {fontSize: 16, color: theme.colors.error},
      }),
    [theme],
  );

  const handleSearchIconPress = () => setIsSearchActive(true);
  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery('');
  };
  const performSearch = () => {
    Keyboard.dismiss();
    console.log('Performing search for:', searchQuery); /* Implement */
  };
  const openProfileMenu = () => setIsProfileMenuVisible(true);
  const closeProfileMenu = () => setIsProfileMenuVisible(false);

  const handleLogout = useCallback(
    async (showToast = true) => {
      closeProfileMenu();
      console.log('Logout initiated from AppHeader...');
      await AsyncStorage.multiRemove(['userToken', 'rememberMe']);
      navigation.reset({index: 0, routes: [{name: 'Welcome'}]}); // Verify 'Welcome' screen name
      if (showToast && Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Logout Successful.',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      }
    },
    [navigation],
  ); // Dependency on navigation

  const renderProfileAnchor = () => {
    if (loading) {
      return (
        <View style={styles.profileAnchorContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.profileAnchorContainer}>
        <Image
          source={
            user?.userImage // Use data from hook
              ? {uri: user.userImage}
              : defaultUserImageSource // Use fallback
          }
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>
    );
  };

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
            elevation={0}
            mode="bar"
          />
        </>
      ) : (
        // --- Default View ---
        <>
          {/* Logo and Title */}
          <View style={styles.logoTitleContainer}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.appIconSmall}
              resizeMode="contain"
            />
            <Text style={styles.appBarTitle}>
              <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
            </Text>
          </View>

          <View style={{flex: 1}} />

          {showSearchIcon && (
            <Appbar.Action
              icon="magnify"
              onPress={handleSearchIconPress}
              color={theme.colors.onSurface}
              size={28}
            />
          )}

          <Menu
            visible={isProfileMenuVisible}
            onDismiss={closeProfileMenu}
            anchor={
              <TouchableOpacity
                onPress={openProfileMenu}
                style={styles.profileTouchable}
                disabled={loading} // Disable while loading user info initially
              >
                {renderProfileAnchor()} {/* Render image/loader */}
              </TouchableOpacity>
            }>
            <Menu.Item
              title={loading ? 'Loading...' : user?.fullName || 'User'}
              disabled
              style={{minWidth: 150}}
              titleStyle={styles.menuItemDisabledTitle}
            />

            <Menu.Item
              onPress={() => handleLogout(true)} // Pass true to show toast
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
