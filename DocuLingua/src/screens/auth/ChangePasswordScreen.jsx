// ChangePasswordScreen.js
import {useNavigation, useRoute} from '@react-navigation/native';
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
  HelperText, // Make sure HelperText is imported
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ChangePasswordUrl} from '../../../API';

// --- Real API Function (remains the same) ---
const changePasswordApi = async (email, oldPassword, newPassword, token) => {
  // ... (API logic from previous step remains unchanged)
  console.log('API Call: Changing Password for email:', email);
  if (!token) {
    throw new Error('Authentication token is missing.');
  }
  if (!email) {
    throw new Error('User email is missing.');
  }

  const requestBody = {
    email: email,
    oldPassword: oldPassword,
    newPassword: newPassword,
  };

  try {
    const response = await axios.put(ChangePasswordUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    if (response.status === 200 && response.data) {
      console.log('API Response:', response.data);
      return {
        success: true,
        message: response.data.message || 'Password updated successfully',
      };
    } else {
      throw new Error(
        response.data?.message ||
          'An unexpected response received from the server.',
      );
    }
  } catch (error) {
    console.error('Axios Change Password Error:', error);
    const backendMessage = error.response?.data?.message;

    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      throw new Error(
        backendMessage ||
          `Server responded with status ${error.response.status}`,
      );
    } else if (error.request) {
      console.error('Error Request:', error.request);
      throw new Error(
        'Could not connect to the server. Please check your network.',
      );
    } else {
      console.error('Error Message:', error.message);
      throw new Error(
        error.message || 'An error occurred while setting up the request.',
      );
    }
  }
};
// --- End API Function ---

const ChangePasswordScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const route = useRoute();

  const userEmailFromRoute = route.params?.email;

  // --- State ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [userToken, setUserToken] = useState(null);

  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // --- Effects --- (Keep Alert for critical setup errors)
  useEffect(() => {
    // ... (useEffect logic remains the same)
    const getToken = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        } else {
          console.error('Auth Error: Token not found.');
          Alert.alert(
            'Authentication Error',
            'Your session seems to have expired. Please log in again.',
            [{text: 'OK', onPress: () => navigation.navigate('Login')}],
          );
        }
      } catch (error) {
        console.error('AsyncStorage Error:', error);
        Alert.alert('Error', 'Failed to retrieve session token.');
      }
    };

    if (!userEmailFromRoute) {
      console.error(
        'Navigation Error: Email not provided in route parameters.',
      );
      Alert.alert(
        'Error',
        'Required user information (email) is missing. Cannot proceed.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }

    getToken();
  }, [navigation, userEmailFromRoute]);

  // --- Handlers ---
  const handleChangePassword = useCallback(async () => {
    // Trim passwords once for efficiency
    const oldPassTrimmed = oldPassword.trim();
    const newPassTrimmed = newPassword.trim();
    const confirmPassTrimmed = confirmPassword.trim();

    // Validation using ToastAndroid
    if (!userEmailFromRoute) {
      ToastAndroid.show(
        'User email is missing. Cannot change password.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (!oldPassTrimmed) {
      ToastAndroid.show(
        'Please enter your current password.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (!newPassTrimmed) {
      ToastAndroid.show('Please enter a new password.', ToastAndroid.SHORT);
      return;
    }
    if (newPassTrimmed.length < 6) {
      ToastAndroid.show(
        'New password must be at least 6 characters long.',
        ToastAndroid.SHORT,
      );
      return;
    }
    // ---> New Validation Check <---
    if (oldPassTrimmed === newPassTrimmed) {
      ToastAndroid.show(
        'New password cannot be the same as the old password.',
        ToastAndroid.SHORT,
      );
      return;
    }
    // ---> End New Validation Check <---
    if (!confirmPassTrimmed) {
      ToastAndroid.show(
        'Please confirm your new password.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (newPassTrimmed !== confirmPassTrimmed) {
      ToastAndroid.show('New passwords do not match.', ToastAndroid.SHORT);
      return;
    }
    if (!userToken) {
      ToastAndroid.show(
        'Authentication token is missing. Cannot change password.',
        ToastAndroid.SHORT,
      );
      return;
    }

    setIsUpdating(true);
    try {
      // Use trimmed passwords for the API call
      const response = await changePasswordApi(
        userEmailFromRoute,
        oldPassTrimmed,
        newPassTrimmed,
        userToken,
      );

      ToastAndroid.show(
        response.message || 'Password Changed Successfully!',
        ToastAndroid.LONG,
      );

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Handle Change Password Error:', error);
      ToastAndroid.show(
        error.message || 'An unexpected error occurred.',
        ToastAndroid.LONG,
      );
    } finally {
      setIsUpdating(false);
    }
  }, [
    oldPassword,
    newPassword,
    confirmPassword,
    userToken,
    userEmailFromRoute,
    navigation,
  ]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // --- Derived State for Validation Feedback ---
  const trimmedOldPassword = oldPassword.trim();
  const trimmedNewPassword = newPassword.trim();
  const passwordsNotEmpty =
    trimmedOldPassword.length > 0 && trimmedNewPassword.length > 0;
  const newPasswordIsSameAsOld =
    passwordsNotEmpty && trimmedOldPassword === trimmedNewPassword;
  const newPasswordTooShort =
    trimmedNewPassword.length > 0 && trimmedNewPassword.length < 6;
  const passwordsDoNotMatch =
    confirmPassword.length > 0 && trimmedNewPassword !== confirmPassword.trim();

  // --- Dynamic Button Disabling Logic ---
  const isFormIncomplete =
    !trimmedOldPassword || // Use trimmed values for check
    !trimmedNewPassword ||
    !confirmPassword.trim();

  // Add the new validation state to the disabled check
  const isButtonDisabled =
    isUpdating ||
    !userToken ||
    !userEmailFromRoute ||
    isFormIncomplete ||
    newPasswordTooShort || // Disable if new password is too short
    newPasswordIsSameAsOld || // Disable if new password is same as old
    passwordsDoNotMatch; // Disable if new passwords don't match

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
          // Add error prop based on validation if needed, e.g., error={someOldPasswordErrorCondition}
          right={
            <TextInput.Icon
              icon={oldPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setOldPasswordVisible(!oldPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        {/* Optional HelperText */}

        {/* --- New Password Input --- */}
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!newPasswordVisible}
          disabled={isUpdating}
          error={newPasswordTooShort || newPasswordIsSameAsOld} // Show error state on input
          right={
            <TextInput.Icon
              icon={newPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setNewPasswordVisible(!newPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        {/* HelperText for length validation */}
        <HelperText
          type="error"
          visible={newPasswordTooShort}
          style={styles.helperText}>
          Password must be at least 6 characters.
        </HelperText>
        {/* ---> New HelperText for Old vs New Password Check <--- */}
        <HelperText
          type="error"
          visible={newPasswordIsSameAsOld} // Show when new password matches old
          style={styles.helperText}>
          New password cannot be the same as the old password.
        </HelperText>
        {/* ---> End New HelperText <--- */}

        {/* --- Confirm New Password Input --- */}
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry={!confirmPasswordVisible}
          disabled={isUpdating}
          error={passwordsDoNotMatch} // Show error state on input
          right={
            <TextInput.Icon
              icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        {/* HelperText for password match validation */}
        <HelperText
          type="error"
          visible={passwordsDoNotMatch}
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
          icon="lock-check"
          disabled={isButtonDisabled} // Use the updated disabled logic
          loading={isUpdating}>
          {isUpdating ? 'Updating...' : 'Change Password'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Styles ---
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 100,
    },
    input: {
      width: '100%',
      marginBottom: 5, // Keep smaller gap just below input
    },
    helperText: {
      width: '100%',
      // marginBottom: 10, // Add space below helper text before next input
      paddingLeft: 0,
      marginTop: 0, // Adjust if needed
      minHeight: 18, // Optional: Give it a minimum height to prevent layout jumps when appearing/disappearing
    },
    bottomButtonContainer: {
      // ... (style remains the same)
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
