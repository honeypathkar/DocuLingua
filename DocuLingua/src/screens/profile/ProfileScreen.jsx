import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
  Platform,
  Modal,
  Share,
  ToastAndroid,
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
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import AppHeader from '../../components/AppHeader';
import {useThemeContext} from '../../context/ThemeContext';
import {DeleteAccountUrl} from '../../../API';
import useUserStore from '../../store/userStore';
import {ProfileSkeleton} from '../../components/ProfileSkeleton';

export default function ProfileScreen() {
  const paperTheme = useTheme();
  const styles = useMemo(() => createStyles(paperTheme), [paperTheme]);
  const navigation = useNavigation();
  const {user, loading, error, fetchDetails} = useUserStore();

  const [refreshing, setRefreshing] = useState(false);
  const {isDarkMode, toggleDarkMode} = useThemeContext();
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (error) {
      if (error.type === 'AUTH') {
        Alert.alert(
          error.message || 'Authentication Error',
          'Please log in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Welcome', {screen: 'Login'});
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error Loading Profile',
          error.message || 'Could not load data.',
        );
      }
    }
  }, [error, navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
      return () => {};
    }, [fetchDetails]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDetails();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDetails]);

  const handleLogout = useCallback(async () => {
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
      navigation.navigate('EditProfile', {user: user});
    } else {
      Alert.alert('Please wait', 'User data is still loading.');
    }
  }, [navigation, user]);

  const performAccountDeletion = useCallback(async () => {
    setIsDeleting(true);
    let userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) return;
    try {
      const response = await axios.delete(DeleteAccountUrl, {
        headers: {Authorization: `Bearer ${userToken}`},
      });
      if (response.status === 200 || response.status === 204) {
        setIsModalVisible(false);
        ToastAndroid.show('Account Deleted Successfully.', ToastAndroid.SHORT);
        handleLogout();
      }
    } catch (error) {
      let errorMessage = 'An error occurred.';
      Alert.alert('Deletion Failed', errorMessage);
      setIsModalVisible(false);
    } finally {
      setIsDeleting(false);
    }
  }, [handleLogout]);

  const handleDeleteAccount = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: `Try the best app for document and image translation for free and security. https://drive.google.com/drive/folders/1pIE8GczcQsXykKmlXdVCjrTBN6kM-KGL?usp=sharing`,
      });
    } catch (error) {}
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={false} />

      {loading && !refreshing && !user ? (
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
          {user ? (
            <>
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

              <Surface style={styles.statsSurface} elevation={1}>
                <View style={styles.statItem}>
                  <Text variant="titleMedium">
                    {user.documents?.length ?? 0}
                  </Text>
                  <Caption>Documents</Caption>
                </View>
                <Divider style={styles.statsDivider} />
                <View style={styles.statItem}>
                  <Text variant="titleMedium">
                    {user.language?.length ?? 0}
                  </Text>
                  <Caption>Languages</Caption>
                </View>
              </Surface>

              <List.Section
                title="Account Information"
                titleStyle={styles.sectionTitle}>
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
                <List.Item
                  title="Change Password"
                  left={() => <List.Icon icon="lock-outline" />}
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() => {
                    navigation.navigate('ChangePassword', {email: user?.email});
                  }}
                />
              </List.Section>
              <Divider style={styles.divider} />
              <List.Section
                title="Preferences"
                titleStyle={styles.sectionTitle}>
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
                <List.Item
                  title="Share This App"
                  left={() => <List.Icon icon="share-variant" />}
                  onPress={handleShareApp}
                />
              </List.Section>
              <Divider style={styles.divider} />
              <Button
                icon="logout"
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor={paperTheme.colors.primary}>
                Log Out
              </Button>
              <Divider style={styles.divider} />
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
                  onPress={handleDeleteAccount}
                  buttonColor={paperTheme.colors.error}
                  textColor={paperTheme.colors.onError}
                  style={styles.deleteButton}>
                  Delete Account
                </Button>
              </List.Section>
            </>
          ) : (
            !loading && (
              <View style={styles.centeredMessage}>
                <Text>Could not load profile data.</Text>
              </View>
            )
          )}
        </ScrollView>
      )}

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
      marginBottom: 20,
    },
    editIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1,
      backgroundColor: theme.colors.primaryContainer,
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
      backgroundColor: theme.colors.primaryContainer,
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
  });
