// components/AppHeader.tsx
import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {Appbar, useTheme, Searchbar} from 'react-native-paper';

export default function AppHeader({showSearchIcon = false}) {
  const theme = useTheme();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Theme Log ---
  useEffect(() => {
    /* ... theme log ... */
  }, [theme]);

  // --- Create Styles INSIDE Component ---
  const styles = useMemo(
    () =>
      StyleSheet.create({
        appBar: {
          backgroundColor: theme.colors.surface || 'white',
          elevation: 4,
          alignItems: 'center', // This centers children (back icon, searchbar) in the header
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
          color: theme.colors.onSurface || '#000000',
        },
        profileImage: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'white',
        },
        profileTouchable: {marginLeft: 8, marginRight: 5},
        backAction: {marginRight: 5, marginLeft: 0},
        searchbar: {
          flex: 1,
          height: 48, // Keep specific height
          marginHorizontal: 5,
          backgroundColor: theme.colors.primaryContainer || 'white', // Reverted background
          alignItems: 'center',
        },
        searchInput: {
          fontSize: 16,
          color: theme.colors.onSurface,
          paddingBottom: 20,
          // The Searchbar component itself adds internal padding.
          // If still misaligned, try explicitly setting padding OR adjusting height slightly.
          // Example: paddingVertical: 0, // To remove default padding if it's causing issues
          // Example: textAlignVertical: 'center', // Might help on Android
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
  const handleProfile = () => {
    console.log('Profile pressed');
  };
  const performSearch = () => {
    Keyboard.dismiss(); /* ... search logic ... */
  };

  // --- JSX ---
  return (
    <Appbar.Header style={styles.appBar}>
      {isSearchActive ? (
        // Search Active View
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
            style={styles.searchbar} // Container style
            inputStyle={styles.searchInput} // Input text style
            iconColor={theme.colors.primary}
            onSubmitEditing={performSearch}
            autoFocus={true}
            elevation={0} // Keep elevation low if preferred
            mode="bar"
            // textAlignVertical="center" // You can try adding this prop directly too for Android alignment
          />
        </>
      ) : (
        // Default View
        <>
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
          <TouchableOpacity
            onPress={handleProfile}
            style={styles.profileTouchable}>
            <Image
              source={require('../assets/images/no-user-image.png')}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </>
      )}
    </Appbar.Header>
  );
}
