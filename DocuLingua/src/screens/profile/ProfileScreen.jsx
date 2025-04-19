// src/screens/profile/ProfileScreen.jsx
import React, {
  useState,
  useMemo,
  // useContext, // Removed if useThemeContext not used here directly
  useEffect, // Keep for potential other effects
  useCallback,
} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
  Dimensions,
  ToastAndroid,
  Platform,
  Modal,
} from 'react-native';
import {
  Text,
  useTheme,
  Surface,
  List,
  Divider,
  Switch,
  Button,
  Caption,
  IconButton,
  Paragraph,
} from 'react-native-paper';
import {useNavigation, useFocusEffect} from '@react-navigation/native'; // <--- Import useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import AppHeader from '../../components/AppHeader'; // Adjust path if needed
import {useThemeContext} from '../../context/ThemeContext'; // Adjust path if needed
import {GetUserDetailsUrl, DeleteAccountUrl} from '../../../API'; // Adjust path if needed

const screenWidth = Dimensions.get('window').width;

const ProfileSkeleton = ({theme}) => {
  const skeletonStyles = useMemo(() => createSkeletonStyles(theme), [theme]);

  return (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surfaceVariant} // Use theme color for background
      highlightColor={theme.colors.backdrop} // Use another theme color for highlight
      speed={1000} // Adjust speed as needed
    >
      <View style={skeletonStyles.container}>
        <View style={skeletonStyles.header}>
          <SkeletonPlaceholder.Item
            width={100}
            height={100}
            borderRadius={50}
            marginBottom={12}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.5}
            height={24}
            borderRadius={4}
            marginBottom={6}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.6}
            height={18}
            borderRadius={4}
            marginBottom={10}
          />
        </View>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-around"
          alignItems="center"
          marginBottom={20}
          paddingVertical={15}
          borderRadius={12} // Use theme.roundness * 2 if preferred
          height={60} // Approx height of stats bar
        />
        <View style={skeletonStyles.listSection}>
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.4}
            height={20}
            borderRadius={4}
            marginBottom={15}
          />
          {[1, 2].map(key => (
            <SkeletonPlaceholder.Item
              key={`list1-${key}`}
              flexDirection="row"
              alignItems="center"
              marginBottom={15}>
              <SkeletonPlaceholder.Item
                width={24}
                height={24}
                borderRadius={12}
                marginRight={15}
              />
              <View>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.7}
                  height={18}
                  borderRadius={4}
                  marginBottom={5}
                />
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.5}
                  height={14}
                  borderRadius={4}
                />
              </View>
            </SkeletonPlaceholder.Item>
          ))}
        </View>
        <View style={skeletonStyles.listSection}>
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.3}
            height={20}
            borderRadius={4}
            marginBottom={15}
          />
          {[1, 2].map(key => (
            <SkeletonPlaceholder.Item
              key={`list2-${key}`}
              flexDirection="row"
              alignItems="center"
              marginBottom={15}>
              <SkeletonPlaceholder.Item
                width={24}
                height={24}
                borderRadius={12}
                marginRight={15}
              />
              <View>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.7}
                  height={18}
                  borderRadius={4}
                  marginBottom={5}
                />
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.5}
                  height={14}
                  borderRadius={4}
                />
              </View>
            </SkeletonPlaceholder.Item>
          ))}
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};
const createSkeletonStyles = theme =>
  StyleSheet.create({
    /* ... skeleton styles ... */
    container: {paddingHorizontal: 16, paddingTop: 0},
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      marginBottom: 20,
    },
    listSection: {marginBottom: 20},
  });

