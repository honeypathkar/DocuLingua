// screens/auth/RegisterScreen.jsx
import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert, // Keep Alert for potential non-Android feedback
  ToastAndroid,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Checkbox,
  useTheme,
  Appbar,
} from 'react-native-paper';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SignupUrl} from '../../../API'; // Import API endpoint
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GoogleLoginSignupUrl} from '../../../API'; // Import Google API endpoint
import useUserStore from '../../store/userStore';
import {GOOGLE_CLIENT_ID} from '@env';

const RegisterScreen = ({navigation}) => {
  // --- State ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // <-- Add loading state
  const [googleLoading, setGoogleLoading] = useState(false);
  const {fetchDetails} = useUserStore();

  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // --- Functions ---
  const handleRegister = async () => {
    // --- Basic Validation ---
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      // Alert.alert('Validation Error', 'Please fill in all fields.');
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }
    if (password !== confirmPassword) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }

    setLoading(true); // <-- Set loading true
    try {
      console.log('Registering with URL:', SignupUrl);
      const response = await axios.post(
        SignupUrl,
        {
          fullName: `${firstName.trim()} ${lastName.trim()}`, // Trim names
          email: email.trim(), // Trim email
          password: password, // Password likely shouldn't be trimmed
        },
        {timeout: 10000},
      );

      if (response.status === 201 && response.data?.token) {
        // Check for 201 Created and token
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        // No need to store rememberMe on register usually
        // await AsyncStorage.setItem('rememberMe', 'false'); // Default to not remember

        if (Platform.OS === 'android') {
          ToastAndroid.show('Registration Successful!', ToastAndroid.SHORT);
        } else {
          Alert.alert('Success', 'Account created!');
        }

        // Replace stack with MainApp so user can't go back to Register/Login easily
        navigation.reset({index: 0, routes: [{name: 'MainApp'}]});
        fetchDetails();
      } else {
        // Handle cases where API returns success status but indicates failure logically
        const errorMessage =
          response.data?.message || 'Registration failed. Please try again.';
        console.error(
          'Registration failed (API Logic):',
          response.status,
          response.data,
        );
        if (Platform.OS === 'android') {
          ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } else {
          Alert.alert('Registration Failed', errorMessage);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration.';
      if (error.response) {
        // Handle specific errors like 409 Conflict (User exists)
        if (error.response.status === 409) {
          errorMessage =
            error.response.data?.message ||
            'An account with this email already exists.';
        } else {
          errorMessage =
            error.response.data?.message ||
            `Registration failed (Status: ${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    } finally {
      setLoading(false); // <-- Set loading false in finally
    }
  };

  const toggleAgreeToTerms = () => setAgreeToTerms(!agreeToTerms);
  const navigateToLogin = () => {
    if (!loading) {
      // Prevent navigation while loading
      navigation.navigate('Login');
    }
  };

  const handleLoginError = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Login Failed', message);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
    });
  }, []);

  async function onGoogleButtonPress() {
    console.log('Google Sign-In Button Pressed');
    setGoogleLoading(true);

    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      await GoogleSignin.signOut(); // Ensures a fresh sign-in
      const result = await GoogleSignin.signIn();

      console.log('Google Sign-In Response:', result);

      const idToken = result?.data?.idToken;
      if (!idToken) throw new Error('No ID token found');

      console.log('ID Token:', idToken);

      const response = await axios.post(
        GoogleLoginSignupUrl,
        {
          idToken,
        },
        {timeout: 10000},
      );
      console.log('Google Login Response:', response);
      if (response.status === 200 && response.data?.token) {
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        // await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));
        ToastAndroid.show('Google Login Successful.', ToastAndroid.SHORT);
        navigation.replace('MainApp');
        fetchDetails();
      } else {
        const errorMessage =
          response.data?.message || 'Google Sign-In failed. Please try again.';
        handleLoginError(errorMessage);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);

      if (error.code === 'SIGN_IN_CANCELLED') {
        ToastAndroid.show('Google Sign-In Cancelled', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show(
          `Google Sign-In Failed: ${error.message || 'Please try again.'}`,
          ToastAndroid.LONG,
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Manual Appbar */}
      <Appbar.Header style={styles.appBar} elevated={true}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.appIconSmall}
        />
        <Text style={[styles.appBarTitle, {color: theme.colors.onSurface}]}>
          <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      {/* Keyboard Avoiding View */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              <Text
                variant="headlineMedium"
                style={[styles.pageTitle, {color: theme.colors.onBackground}]}>
                Create Account
              </Text>

              {/* Form Fields... Disable while loading */}
              <View style={styles.nameRow}>
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={styles.nameInput}
                  autoCapitalize="words"
                  disabled={loading} // <-- Disable
                />
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  style={styles.nameInput}
                  autoCapitalize="words"
                  disabled={loading} // <-- Disable
                />
              </View>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={loading} // <-- Disable
                left={
                  <TextInput.Icon
                    icon="email-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                disabled={loading} // <-- Disable
                left={
                  <TextInput.Icon
                    icon="lock-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!confirmPasswordVisible}
                autoCapitalize="none"
                disabled={loading} // <-- Disable
                left={
                  <TextInput.Icon
                    icon="lock-check-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                }
                right={
                  <TextInput.Icon
                    icon={
                      confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'
                    }
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                    color={theme.colors.onSurfaceVariant}
                  />
                }
              />

              {/* Terms Checkbox... Disable while loading */}
              {/* <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={toggleAgreeToTerms}
                  disabled={loading} // <-- Disable
                  activeOpacity={0.7}>
                  <Checkbox
                    status={agreeToTerms ? 'checked' : 'unchecked'}
                    onPress={toggleAgreeToTerms}
                    disabled={loading} // <-- Disable
                  />
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.checkboxLabel,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    I agree to the Terms of Service and Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View> */}

              {/* --- Updated Register Button --- */}
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                buttonColor={theme.colors.primary}
                loading={loading} // <-- Add loading prop
                disabled={loading} // <-- Disable if loading OR terms not agreed
              >
                {/* Text automatically handled by loading prop */}
                Create Account
              </Button>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginVertical: 16,
                }}>
                <View
                  style={{
                    height: 1,
                    width: '40%',
                    backgroundColor: theme.colors.onSurfaceVariant,
                  }}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    marginHorizontal: 8,
                    color: theme.colors.onSurfaceVariant,
                  }}>
                  Or
                </Text>
                <View
                  style={{
                    height: 1,
                    width: '40%',
                    backgroundColor: theme.colors.onSurfaceVariant,
                  }}
                />
              </View>

              <Button
                mode="contained"
                icon="google"
                onPress={onGoogleButtonPress}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                disabled={googleLoading}
                loading={googleLoading}>
                Continue with Google
              </Button>

              {/* Login Link... Disable while loading */}
              <View style={styles.loginLinkContainer}>
                <Text
                  variant="bodyMedium"
                  style={{color: theme.colors.onSurface}}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.loginLinkText,
                      {color: theme.colors.primary},
                    ]}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Function to create styles based on theme
const createStyles = theme =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    appBar: {backgroundColor: theme.colors.surface, paddingHorizontal: 10},
    appIconSmall: {width: 32, height: 32, marginRight: 10},
    appBarTitle: {fontSize: 22, fontWeight: 'bold'},
    keyboardAvoiding: {flex: 1},
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 20, // Added vertical padding
    },
    formContainer: {width: '90%', maxWidth: 400}, // Use percentage width
    formContent: {
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 30,
    },
    pageTitle: {marginBottom: 25, fontWeight: '600'}, // Adjusted margin & weight
    nameRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 15,
    },
    nameInput: {width: '48%'}, // Ensure names fit
    input: {width: '100%', marginBottom: 15},
    checkboxRow: {width: '100%', marginTop: 5, marginBottom: 20},
    checkboxContainer: {flexDirection: 'row', alignItems: 'center'},
    checkboxLabel: {marginLeft: 4, flexShrink: 1, lineHeight: 16},
    registerButton: {width: '100%', paddingVertical: 6, marginTop: 10}, // Adjusted padding
    registerButtonText: {fontSize: 16, fontWeight: 'bold'},
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 30, // Increased margin
    },
    loginLinkText: {fontWeight: 'bold'},
  });

export default RegisterScreen;
