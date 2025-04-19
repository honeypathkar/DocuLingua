// ForgotPasswordScreen.js
import {useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useCallback} from 'react';
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
  Text, // Added for potential instructions
} from 'react-native-paper';

// --- Placeholder API Functions ---
// Replace these with your actual API calls
const sendOtpApi = async email => {
  console.log('API Call: Sending OTP to', email);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate success/failure
  if (email.includes('@')) {
    return {success: true, message: 'OTP sent successfully!'};
  } else {
    throw new Error('Invalid email format for OTP');
  }
};

const verifyOtpAndResetApi = async (email, otp, newPassword) => {
  console.log('API Call: Verifying OTP and Resetting Password for', email);
  console.log('OTP:', otp, 'New Password:', newPassword);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Simulate success/failure
  if (otp === '123456' && newPassword.length >= 6) {
    // Example validation
    return {success: true, message: 'Password reset successfully!'};
  } else {
    throw new Error('Invalid OTP or password too short.');
  }
};
// --- End Placeholder API Functions ---

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  // --- State ---
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpFields, setShowOtpFields] = useState(false); // Control visibility
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // --- Handlers ---
  const handleSendOtp = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) {
      // Basic validation
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const response = await sendOtpApi(email.trim());
      if (response.success) {
        setShowOtpFields(true); // Show OTP and Password fields
        ToastAndroid.show(response.message || 'OTP sent!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred while sending OTP.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  }, [email]);

  const handleResetPassword = useCallback(async () => {
    if (!otp.trim() || otp.length !== 6) {
      // Example OTP length validation
      Alert.alert('Validation Error', 'Please enter a valid 6-digit OTP.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      // Example password length validation
      Alert.alert(
        'Validation Error',
        'Password must be at least 6 characters long.',
      );
      return;
    }

    setIsResetting(true);
    try {
      const response = await verifyOtpAndResetApi(
        email.trim(),
        otp.trim(),
        newPassword.trim(),
      );
      if (response.success) {
        ToastAndroid.show(
          response.message || 'Password Reset Successful!',
          ToastAndroid.LONG,
        );
        // Navigate to Login screen or wherever appropriate after reset
        navigation.navigate('Login'); // <-- Adjust navigation target if needed
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred during password reset.',
      );
    } finally {
      setIsResetting(false);
    }
  }, [email, otp, newPassword, navigation]);

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const isLoading = isSendingOtp || isResetting; // Combined loading state for disabling inputs

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
          disabled={showOtpFields || isLoading} // Disable after OTP sent or during loading
        />
        <HelperText type="info" visible={!showOtpFields}>
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
              maxLength={6} // Assuming 6-digit OTP
              disabled={isLoading}
            />
            <HelperText type="info" visible={true}>
              Enter the 6-digit OTP sent to your email.
            </HelperText>

            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!passwordVisible}
              disabled={isLoading}
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
              visible={newPassword.length > 0 && newPassword.length < 6}>
              Password must be at least 6 characters.
            </HelperText>
          </>
        )}

        {/* --- Spacer to push button down when fields appear --- */}
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
            disabled={isSendingOtp}
            loading={isSendingOtp}>
            {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            icon="lock-reset"
            disabled={isResetting}
            loading={isResetting}>
            {isResetting ? 'Resetting...' : 'Verify OTP & Reset Password'}
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

// --- Styles (Adapted from EditProfileScreen) ---
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1, // Ensure content can push button down
      padding: 20,
      paddingBottom: 100, // Extra padding at bottom to ensure space above button
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

export default ForgotPasswordScreen;