// --- ProfileScreen Component ---
export default function ProfileScreen() {
  const paperTheme = useTheme();
  const styles = useMemo(() => createStyles(paperTheme), [paperTheme]);
  const navigation = useNavigation();

  // State variables... (user, loading, refreshing, etc.)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initially true
  const [refreshing, setRefreshing] = useState(false);
  const {isDarkMode, toggleDarkMode} = useThemeContext();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // Needs API integration if real
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Data Fetching --- (Now inside useCallback for useFocusEffect)
  const fetchUserDetails = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) {
        setLoading(true); // Show skeleton only if needed (e.g., not for pull-to-refresh)
      }
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          console.log('No user token found for fetching details.');
          // Navigate to login, do not show error alert here as focus effect might trigger often
          navigation.replace('Welcome', {screen: 'Login'}); // Adjust as needed
          setLoading(false);
          setRefreshing(false);
          return;
        }
        console.log(
          'Fetching details from URL (ProfileScreen):',
          GetUserDetailsUrl,
        );
        const response = await axios.get(GetUserDetailsUrl, {
          headers: {Authorization: `Bearer ${userToken}`},
          timeout: 10000, // Add timeout
        });

        const userData = response.data.user || response.data; // Adjust based on your API response structure
        if (userData && typeof userData === 'object') {
          setUser(userData);
          // Optionally update 2FA state if API provides it
          // setIsTwoFactorEnabled(userData.isTwoFactorEnabled || false);
        } else {
          console.error('User data format error:', response.data);
          if (!refreshing) {
            // Avoid alert spamming on refresh/focus loops
            Alert.alert('Data Error', 'Received invalid user data format.');
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Avoid showing alerts on every focus if there's a persistent error,
        // especially for network errors or auth errors handled by redirect.
        if (!refreshing) {
          // Show alerts mainly on non-refresh fetches
          if (
            error.response &&
            (error.response.status === 401 || error.response.status === 403)
          ) {
            console.log('Authentication failed on fetch, logging out.');
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Welcome', {screen: 'Login'}); // Navigate to login
          } else if (error.response) {
            Alert.alert(
              'Server Error',
              `Failed to load details (Code: ${error.response.status}).`,
            );
          } else if (error.request) {
            Alert.alert('Network Error', 'Could not connect to the server.');
          } else {
            Alert.alert(
              'Error',
              'An unexpected error occurred while fetching details.',
            );
          }
        } else {
          console.log('Refresh failed silently due to error:', error.message);
          // Optionally show a toast for refresh failures
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigation, refreshing],
  ); // Add refreshing dependency

  // --- Fetch data when screen comes into focus ---
  useFocusEffect(
    useCallback(() => {
      console.log('Profile Screen focused, fetching details...');
      fetchUserDetails(true); // Pass true to show loading indicator on focus

      // Optional: Cleanup function (runs when screen loses focus)
      return () => {
        console.log('Profile Screen unfocused');
        // You could cancel ongoing fetches here if needed
      };
    }, [fetchUserDetails]), // Dependency array includes fetchUserDetails
  );

  // --- Refresh Handler --- (Calls fetchUserDetails without skeleton)
  const onRefresh = useCallback(() => {
    console.log('Pull-to-refresh triggered');
    setRefreshing(true);
    fetchUserDetails(false); // Pass false to avoid showing skeleton on manual refresh
  }, [fetchUserDetails]);

  // --- Other Handlers (handleLogout, handleEditProfile, delete logic) --- (remain the same)
  const handleLogout = useCallback(async () => {
    /* ... */
    console.log('Logout pressed');
    await AsyncStorage.multiRemove(['userToken', 'rememberMe']);
    navigation.reset({index: 0, routes: [{name: 'Welcome'}]});
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        'Logout Successful.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
  }, [navigation]);

  const handleEditProfile = useCallback(() => {
    if (user) {
      // Ensure user data is loaded before navigating
      navigation.navigate('EditProfile', {user: user});
    } else {
      Alert.alert('Please wait', 'User data is still loading.');
    }
  }, [navigation, user]); // Add user dependency

  const performAccountDeletion = useCallback(async () => {
    /* ... */
    setIsDeleting(true);
    let userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      /* ... handle no token ... */ return;
    }
    try {
      const response = await axios.delete(DeleteAccountUrl, {
        headers: {Authorization: `Bearer ${userToken}`},
      });
      if (response.status === 200 || response.status === 204) {
        /* ... handle success ... */ setIsModalVisible(false);
        Alert.alert('Success', 'Account deleted.', [
          {text: 'OK', onPress: handleLogout},
        ]);
      } else {
        /* ... handle unexpected success status ... */
      }
    } catch (error) {
      /* ... handle deletion error ... */
      console.error('Error deleting account:', error);
      let errorMessage =
        'An error occurred.'; /* ... more detailed error message logic ... */
      Alert.alert('Deletion Failed', errorMessage);
      setIsModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  }, [handleLogout]);

  const handleDeleteAccount = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  // --- Render Logic ---
  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={false} />

      {/* Show Skeleton only on initial load triggered by focus, not during manual refresh */}
      {loading && !refreshing && !user ? (
        <ProfileSkeleton theme={paperTheme} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // Use the updated onRefresh
              colors={[paperTheme.colors.primary]}
              tintColor={paperTheme.colors.primary}
            />
          }
          // Optional: Add keyboardShouldPersistTaps="handled" if inputs were present
        >
          {/* Check if user exists before rendering details */}
          {user ? (
            <>
              {/* User Info Header */}
              <View style={styles.header}>
                <IconButton
                  icon="pencil-outline"
                  size={24}
                  style={styles.editIcon}
                  onPress={handleEditProfile}
                  iconColor={paperTheme.colors.primary}
                  mode="contained-tonal"
                />
                <Image
                  source={
                    user.userImage
                      ? {uri: user.userImage}
                      : require('../../assets/images/no-user-image.png')
                  }
                  style={styles.profileImage}
                />
                <Text variant="headlineMedium" style={styles.userName}>
                  {user.fullName || 'N/A'}
                </Text>
                <Text variant="bodyMedium" style={styles.userEmail}>
                  {user.email || 'N/A'}
                </Text>
              </View>

              {/* Stats Surface */}
              <Surface style={styles.statsSurface} elevation={1}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium">
                    {user.documents?.length ?? 0}
                  </Text>
                  <Caption>Documents</Caption>
                </View>
                <Divider style={styles.statsDivider} />
                <View style={styles.statItem}>
                  <Text variant="titleMedium">{user.translations ?? 0}</Text>
                  <Caption>Translations</Caption>
                </View>
                <Divider style={styles.statsDivider} />
                <View style={styles.statItem}>
                  <Text variant="titleMedium">
                    {user.language?.length ?? 0}
                  </Text>
                  <Caption>Languages</Caption>
                </View>
              </Surface>

              {/* List Sections (Account, Security, Preferences, Danger Zone) */}
              <List.Section
                title="Account Information"
                titleStyle={styles.sectionTitle}>
                {/* List Items for Full Name, Email */}
                <List.Item
                  title="Full Name"
                  description={user.fullName || 'N/A'}
                  left={() => <List.Icon icon="account-circle-outline" />}
                />
                <List.Item
                  title="Email Address"
                  description={user.email || 'N/A'}
                  left={() => <List.Icon icon="email-outline" />}
                />
              </List.Section>
              <Divider style={styles.divider} />
              <List.Section title="Security" titleStyle={styles.sectionTitle}>
                {/* List Items for Change Password, 2FA */}
                <List.Item
                  title="Change Password"
                  left={() => <List.Icon icon="lock-outline" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => {
                    Alert.alert('Not Implemented');
                  }}
                />
                <List.Item
                  title="Two-Factor Authentication"
                  description={isTwoFactorEnabled ? 'Enabled' : 'Not enabled'}
                  left={() => <List.Icon icon="shield-check-outline" />}
                  right={() => (
                    <Switch
                      value={isTwoFactorEnabled}
                      onValueChange={setIsTwoFactorEnabled}
                    />
                  )}
                  onPress={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                />
              </List.Section>
              <Divider style={styles.divider} />
              <List.Section
                title="Preferences"
                titleStyle={styles.sectionTitle}>
                {/* List Item for Dark Mode */}
                <List.Item
                  title="Dark Mode"
                  description={isDarkMode ? 'On' : 'Off'}
                  left={() => <List.Icon icon="theme-light-dark" />}
                  right={() => (
                    <Switch
                      value={isDarkMode}
                      onValueChange={toggleDarkMode}
                      color={paperTheme.colors.primary}
                    />
                  )}
                  onPress={toggleDarkMode}
                />
              </List.Section>
              <Divider style={styles.divider} />
              {/* Logout Button */}
              <Button
                icon="logout"
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor={paperTheme.colors.primary}>
                {' '}
                Log Out{' '}
              </Button>
              <Divider style={styles.divider} />
              {/* Danger Zone */}
              <List.Section
                title="Danger Zone"
                titleStyle={[
                  styles.sectionTitle,
                  {color: paperTheme.colors.error},
                ]}>
                <Text style={styles.dangerDescription}>
                  {' '}
                  Permanently delete your account and all associated data. This
                  action cannot be undone.{' '}
                </Text>
                <Button
                  icon="delete-forever-outline"
                  mode="contained"
                  onPress={handleDeleteAccount}
                  buttonColor={paperTheme.colors.error}
                  textColor={paperTheme.colors.onError}
                  style={styles.deleteButton}>
                  {' '}
                  Delete Account{' '}
                </Button>
              </List.Section>
            </>
          ) : (
            // Optional: Show a message if user is null after loading (e.g., fetch failed but didn't error out fully)
            !loading && (
              <View style={styles.centeredMessage}>
                <Text>Could not load profile data.</Text>
              </View>
            )
          )}
        </ScrollView>
      )}

      {/* Delete Confirmation Modal (remains the same) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          if (!isDeleting) setIsModalVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: paperTheme.colors.elevation.level3},
            ]}>
            <Text style={[styles.modalTitle, {color: paperTheme.colors.error}]}>
              {' '}
              Delete Account?{' '}
            </Text>
            <Paragraph
              style={[
                styles.modalMessage,
                {color: paperTheme.colors.onSurface},
              ]}>
              {' '}
              Are you absolutely sure...?{' '}
            </Paragraph>
            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setIsModalVisible(false)}
                disabled={isDeleting}
                textColor={paperTheme.colors.onSurfaceVariant}
                style={{marginRight: 10}}>
                {' '}
                Cancel{' '}
              </Button>
              <Button
                mode="contained"
                onPress={performAccountDeletion}
                loading={isDeleting}
                disabled={isDeleting}
                buttonColor={paperTheme.colors.error}
                textColor={paperTheme.colors.onError}>
                {' '}
                Delete{' '}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles --- (remain the same, added centeredMessage)
const createStyles = theme =>
  StyleSheet.create({
    /* ... existing styles ... */
    container: {flex: 1, backgroundColor: theme.colors.background},
    scrollContent: {paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1},
    header: {
      position: 'relative',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
      marginHorizontal: -16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: 20,
      elevation: 2,
    },
    editIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      backgroundColor: theme.colors.surfaceVariant,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.outlineVariant,
      borderWidth: 1,
    },
    userName: {
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    userEmail: {color: theme.colors.onSurfaceVariant, marginBottom: 8},
    statsSurface: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 15,
      borderRadius: theme.roundness * 2,
      backgroundColor: theme.colors.surfaceVariant,
      marginBottom: 20,
      elevation: 1,
    },
    statItem: {alignItems: 'center', flex: 1, paddingHorizontal: 5},
    statsDivider: {
      width: 1,
      height: '60%',
      alignSelf: 'center',
      backgroundColor: theme.colors.outlineVariant,
    },
    sectionTitle: {
      marginTop: 15,
      marginBottom: 8,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontSize: 16,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: theme.colors.outlineVariant,
      height: 1,
    },
    logoutButton: {
      marginTop: 20,
      marginBottom: 15,
      borderColor: theme.colors.primary,
      borderWidth: 1,
      paddingVertical: 5,
    },
    dangerDescription: {
      marginBottom: 10,
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'left',
      paddingHorizontal: 5,
    },
    deleteButton: {marginTop: 10, marginBottom: 20, paddingVertical: 5},
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
      width: '85%',
      maxWidth: 400,
      padding: 25,
      borderRadius: theme.roundness * 2,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
    },
    modalActions: {flexDirection: 'row', justifyContent: 'flex-end'},
    centeredMessage: {
      // Added style for fallback message
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  });
