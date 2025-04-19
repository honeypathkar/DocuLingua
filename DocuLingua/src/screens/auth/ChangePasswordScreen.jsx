// ChangePasswordScreen.js
import {useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ToastAndroid,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  useTheme,
  HelperText,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // If auth token needed

// --- Placeholder API Function ---
// Replace with your actual API call
// Assume it requires authentication (token)
const changePasswordApi = async (oldPassword, newPassword, token) => {
  console.log('API Call: Changing Password');
  console.log(
    'Old:',
    oldPassword,
    'New:',
    newPassword,
    'Token:',
    token ? 'Present' : 'Missing',
  );
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate success/failure
  if (!token) {
    throw new Error('Authentication required.');
  }
  if (oldPassword === 'oldpassword123' && newPassword.length >= 6) {
    // Example validation
    return {success: true, message: 'Password changed successfully!'};
  } else if (oldPassword !== 'oldpassword123') {
    throw new Error('Incorrect old password.');
  } else {
    throw new Error('New password is too short.');
  }
};
// --- End Placeholder API Function ---

const ChangePasswordScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  // --- State ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userToken, setUserToken] = useState(null); // Store auth token if needed

  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // --- Effects --- (Get Auth Token - Adapt from EditProfileScreen)
  useEffect(() => {
    const getToken = async () => {
      try {
        // IMPORTANT: Use the same key you used during login to store the token
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        } else {
          // Handle missing token (e.g., force logout or show error)
          console.error('Auth Error: Token not found for Change Password.');
          Alert.alert(
            'Authentication Error',
            'Your session seems to have expired. Please log in again to change your password.',
            [{text: 'OK', onPress: () => navigation.navigate('Login')}], // Adjust as needed
          );
        }
      } catch (error) {
        console.error('AsyncStorage Error:', error);
        Alert.alert('Error', 'Failed to retrieve session token.');
      }
    };
    getToken();
  }, [navigation]);

  // --- Handlers ---
  const handleChangePassword = useCallback(async () => {
    // Validation
    if (!oldPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert(
        'Validation Error',
        'New password must be at least 6 characters long.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }
    if (!userToken) {
      // Check if token was loaded
      Alert.alert(
        'Error',
        'Authentication token is missing. Cannot change password.',
      );
      return;
    }

    setIsUpdating(true);
    try {
      const response = await changePasswordApi(
        oldPassword.trim(),
        newPassword.trim(),
        userToken,
      );
      if (response.success) {
        ToastAndroid.show(
          response.message || 'Password Changed Successfully!',
          ToastAndroid.LONG,
        );
        // Optionally clear fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Navigate back or to profile screen
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Change Password Error:', error);
      Alert.alert(
        'Change Password Failed',
        error.message || 'An unexpected error occurred.',
      );
    } finally {
      setIsUpdating(false);
    }
  }, [oldPassword, newPassword, confirmPassword, userToken, navigation]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // --- Render ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} disabled={isUpdating} />
        <Appbar.Content title="Change Password" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {/* --- Old Password Input --- */}
        <TextInput
          label="Current Password"
          value={oldPassword}
          onChangeText={setOldPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!oldPasswordVisible}
          disabled={isUpdating}
          right={
            <TextInput.Icon
              icon={oldPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setOldPasswordVisible(!oldPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        <HelperText type="info" visible={true} style={styles.helperText}>
          Enter your current password.
        </HelperText>

        {/* --- New Password Input --- */}
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!newPasswordVisible}
          disabled={isUpdating}
          right={
            <TextInput.Icon
              icon={newPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setNewPasswordVisible(!newPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        <HelperText
          type="error"
          visible={newPassword.length > 0 && newPassword.length < 6}
          style={styles.helperText}>
          Password must be at least 6 characters.
        </HelperText>

        {/* --- Confirm New Password Input --- */}
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!confirmPasswordVisible}
          disabled={isUpdating}
          right={
            <TextInput.Icon
              icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        <HelperText
          type="error"
          visible={
            confirmPassword.length > 0 && newPassword !== confirmPassword
          }
          style={styles.helperText}>
          Passwords do not match.
        </HelperText>

        {/* --- Spacer to push button down --- */}
        <View style={{flex: 1}} />
      </ScrollView>

      {/* --- Bottom Button Area --- */}
      <View style={styles.bottomButtonContainer}>
        <Button
          mode="contained"
          onPress={handleChangePassword}
          style={styles.button}
          icon="lock-check" // Changed icon
          disabled={isUpdating || !userToken} // Also disable if token isn't loaded
          loading={isUpdating}>
          {isUpdating ? 'Updating...' : 'Change Password'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Styles (Identical to ForgotPasswordScreen, reused for consistency) ---
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 100, // Extra padding at bottom
    },
    input: {
      width: '100%',
      marginBottom: 5,
    },
    helperText: {
      width: '100%',
      marginBottom: 10,
      paddingLeft: 0,
    },
    bottomButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 30 : 20,
      paddingTop: 10,
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,
    },
    button: {
      paddingVertical: 8,
    },
  });

export default ChangePasswordScreen;
