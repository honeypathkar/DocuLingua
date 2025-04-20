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
  HelperText,
  Text, // Import Text if you decide to use it instead of Button
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {ChangePasswordUrl} from '../../../API'; // Ensure path is correct

// --- Real API Function ---
const changePasswordApi = async (email, oldPassword, newPassword, token) => {
  // ... (API logic remains unchanged)
  console.log('API Call: Changing Password for email:', email);
  if (!token) throw new Error('Authentication token is missing.');
  if (!email) throw new Error('User email is missing.');
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

  // --- Effects ---
  useEffect(() => {
    // ... (Keep existing useEffect for token and email check)
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
          ); // Ensure 'Login' is your login screen name
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
    // ... (Keep existing validation and API call logic)
    const oldPassTrimmed = oldPassword.trim();
    const newPassTrimmed = newPassword.trim();
    const confirmPassTrimmed = confirmPassword.trim();

    // Validations
    if (!userEmailFromRoute) {
      ToastAndroid.show('User email is missing.', ToastAndroid.SHORT);
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
    if (oldPassTrimmed === newPassTrimmed) {
      ToastAndroid.show(
        'New password cannot be the same as the old password.',
        ToastAndroid.SHORT,
      );
      return;
    }
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
      ToastAndroid.show('Authentication token is missing.', ToastAndroid.SHORT);
      return;
    }

    setIsUpdating(true);
    try {
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

  // --- Forgot Password Handler ---
  const handleForgotPasswordPress = useCallback(() => {
    // Navigate to the Forgot Password screen
    // Ensure 'ForgotPassword' is the correct name of your forgot password route
    navigation.navigate('ForgotPassword');
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
    !trimmedOldPassword || !trimmedNewPassword || !confirmPassword.trim();
  const isButtonDisabled =
    isUpdating ||
    !userToken ||
    !userEmailFromRoute ||
    isFormIncomplete ||
    newPasswordTooShort ||
    newPasswordIsSameAsOld ||
    passwordsDoNotMatch;

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
        {/* --- Forgot Password Button --- */}
        <Button
          mode="text"
          onPress={handleForgotPasswordPress}
          style={styles.forgotPasswordButton}
          labelStyle={styles.forgotPasswordLabel}
          compact // Reduces padding
          disabled={isUpdating} // Disable while updating
        >
          Forgot Password?
        </Button>

        {/* --- New Password Input --- */}
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          mode="outlined"
          style={styles.input} // Keep existing style
          secureTextEntry={!newPasswordVisible}
          disabled={isUpdating}
          error={newPasswordTooShort || newPasswordIsSameAsOld}
          right={
            <TextInput.Icon
              icon={newPasswordVisible ? 'eye-off' : 'eye'}
              onPress={() => setNewPasswordVisible(!newPasswordVisible)}
              disabled={isUpdating}
            />
          }
        />
        {/* HelperText for length validation (adjusted spacing) */}
        <HelperText
          type="error"
          visible={newPasswordTooShort}
          style={styles.newPassHelperText} // Use adjusted style
        >
          Password must be at least 6 characters.
        </HelperText>
        {/* HelperText for Old vs New Password Check (adjusted spacing) */}
        <HelperText
          type="error"
          visible={newPasswordIsSameAsOld}
          style={styles.newPassHelperText} // Use adjusted style
        >
          New password cannot be the same as the old password.
        </HelperText>

        {/* --- Confirm New Password Input --- */}
        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          style={styles.input} // Keep existing style
          secureTextEntry={!confirmPasswordVisible}
          disabled={isUpdating}
          error={passwordsDoNotMatch}
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
          style={styles.confirmPassHelperText} // Use specific style (might be same as default)
        >
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
          disabled={isButtonDisabled}
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
      marginBottom: 5, // Standard gap below input field
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end', // Position to the right
      marginTop: -5, // Pull slightly closer to the input above
      marginBottom: 10, // Add space before the next input field
    },
    forgotPasswordLabel: {
      fontSize: 13, // Slightly smaller text
      textTransform: 'none', // Prevent uppercase if theme does that
      letterSpacing: 0, // Reset letter spacing if needed
    },
    // Style for helper texts below "New Password" - reduced bottom margin
    newPassHelperText: {
      width: '100%',
      paddingLeft: 0,
      marginTop: 0,
      marginBottom: 2, // Reduced space below these helpers
      minHeight: 16, // Slightly reduced min height
    },
    // Style for helper text below "Confirm New Password"
    confirmPassHelperText: {
      width: '100%',
      paddingLeft: 0,
      marginTop: 0,
      marginBottom: 10, // Standard space below this helper before next element (if any)
      minHeight: 18,
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
      width: '100%', // Make main button full width
    },
  });

export default ChangePasswordScreen;
