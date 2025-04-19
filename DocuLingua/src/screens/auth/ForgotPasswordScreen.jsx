// ForgotPasswordScreen.js
import {useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  // Alert, // Using ToastAndroid
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
  Text,
} from 'react-native-paper';
import axios from 'axios'; // Import axios directly
// Assuming these URLs are correctly defined and exported from your API file
import {ForgotPasswordUrl, VerifyOTPAndResetPassword} from '../../../API';

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  // --- State ---
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // --- Helper to Extract Error Message ---
  const getErrorMessage = error => {
    if (error.response?.data?.message) {
      return error.response.data.message; // Message from backend response
    }
    if (error.message) {
      return error.message; // Network error or other axios/js error
    }
    return 'An unexpected error occurred. Please try again.'; // Default
  };

  // --- Handlers ---
  const handleSendOtp = useCallback(async () => {
    const trimmedEmail = email.trim();
    // Validation check still happens on press, but button is disabled if empty
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      ToastAndroid.show(
        'Please enter a valid email address.',
        ToastAndroid.SHORT,
      );
      return;
    }
    setIsSendingOtp(true);
    try {
      console.log(`Sending POST request to ${ForgotPasswordUrl}`);
      const response = await axios.post(
        ForgotPasswordUrl,
        {email: trimmedEmail},
        {timeout: 15000},
      );
      console.log('Send OTP Response:', response.data);
      setShowOtpFields(true);
      ToastAndroid.show(
        response.data.message || 'OTP sent successfully!',
        ToastAndroid.SHORT,
      );
    } catch (error) {
      console.error('Send OTP Error:', error);
      const message = getErrorMessage(error);
      ToastAndroid.show(message, ToastAndroid.LONG);
    } finally {
      setIsSendingOtp(false);
    }
  }, [email]);

  const handleResetPassword = useCallback(async () => {
    const trimmedOtp = otp.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedEmail = email.trim();

    // Validation check still happens on press, but button is disabled if invalid
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      ToastAndroid.show(
        'Please enter a valid 6-digit OTP.',
        ToastAndroid.SHORT,
      );
      return;
    }
    if (!trimmedNewPassword || trimmedNewPassword.length < 6) {
      ToastAndroid.show(
        'Password must be at least 6 characters long.',
        ToastAndroid.SHORT,
      );
      return;
    }

    setIsResetting(true);
    try {
      console.log(`Sending POST request to ${VerifyOTPAndResetPassword}`); // Changed log to POST as axios call is POST
      const response = await axios.post(
        // Changed to POST to match backend function name convention likely
        VerifyOTPAndResetPassword,
        {
          email: trimmedEmail,
          otp: trimmedOtp,
          newPassword: trimmedNewPassword,
        },
        {timeout: 15000},
      );
      console.log('Reset Password Response:', response.data);
      ToastAndroid.show(
        response.data.message || 'Password Reset Successful!',
        ToastAndroid.LONG,
      );
      navigation.navigate('Login');
    } catch (error) {
      console.error('Reset Password Error:', error);
      const message = getErrorMessage(error);
      ToastAndroid.show(message, ToastAndroid.LONG);
    } finally {
      setIsResetting(false);
    }
  }, [email, otp, newPassword, navigation]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const isLoading = isSendingOtp || isResetting;

  // --- Button Disabling Logic ---
  const trimmedEmail = email.trim();
  const isSendOtpDisabled = isSendingOtp || !trimmedEmail; // Disable if sending or email is empty

  const trimmedOtp = otp.trim();
  const trimmedNewPassword = newPassword.trim();
  // Disable if resetting, or OTP is invalid, or New Password is too short
  const isResetPasswordDisabled =
    isResetting ||
    !trimmedOtp ||
    trimmedOtp.length !== 6 ||
    !trimmedNewPassword ||
    trimmedNewPassword.length < 6;

  // --- Render ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} disabled={isLoading} />
        <Appbar.Content title="Forgot Password" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {/* --- Email Input --- */}
        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isSendingOtp || showOtpFields} // Disable if sending or OTP fields shown
        />
        <HelperText type="info" visible={!showOtpFields && !isSendingOtp}>
          Enter your registered email to receive an OTP.
        </HelperText>

        {/* --- OTP and New Password Fields (Conditional) --- */}
        {showOtpFields && (
          <>
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              disabled={isLoading}
              error={otp.length > 0 && otp.trim().length !== 6} // Show error state if partially filled and wrong length
            />
            <HelperText
              type="error"
              visible={otp.length > 0 && otp.trim().length !== 6}>
              OTP must be 6 digits.
            </HelperText>

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!passwordVisible}
              disabled={isLoading}
              error={newPassword.length > 0 && newPassword.trim().length < 6} // Show error state if partially filled and too short
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  disabled={isLoading}
                />
              }
            />
            <HelperText
              type="error"
              visible={newPassword.length > 0 && newPassword.trim().length < 6}>
              Password must be at least 6 characters.
            </HelperText>
          </>
        )}

        {/* --- Spacer --- */}
        <View style={{flex: 1}} />
      </ScrollView>

      {/* --- Bottom Button Area --- */}
      <View style={styles.bottomButtonContainer}>
        {!showOtpFields ? (
          <Button
            mode="contained"
            onPress={handleSendOtp}
            style={styles.button}
            icon="email-send-outline"
            // Use the new disabled logic for Send OTP button
            disabled={isSendOtpDisabled}
            loading={isSendingOtp}>
            {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            icon="lock-reset"
            // Use the new disabled logic for Reset Password button
            disabled={isResetPasswordDisabled}
            loading={isResetting}>
            {isResetting ? 'Resetting...' : 'Verify OTP & Reset Password'}
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Styles (Keep the same) ---
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
      marginBottom: 5,
    },
    helperText: {
      width: '100%',
      marginBottom: 10,
      paddingLeft: 0,
      minHeight: 18, // Give helper text a minimum height to reduce layout jumps
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

export default ForgotPasswordScreen;
