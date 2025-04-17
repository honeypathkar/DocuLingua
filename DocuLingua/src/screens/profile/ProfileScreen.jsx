import React, {useState, useMemo} from 'react';
// Import Image from react-native
import {StyleSheet, View, ScrollView, Alert, Image} from 'react-native';
import {
  Text,
  useTheme,
  // Avatar removed as we are using Image
  Surface,
  List,
  Divider,
  Switch,
  Button,
  Caption,
  IconButton, // Import IconButton
} from 'react-native-paper';
import AppHeader from '../../components/AppHeader'; // Assuming you have this

// --- (rest of the component code remains the same until createStyles) ---
export default function ProfileScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State for toggles (replace with actual logic using context/state management)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(theme.dark); // Initial state based on theme

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout Pressed');
    Alert.alert('Logout', 'Are you sure you want to log out?');
  };

  const handleDeleteAccount = () => {
    // Add your delete account logic here (should have confirmation)
    console.log('Delete Account Pressed');
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. Are you sure you want to delete your account?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.log('Account Deletion Confirmed'),
        },
      ],
    );
  };

  // Dummy function for theme toggling - replace with your theme switching logic
  const toggleDarkMode = () => {
    setIsDarkModeEnabled(!isDarkModeEnabled);
    // Here you would typically call a function from your Theme Context
    // to switch the actual theme (e.g., toggleTheme())
    console.log('Dark Mode Toggled - Implement actual theme switching');
  };

  const handleEditProfile = () => {
    // Add navigation or modal logic to edit profile
    console.log('Edit Profile Pressed');
    Alert.alert('Edit Profile', 'Navigate to profile edit screen.');
  };

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- User Info Header --- */}
        <View style={styles.header}>
          {/* Edit Icon Button */}
          <IconButton
            icon="pencil-outline" // Or just "pencil"
            size={24}
            style={styles.editIcon}
            onPress={handleEditProfile}
            iconColor={theme.colors.primary} // Style the icon color
            mode="contained-tonal" // Adds a subtle background matching theme
          />

          {/* Use Image component */}
          <Image
            // Use the require path from your previous code
            source={require('../../assets/images/no-user-image.png')}
            style={styles.profileImage} // Apply specific styles
          />
          <Text variant="headlineMedium" style={styles.userName}>
            Alex Johnson
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            alex.johnson@example.com
          </Text>
          <Caption style={styles.accountType}>Free Account</Caption>
        </View>

        {/* --- Stats --- */}
        {/* Surface now respects the ScrollView padding */}
        <Surface style={styles.statsSurface} elevation={1}>
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
        {/* List.Section titleStyle updated, List.Item default padding works */}
        <List.Section
          title="Account Information"
          titleStyle={styles.sectionTitle}>
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
          <List.Item
            title="Phone Number"
            description="+1 (555) 123-4567"
            left={() => <List.Icon icon="phone-outline" />}
          />
        </List.Section>

        {/* Divider now respects the ScrollView padding */}
        <Divider style={styles.divider} />

        {/* --- Security --- */}
        <List.Section title="Security" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Change Password"
            description="Last changed 3 months ago"
            left={() => <List.Icon icon="lock-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => console.log('Navigate to Change Password')} // Add navigation logic
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
            onPress={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)} // Make row clickable
          />
        </List.Section>

        <Divider style={styles.divider} />

        {/* --- Preferences --- */}
        <List.Section title="Preferences" titleStyle={styles.sectionTitle}>
          <List.Item
            title="Dark Mode"
            description={isDarkModeEnabled ? 'On' : 'Off'}
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkModeEnabled}
                onValueChange={toggleDarkMode}
              />
            )}
            onPress={toggleDarkMode} // Make row clickable
          />
          {/* Add other preferences like Notifications, Language here if needed */}
        </List.Section>

        <Divider style={styles.divider} />

        {/* --- Logout Button --- */}
        {/* Button now respects the ScrollView padding */}
        <Button
          icon="logout"
          mode="outlined" // Or "text"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor={theme.colors.primary} // Use theme color
        >
          Log Out
        </Button>

        <Divider style={styles.divider} />

        {/* --- Danger Zone --- */}
        {/* Title and description respect ScrollView padding */}
        <List.Section
          title="Danger Zone"
          titleStyle={[styles.sectionTitle, {color: theme.colors.error}]}>
          <Text style={styles.dangerDescription}>
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </Text>
          {/* Button now respects the ScrollView padding */}
          <Button
            icon="delete-forever-outline"
            mode="contained"
            onPress={handleDeleteAccount}
            buttonColor={theme.colors.error} // Use theme error color for background
            textColor={theme.colors.onError} // Use theme color for text on error background
            style={styles.deleteButton}>
            Delete Account
          </Button>
        </List.Section>
      </ScrollView>
    </View>
  );
}

// Define styles using theme
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16, // Added horizontal padding
      paddingBottom: 30,
    },
    header: {
      position: 'relative', // Needed for absolute positioning of children
      alignItems: 'center',
      paddingTop: 40, // Increased padding to avoid overlap with icon
      paddingBottom: 20,
      backgroundColor: theme.colors.surface,
      marginHorizontal: -16,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
      marginBottom: 15,
      // elevation: 2, // Can be added back if needed
    },
    editIcon: {
      position: 'absolute',
      top: 10, // Adjust position as needed
      right: 10, // Adjust position as needed
      // backgroundColor: theme.colors.surfaceVariant, // Optional background square
      // borderRadius: 8, // Optional rounded corners for background
      zIndex: 1, // Ensure icon is above other elements if needed
    },
    // New style for the Image
    profileImage: {
      width: 100, // Match the previous Avatar size
      height: 100, // Match the previous Avatar size
      borderRadius: 40, // Make it circular (half of width/height)
      marginBottom: 10,
      backgroundColor: '#fff', // Keep the white background if the image is transparent
      // borderWidth: 1, // Optional border
      borderColor: theme.colors.outlineVariant, // Optional border color
    },
    // avatar style removed
    userName: {
      fontWeight: 'bold',
    },
    userEmail: {
      color: theme.colors.onSurfaceVariant,
    },
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
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
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
    divider: {
      marginVertical: 10,
    },
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
    deleteButton: {
      marginTop: 10,
      marginBottom: 20,
    },
  });
