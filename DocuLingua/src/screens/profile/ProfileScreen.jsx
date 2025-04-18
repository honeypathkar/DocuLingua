// src/screens/profile/ProfileScreen.jsx
import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
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
  ToastAndroid, // Keep if used in handleLogout
  Platform, // Import Platform
  Modal, // Import Modal
  // TouchableOpacity, // Not needed if using Paper Button
} from 'react-native';
import {
  Text,
  useTheme,
  Surface,
  List,
  Divider,
  Switch,
  Button, // Keep Paper Button for consistency & loading prop
  Caption,
  IconButton,
  Paragraph, // Useful for modal content
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import AppHeader from '../../components/AppHeader'; // Adjust path if needed
import {useThemeContext} from '../../context/ThemeContext'; // Adjust path if needed
// ** IMPORTANT: Ensure these URLs use your IP ADDRESS in API.js, not localhost **
import {GetUserDetailsUrl, DeleteAccountUrl} from '../../../API'; // Adjust path if needed

const screenWidth = Dimensions.get('window').width;

// --- Skeleton Component --- (Extracted for clarity)
const ProfileSkeleton = ({theme}) => {
  const skeletonStyles = useMemo(() => createSkeletonStyles(theme), [theme]);
  return (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surfaceVariant} // Use theme color for background
      highlightColor={theme.colors.backdrop} // Use another theme color for highlight
      speed={1000} // Adjust speed as needed
    >
      <View style={skeletonStyles.container}>
        {/* Header Skeleton */}
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
          {/* Placeholder for caption removed as per user code */}
        </View>
        {/* Stats Skeleton */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-around"
          alignItems="center"
          marginBottom={20}
          paddingVertical={15}
          borderRadius={12} // Use theme.roundness * 2 if preferred
          height={60} // Approx height of stats bar
        />
        {/* List Section Skeleton (Example for 2 sections with 2 items each) */}
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

// --- ProfileScreen Component ---
export default function ProfileScreen() {
  const paperTheme = useTheme();
  const styles = useMemo(() => createStyles(paperTheme), [paperTheme]);
  const navigation = useNavigation();

  // --- State variables ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {isDarkMode, toggleDarkMode} = useThemeContext();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // State for React Native Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Data Fetching ---
  const fetchUserDetails = useCallback(async () => {
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('No user token found.');
        Alert.alert('Authentication Error', 'You need to be logged in.', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Welcome', {screen: 'Welcome'}),
          }, // Adjust navigation target
        ]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      console.log('Fetching details from URL:', GetUserDetailsUrl);
      const response = await axios.get(GetUserDetailsUrl, {
        headers: {Authorization: `Bearer ${userToken}`},
      });
      console.log('Full Response Data:', response.data);
      // ** IMPORTANT: Check console log and adjust if user data is not nested under 'user' **
      const userData = response.data.user || response.data;
      if (userData && typeof userData === 'object') {
        setUser(userData);
      } else {
        console.error('User data format error:', response.data);
        Alert.alert('Data Error', 'Invalid user data format.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          Alert.alert('Authentication Failed', 'Please log in again.', [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.removeItem('userToken');
                navigation.replace('AuthStack', {screen: 'Login'});
              },
            },
          ]);
        } else {
          Alert.alert(
            'Server Error',
            `Failed to load details (Code: ${error.response.status}).`,
          );
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'Could not connect.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigation]);

  // --- Initial Fetch ---
  useEffect(() => {
    setLoading(true);
    fetchUserDetails();
  }, [fetchUserDetails]);

  // --- Refresh Handler ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserDetails();
  }, [fetchUserDetails]);

  // --- Logout Handler ---
  const handleLogout = useCallback(async () => {
    console.log('Logout pressed');
    await AsyncStorage.multiRemove(['userToken', 'rememberMe']);
    // Reset navigation stack to initial route (adjust name if needed)
    navigation.reset({index: 0, routes: [{name: 'Welcome'}]});

    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity(
        'Logout Successful.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
    // No specific iOS feedback added here, adjust if needed
  }, [navigation]);

  // --- Edit Profile Handler ---
  const handleEditProfile = useCallback(() => {
    Alert.alert('Not Implemented', 'Edit profile is not yet available.');
  }, []);

  // --- Delete Account Logic --- Using RN Modal

  // Function that performs the actual deletion API call
  const performAccountDeletion = useCallback(async () => {
    setIsDeleting(true);
    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert(
          'Error',
          'Authentication token not found. Please log in again.',
        );
        setIsModalVisible(false); // Close modal before logging out
        handleLogout();
        return;
      }
      console.log('Attempting DELETE to URL:', DeleteAccountUrl);
      const response = await axios.delete(DeleteAccountUrl, {
        headers: {Authorization: `Bearer ${userToken}`},
      });

      if (response.status === 200 || response.status === 204) {
        console.log('Account deletion successful');
        setIsModalVisible(false); // Close modal first
        Alert.alert('Success', 'Your account has been deleted.', [
          {text: 'OK', onPress: handleLogout}, // Then log out
        ]);
      } else {
        Alert.alert('Error', `Unexpected response (${response.status}).`);
        setIsModalVisible(false); // Close modal on unexpected success
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      let errorMessage = 'An error occurred while deleting your account.';
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage =
            'Authentication failed. Please log out and log back in.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error (Code: ${error.response.status}).`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Check connection.';
      }
      Alert.alert('Deletion Failed', errorMessage);
      setIsModalVisible(false); // Close modal on error
    } finally {
      setIsDeleting(false);
    }
  }, [handleLogout]); // Depends only on handleLogout

  // handleDeleteAccount now shows the confirmation Modal
  const handleDeleteAccount = useCallback(() => {
    setIsModalVisible(true); // Show the modal
  }, []);

  // --- Render Logic ---
  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={false} />

      {loading && !refreshing ? (
        <ProfileSkeleton theme={paperTheme} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[paperTheme.colors.primary]}
              tintColor={paperTheme.colors.primary}
            />
          }>
          {/* --- User Info Header --- */}
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
                user?.avatarUrl
                  ? {uri: user.avatarUrl}
                  : require('../../assets/images/no-user-image.png')
              }
              style={styles.profileImage}
            />
            <Text variant="headlineMedium" style={styles.userName}>
              {user?.fullName || 'User Name'}
            </Text>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email || 'user@example.com'}
            </Text>
            {/* Account Type Caption removed as per previous code state */}
          </View>

          {/* --- Stats --- */}
          <Surface style={styles.statsSurface} elevation={1}>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{user?.documents?.length ?? 0}</Text>
              <Caption>Documents</Caption>
            </View>
            <Divider style={styles.statsDivider} />
            <View style={styles.statItem}>
              <Text variant="titleMedium">{user?.translations ?? 0}</Text>
              <Caption>Translations</Caption>
            </View>
            <Divider style={styles.statsDivider} />
            <View style={styles.statItem}>
              <Text variant="titleMedium">{user?.languages ?? 0}</Text>
              <Caption>Languages</Caption>
            </View>
          </Surface>

          {/* --- Account Information --- */}
          <List.Section
            title="Account Information"
            titleStyle={styles.sectionTitle}>
            <List.Item
              title="Full Name"
              description={user?.fullName || 'Not available'}
              left={() => <List.Icon icon="account-circle-outline" />}
            />
            <List.Item
              title="Email Address"
              description={user?.email || 'Not available'}
              left={() => <List.Icon icon="email-outline" />}
            />
            {/* Phone Number removed as per previous code state */}
          </List.Section>

          <Divider style={styles.divider} />

          {/* --- Security --- */}
          <List.Section title="Security" titleStyle={styles.sectionTitle}>
            <List.Item
              title="Change Password"
              left={() => <List.Icon icon="lock-outline" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Not Implemented',
                  'Change Password is not yet available.',
                );
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

          {/* --- Preferences --- */}
          <List.Section title="Preferences" titleStyle={styles.sectionTitle}>
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

          {/* --- Logout Button --- */}
          <Button
            icon="logout"
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={paperTheme.colors.primary}>
            Log Out
          </Button>

          <Divider style={styles.divider} />

          {/* --- Danger Zone --- */}
          <List.Section
            title="Danger Zone"
            titleStyle={[
              styles.sectionTitle,
              {color: paperTheme.colors.error},
            ]}>
            <Text style={styles.dangerDescription}>
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </Text>
            <Button
              icon="delete-forever-outline"
              mode="contained"
              onPress={handleDeleteAccount} // Calls function to show Modal
              buttonColor={paperTheme.colors.error}
              textColor={paperTheme.colors.onError}
              style={styles.deleteButton}>
              Delete Account
            </Button>
          </List.Section>
        </ScrollView>
      )}

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          if (!isDeleting) {
            setIsModalVisible(false);
          }
        }}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: paperTheme.colors.elevation.level3},
            ]}>
            {/* Optional: Add an Icon maybe? */}
            {/* <IconButton icon="alert-circle-outline" size={30} iconColor={paperTheme.colors.error} style={{alignSelf: 'center'}}/> */}
            <Text style={[styles.modalTitle, {color: paperTheme.colors.error}]}>
              Delete Account?
            </Text>
            <Paragraph
              style={[
                styles.modalMessage,
                {color: paperTheme.colors.onSurface},
              ]}>
              Are you absolutely sure you want to permanently delete your
              account? All associated data will be lost. This action cannot be
              undone.
            </Paragraph>
            <View style={styles.modalActions}>
              <Button
                mode="text"
                onPress={() => setIsModalVisible(false)}
                disabled={isDeleting}
                textColor={paperTheme.colors.onSurfaceVariant}
                style={{marginRight: 10}}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={performAccountDeletion}
                loading={isDeleting}
                disabled={isDeleting}
                buttonColor={paperTheme.colors.error}
                textColor={paperTheme.colors.onError}>
                Delete
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles ---
const createStyles = theme =>
  StyleSheet.create({
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
    // Styles for React Native Modal
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
      borderRadius: theme.roundness * 2, // Use theme rounding
      elevation: 8, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // backgroundColor is set dynamically using theme
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 15,
      // color is set dynamically using theme
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
      // color is set dynamically using theme
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });

// --- Skeleton Styles ---
const createSkeletonStyles = theme =>
  StyleSheet.create({
    container: {paddingHorizontal: 16, paddingTop: 0},
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      marginBottom: 20,
    },
    listSection: {marginBottom: 20},
  });
