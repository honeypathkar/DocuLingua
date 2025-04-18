// src/screens/profile/ProfileScreen.jsx
import React, {useState, useMemo, useContext} from 'react'; // Import useContext
import {StyleSheet, View, ScrollView, Alert, Image} from 'react-native';
import {
  Text,
  useTheme, // Still use this for local styling if needed
  Surface,
  List,
  Divider,
  Switch, // Keep Switch import
  Button,
  Caption,
  IconButton,
} from 'react-native-paper';
import AppHeader from '../../components/AppHeader'; // Adjust path if needed

// Import the Theme Context Hook
import {useThemeContext} from '../../context/ThemeContext'; // Adjust path if needed

// ProfileScreen Component
export default function ProfileScreen() {
  const paperTheme = useTheme(); // Get current theme for styling within this screen
  const styles = useMemo(() => createStyles(paperTheme), [paperTheme]); // Use paperTheme for styles

  // Get theme state and toggle function from Context
  const {isDarkMode, toggleDarkMode} = useThemeContext();

  // State for other toggles (unrelated to theme)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  const handleLogout = () => {
    /* ... your logout logic ... */
    console.log('Logout Successfull');
  };
  const handleDeleteAccount = () => {
    /* ... your delete logic ... */
    console.log('Account Deleted');
  };
  const handleEditProfile = () => {
    /* ... your edit profile logic ... */
    console.log('Profile Edited');
  };

  // No local state or dummy function needed for dark mode anymore

  return (
    <View style={styles.container}>
      {/* Pass showSearchIcon={false} */}
      <AppHeader showSearchIcon={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- User Info Header --- */}
        <View style={styles.header}>
          {/* ... Edit Icon, Image, Name, Email, Caption ... */}
          <IconButton
            icon="pencil-outline"
            size={24}
            style={styles.editIcon}
            onPress={handleEditProfile}
            iconColor={paperTheme.colors.primary}
            mode="contained-tonal"
          />
          <Image
            source={require('../../assets/images/no-user-image.png')}
            style={styles.profileImage}
          />
          <Text variant="headlineMedium" style={styles.userName}>
            Alex Johnson
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            alex.johnson@example.com
          </Text>
          {/* <Caption style={styles.accountType}>Free Account</Caption> */}
        </View>

        {/* --- Stats --- */}
        <Surface style={styles.statsSurface} elevation={1}>
          {/* ... Stat Items ... */}
          <View style={styles.statItem}>
            <Text variant="titleMedium">23</Text>
            <Caption>Documents</Caption>
          </View>
          <Divider style={styles.statsDivider} />
          <View style={styles.statItem}>
            <Text variant="titleMedium">18</Text>
            <Caption>Translations</Caption>
          </View>
          <Divider style={styles.statsDivider} />
          <View style={styles.statItem}>
            <Text variant="titleMedium">4</Text>
            <Caption>Languages</Caption>
          </View>
        </Surface>

        {/* --- Account Information --- */}
        <List.Section
          title="Account Information"
          titleStyle={styles.sectionTitle}>
          {/* ... List Items ... */}
          <List.Item
            title="Full Name"
            description="Alex Johnson"
            left={() => <List.Icon icon="account-circle-outline" />}
          />
          <List.Item
            title="Email Address"
            description="alex.johnson@example.com"
            left={() => <List.Icon icon="email-outline" />}
          />
          {/* <List.Item
            title="Phone Number"
            description="+1 (555) 123-4567"
            left={() => <List.Icon icon="phone-outline" />}
          /> */}
        </List.Section>

        <Divider style={styles.divider} />

        {/* --- Security --- */}
        <List.Section title="Security" titleStyle={styles.sectionTitle}>
          {/* ... Change Password, 2FA Items ... */}
          <List.Item
            title="Change Password"
            description="Last changed 3 months ago"
            left={() => <List.Icon icon="lock-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => console.log('Navigate to Change Password')}
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
            // Use context state for description
            description={isDarkMode ? 'On' : 'Off'}
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => (
              <Switch
                // Use context state for value
                value={isDarkMode}
                // Use context function for toggling
                onValueChange={toggleDarkMode}
                // Use current paperTheme color for the switch styling
                color={paperTheme.colors.primary}
              />
            )}
            // Use context function for toggling when row is pressed
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
          titleStyle={[styles.sectionTitle, {color: paperTheme.colors.error}]}>
          {/* ... Danger Description, Delete Button ... */}
          <Text style={styles.dangerDescription}>
            Permanently delete your account and all associated data. This action
            cannot be undone.
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
      </ScrollView>
    </View>
  );
}

// Define styles using theme (Keep createStyles function same as before)
const createStyles = theme =>
  StyleSheet.create({
    /* ... your existing styles ... */
    container: {flex: 1, backgroundColor: theme.colors.background},
    scrollContent: {paddingHorizontal: 16, paddingBottom: 30},
    header: {
      position: 'relative',
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
      marginHorizontal: -16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
      marginBottom: 15,
    },
    editIcon: {position: 'absolute', top: 10, right: 10, zIndex: 1},
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      // backgroundColor: theme.colors.surfaceVariant,
      // borderColor: theme.colors.outlineVariant,
      // borderWidth: 1,
    }, // Adjusted radius and bg
    userName: {fontWeight: 'bold', color: theme.colors.onSurface}, // Use theme color
    userEmail: {color: theme.colors.onSurfaceVariant},
    accountType: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      backgroundColor: theme.colors.primaryContainer,
      color: theme.colors.onPrimaryContainer,
      borderRadius: theme.roundness,
      overflow: 'hidden',
    },
    statsSurface: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 15,
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.primaryContainer,
      marginBottom: 15,
    }, // Changed to secondary container
    statItem: {alignItems: 'center', flex: 1},
    statsDivider: {
      width: 1,
      height: '80%',
      alignSelf: 'center',
      backgroundColor: theme.colors.outlineVariant,
    },
    sectionTitle: {
      marginTop: 10,
      marginBottom: 5,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    divider: {marginVertical: 10, backgroundColor: theme.colors.outlineVariant}, // Use theme color
    logoutButton: {
      marginTop: 15,
      marginBottom: 10,
      borderColor: theme.colors.primary,
    },
    dangerDescription: {
      marginBottom: 10,
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      textAlign: 'left',
    },
    deleteButton: {marginTop: 10, marginBottom: 20},
  });
