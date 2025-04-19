// screens/auth/LoginScreen.jsx
import React, {useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  ToastAndroid,
  // ActivityIndicator removed, Button handles it
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
import {LoginUrl} from '../../../API'; // Adjust path

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false); // Keep loading state

  const handleLogin = async () => {
    // Basic validation (optional but recommended)
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    console.log('Login Url: ', LoginUrl);
    setLoading(true); // Set loading true
    try {
      const response = await axios.post(
        LoginUrl,
        {
          email: email,
          password: password,
        },
        {timeout: 10000},
      ); // Added timeout

      // Check for successful response (adjust status code if needed)
      if (response.status === 200 && response.data?.token) {
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));
        ToastAndroid.show('Login Successfull.', ToastAndroid.SHORT);
        navigation.replace('MainApp'); // Navigate to main app stack
      } else {
        // Handle cases where API returns 200 but indicates failure (e.g., wrong credentials)
        const errorMessage = response.data?.message || 'Invalid Credentials';
        console.error(
          'Login failed (API Logic):',
          response.status,
          response.data,
        );
        if (Platform.OS === 'android') {
          ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
        } else {
          Alert.alert('Login Failed', errorMessage); // Alert for iOS
        }
      }
    } catch (error) {
      // Handle network errors or explicit API errors (4xx, 5xx)
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login.';
      if (error.response) {
        // Server responded with an error status code
        errorMessage =
          error.response.data?.message ||
          `Login failed (Status: ${error.response.status})`;
      } else if (error.request) {
        // Network error (no response received)
        errorMessage = 'Network error. Please check your connection.';
      } else {
        // Other errors (e.g., setting up the request)
        errorMessage = error.message;
      }

      if (Platform.OS === 'android') {
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      } else {
        Alert.alert('Login Failed', errorMessage); // Alert for iOS
      }
    } finally {
      setLoading(false); // Set loading false in finally block
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  const toggleRememberMe = () => setRememberMe(!rememberMe);
  const navigateToRegister = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Appbar/Header */}
      <Appbar.Header style={styles.appBar} elevated={true}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.appIconSmall}
        />
        <Text style={[styles.appBarTitle, {color: theme.colors.onSurface}]}>
          <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              <Text
                variant="headlineLarge"
                style={[styles.loginTitle, {color: theme.colors.onBackground}]}>
                Login
              </Text>
              <Text
                variant="bodyMedium"
                style={[
                  styles.tagline,
                  {color: theme.colors.onSurfaceVariant},
                ]}>
                Scan | Upload | Translate
              </Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={loading} // Disable input while loading
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
                disabled={loading} // Disable input while loading
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

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={toggleRememberMe}
                  disabled={loading} // Disable while loading
                  activeOpacity={0.7}>
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={toggleRememberMe}
                    disabled={loading}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.rememberMeText,
                      {color: theme.colors.onSurface},
                    ]}>
                    Remember me
                  </Text>
                </TouchableOpacity>
                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  uppercase={false}
                  labelStyle={[
                    styles.forgotPasswordText,
                    {color: theme.colors.primary},
                  ]}
                  disabled={loading} // Disable while loading
                  compact>
                  Forgot Password?
                </Button>
              </View>

              {/* --- Updated Button --- */}
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                onPress={handleLogin}
                style={styles.loginButton} // Removed opacity style
                labelStyle={styles.loginButtonText}
                disabled={loading} // Disable button during load
                loading={loading} // <-- Use the loading prop here
                // textColor={theme.colors.onPrimary} // Usually automatic
              >
                {/* Simplified Text: Button handles showing indicator */}
                Login
              </Button>
              {/* --- End Updated Button --- */}
            </View>

            <View style={styles.loginLinkContainer}>
              <Text
                variant="bodyMedium"
                style={{color: theme.colors.onSurface}}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                <Text
                  variant="bodyMedium"
                  style={[styles.loginLinkText, {color: theme.colors.primary}]}>
                  Register
                </Text>
              </TouchableOpacity>
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
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appBar: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
    },
    appIconSmall: {width: 32, height: 32, marginRight: 10},
    appBarTitle: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    keyboardAvoiding: {flex: 1},
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20, // Add some vertical padding
    },
    formContainer: {width: '90%', maxWidth: 400}, // Use percentage width
    formContent: {
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 25,
    },
    loginTitle: {marginBottom: 10, fontWeight: 'bold'},
    tagline: {marginBottom: 30, textAlign: 'center'},
    input: {width: '100%', marginBottom: 15},
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 20,
      marginTop: 5,
    },
    rememberMeContainer: {flexDirection: 'row', alignItems: 'center'},
    rememberMeText: {marginLeft: 4}, // Adjusted margin slightly
    forgotPasswordText: {fontSize: 14},
    loginButton: {
      width: '100%',
      paddingVertical: 6, // Adjusted padding
      marginTop: 10,
      // Opacity style removed
    },
    loginButtonText: {fontSize: 16, fontWeight: 'bold'},
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 25, // Increased margin
    },
    loginLinkText: {fontWeight: 'bold'},
  });

export default LoginScreen;
