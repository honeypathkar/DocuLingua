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
  FlatList,
} from 'react-native';
import {
  Appbar,
  useTheme,
  Searchbar,
  Menu,
  List,
  Icon,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserStore from '../store/userStore';
import {GetDocumentbyUserIdUrl} from '../../API';
import axios from 'axios';

const defaultUserImageSource = require('../assets/images/no-user-image.png');

export default function AppHeader({showSearchIcon = false}) {
  const theme = useTheme();
  const navigation = useNavigation();

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const {user, loading, error} = useUserStore();

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

  // --- API Call for Search ---
  const fetchDocuments = async query => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(
        `${GetDocumentbyUserIdUrl}?search=${encodeURIComponent(query)}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const data = res.data;
      if (res.status === 200) {
        setSearchResults(data?.data?.documents || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDocuments(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleFilePress = file => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
    navigation.navigate('DocumentView', {
      documentId: file._id,
      documentName: file.documentName,
    });
  };

  const handleSearchIconPress = () => setIsSearchActive(true);
  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openProfileMenu = () => setIsProfileMenuVisible(true);
  const closeProfileMenu = () => setIsProfileMenuVisible(false);

  const handleLogout = useCallback(
    async (showToast = true) => {
      closeProfileMenu();
      console.log('Logout initiated from AppHeader...');
      await AsyncStorage.multiRemove(['userToken', 'rememberMe']);
      navigation.reset({index: 0, routes: [{name: 'Welcome'}]});
      if (showToast && Platform.OS === 'android') {
        ToastAndroid.showWithGravity(
          'Logout Successful.',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      }
    },
    [navigation],
  );

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
            user?.userImage ? {uri: user.userImage} : defaultUserImageSource
          }
          style={styles.profileImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!isSearchActive || !searchQuery.trim()) return null;

    if (isSearching) {
      return (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={{marginTop: 5}}
        />
      );
    }

    if (searchResults.length === 0) {
      return (
        <Text style={{marginTop: 5, textAlign: 'center', color: 'gray'}}>
          No documents found
        </Text>
      );
    }

    return (
      <FlatList
        data={searchResults}
        keyExtractor={item => item._id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.surfaceVariant,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => handleFilePress(item)}>
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                color: theme.colors.onSurface,
              }}
              numberOfLines={1}>
              {item.documentName}
            </Text>

            <List.Icon
              icon="chevron-right"
              color={theme.colors.onSurfaceVariant}
              style={{margin: 0, padding: 0}}
            />
          </TouchableOpacity>
        )}
        style={{
          maxHeight: 200,
          backgroundColor: theme.colors.surface,
          marginHorizontal: 10,
          borderRadius: 8,
        }}
      />
    );
  };

  return (
    <View>
      <Appbar.Header style={styles.appBar}>
        {isSearchActive ? (
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
              autoFocus
              elevation={0}
              mode="bar"
            />
          </>
        ) : (
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

            <Menu
              visible={isProfileMenuVisible}
              onDismiss={closeProfileMenu}
              anchor={
                <TouchableOpacity
                  onPress={openProfileMenu}
                  style={styles.profileTouchable}
                  disabled={loading}>
                  {renderProfileAnchor()}
                </TouchableOpacity>
              }>
              <Menu.Item
                title={loading ? 'Loading...' : user?.fullName || 'User'}
                disabled
                style={{minWidth: 150}}
                titleStyle={styles.menuItemDisabledTitle}
              />
              <Menu.Item
                onPress={() => handleLogout(true)}
                title="Logout"
                leadingIcon="logout"
                titleStyle={styles.menuItemLogoutTitle}
              />
            </Menu>
          </>
        )}
      </Appbar.Header>

      {renderSearchResults()}
    </View>
  );
}

// const styles = StyleSheet.create({
//   appBar: {
//     backgroundColor: '#fff',
//     elevation: 4,
//     alignItems: 'center',
//     height: 60,
//     paddingHorizontal: 5,
//   },
//   logoTitleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 5,
//   },
//   appIconSmall: {width: 32, height: 32, marginRight: 10},
//   appBarTitle: {fontSize: 22, fontWeight: 'bold', color: '#000'},
//   profileAnchorContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#eee',
//   },
//   profileImage: {width: 40, height: 40, borderRadius: 20},
//   profileTouchable: {marginLeft: 8, marginRight: 5, borderRadius: 20},
//   backAction: {marginRight: 5, marginLeft: 0},
//   searchbar: {
//     flex: 1,
//     height: 48,
//     marginHorizontal: 5,
//     backgroundColor: '#f2f2f2',
//   },
//   searchInput: {fontSize: 16, paddingBottom: 20},
//   menuItemDisabledTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'gray',
//   },
//   menuItemLogoutTitle: {fontSize: 16, color: 'red'},
// });
