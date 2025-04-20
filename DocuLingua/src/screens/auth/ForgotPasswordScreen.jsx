// ForgotPasswordScreen.js
import {useNavigation} from '@react-navigation/native';
import React, {useState, useMemo, useCallback, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
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
import axios from 'axios';
import {ForgotPasswordUrl, SendOtpUrl} from '../../../API'; // Adjust path if needed

const RESEND_TIMEOUT_SECONDS = 30;

const ForgotPasswordScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const timerIntervalRef = useRef(null);

  // --- State ---
  // ... (keep all existing state variables)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIMEOUT_SECONDS);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // --- Timer Logic ---
  // ... (keep existing timer logic)
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startResendTimer = useCallback(() => {
    // ... (keep existing implementation)
    setIsResendDisabled(true);
    setResendTimer(RESEND_TIMEOUT_SECONDS);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setResendTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setIsResendDisabled(false);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);

  // --- Helper to Extract Error Message ---
  // ... (keep existing error message helper)
  const getErrorMessage = error => {
    // ... (keep existing implementation)
    if (error.response?.data?.message) return error.response.data.message;
    if (error.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
  };

  // --- API Call Function (Reusable for Send/Resend) ---
  // ... (keep existing API call function)
  const performSendOtp = useCallback(
    async (isResend = false) => {
      // ... (keep existing implementation)
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@')) {
        ToastAndroid.show(
          'Please enter a valid email address.',
          ToastAndroid.SHORT,
        );
        return false;
      }
      const setLoading = isResend ? setIsResendingOtp : setIsSendingOtp;
      setLoading(true);
      try {
        console.log(
          `Sending POST request to ${SendOtpUrl} for email: ${trimmedEmail}`,
        );
        const response = await axios.post(
          SendOtpUrl,
          {email: trimmedEmail},
          {timeout: 15000},
        );
        console.log('Send/Resend OTP Response:', response.data);
        if (!isResend) {
          setShowOtpFields(true);
        }
        startResendTimer();
        ToastAndroid.show(
          response.data.message ||
            `OTP ${isResend ? 'resent' : 'sent'} successfully!`,
          ToastAndroid.SHORT,
        );
        return true;
      } catch (error) {
        console.error(`Send${isResend ? ' Resend' : ''} OTP Error:`, error);
        const message = getErrorMessage(error);
        ToastAndroid.show(message, ToastAndroid.LONG);
        if (isResend) {
          setIsResendDisabled(false);
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [email, startResendTimer],
  );

  // --- Handlers ---
  // ... (keep existing handlers: handleSendOtp, handleResendOtp, handleResetPassword, handleGoBack)
  const handleSendOtp = useCallback(() => {
    performSendOtp(false);
  }, [performSendOtp]);
  const handleResendOtp = useCallback(() => {
    if (isResendDisabled || isResendingOtp) return;
    performSendOtp(true);
  }, [performSendOtp, isResendDisabled, isResendingOtp]);

  const handleResetPassword = useCallback(async () => {
    const trimmedOtp = otp.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedEmail = email.trim();

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
      console.log(`Sending POST request to ${ForgotPasswordUrl}`);
      const response = await axios.post(
        ForgotPasswordUrl,
        {
          email: trimmedEmail,
          otp: trimmedOtp,
          newPassword: trimmedNewPassword,
        },
        {timeout: 15000},
      );
      console.log('Reset Password Response:', response.data);

      // Stop timer if reset is successful
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      ToastAndroid.show(
        response.data.message || 'Password Reset Successful!',
        ToastAndroid.LONG,
      );
      navigation.goBack(); // Or your desired login screen name
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

  // Combined loading state
  const isLoading = isSendingOtp || isResetting || isResendingOtp;

  // --- Button Disabling Logic ---
  // ... (keep existing button disabling logic)
  const trimmedEmail = email.trim();
  const isSendOtpDisabled = isLoading || !trimmedEmail || showOtpFields;
  const trimmedOtp = otp.trim();
  const trimmedNewPassword = newPassword.trim();
  const isResetPasswordDisabled =
    isLoading ||
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
          disabled={isLoading || showOtpFields}
        />
        {/* Info text when email field is active */}
        <HelperText
          type="info"
          visible={!showOtpFields && !isLoading}
          style={styles.helperText}>
          Enter your registered email to receive an OTP.
        </HelperText>
        {/* >>> ADDED SPAM CHECK HELPER TEXT <<< */}
        <HelperText
          type="info"
          visible={!showOtpFields && !isLoading}
          style={styles.spamHelperText}>
          Please also check your spam/junk folder.
        </HelperText>
        {/* --- End of Added Text --- */}

        {/* --- OTP and New Password Fields (Conditional) --- */}
        {showOtpFields && (
          <>
            {/* ... (keep existing OTP and New Password inputs/helpers) ... */}
            <TextInput
              label="OTP"
              value={otp}
              onChangeText={setOtp}
              mode="outlined"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={6}
              disabled={isLoading}
              error={otp.length > 0 && otp.trim().length !== 6}
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
              error={newPassword.length > 0 && newPassword.trim().length < 6}
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
      {/* ... (keep existing bottom button container logic) ... */}
      <View style={styles.bottomButtonContainer}>
        {!showOtpFields ? (
          <Button
            mode="contained"
            onPress={handleSendOtp}
            style={styles.button}
            icon="email-send-outline"
            disabled={isSendOtpDisabled}
            loading={isSendingOtp}>
            {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              icon="lock-reset"
              disabled={isResetPasswordDisabled}
              loading={isResetting}>
              {isResetting ? 'Resetting...' : 'Verify OTP & Reset Password'}
            </Button>
            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Text style={styles.timerText}>
                  {' '}
                  Resend OTP in {resendTimer}s{' '}
                </Text>
              ) : (
                <Button
                  mode="text"
                  onPress={handleResendOtp}
                  disabled={isResendDisabled || isLoading}
                  loading={isResendingOtp}
                  compact
                  labelStyle={styles.resendLabel}>
                  {isResendingOtp ? 'Resending...' : 'Resend OTP'}
                </Button>
              )}
            </View>
          </>
        )}
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
      paddingBottom: 120,
    },
    input: {
      width: '100%',
      marginBottom: 5, // Keep margin for input
    },
    helperText: {
      // Style for the *first* helper text
      width: '100%',
      paddingLeft: 0,
      marginBottom: 0, // Remove bottom margin from first helper
      minHeight: 18,
    },
    spamHelperText: {
      // Style for the *second* (spam) helper text
      width: '100%',
      paddingLeft: 0,
      paddingTop: 0, // Reduce top padding if needed
      minHeight: 18, // Keep min height consistent
      marginBottom: 10, // Add margin *after* the spam text
    },
    bottomButtonContainer: {
      // ... (keep existing styles)
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
      alignItems: 'center',
    },
    button: {
      paddingVertical: 8,
      width: '100%',
    },
    resendContainer: {
      marginTop: 10,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    resendLabel: {
      fontSize: 14,
      marginHorizontal: 0,
      marginVertical: 0,
    },
  });

export default ForgotPasswordScreen;
