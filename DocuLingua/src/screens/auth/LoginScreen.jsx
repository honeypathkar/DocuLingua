// screens/auth/LoginScreen.jsx
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
  ToastAndroid,
  Alert,
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
import {GoogleLoginSignupUrl, LoginUrl} from '../../../API';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import useUserStore from '../../store/userStore';
import {GOOGLE_CLIENT_ID} from '@env';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {fetchDetails} = useUserStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        LoginUrl,
        {email, password},
        {timeout: 10000},
      );

      if (response.status === 200 && response.data?.token) {
        const token = response.data.token;
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));
        ToastAndroid.show('Login Successful.', ToastAndroid.SHORT);
        navigation.replace('MainApp');
        fetchDetails();
      } else {
        const errorMessage = response.data?.message || 'Invalid Credentials';
        handleLoginError(errorMessage);
      }
    } catch (error) {
      let errorMessage = 'An error occurred during login.';
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          `Login failed (Status: ${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message;
      }
      handleLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = message => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Login Failed', message);
    }
  };

  const handleForgotPassword = () => navigation.navigate('ForgotPassword');
  const toggleRememberMe = () => setRememberMe(!rememberMe);
  const navigateToRegister = () => navigation.navigate('Register');

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
        await AsyncStorage.setItem('rememberMe', JSON.stringify(true));
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
      <Appbar.Header style={styles.appBar} elevated>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.appIconSmall}
        />
        <Text style={[styles.appBarTitle, {color: theme.colors.onSurface}]}>
          <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

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
                disabled={loading}
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
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                  compact>
                  Forgot Password?
                </Button>
              </View>

              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                onPress={handleLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                disabled={loading}
                loading={loading}>
                Login
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
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                disabled={googleLoading}
                loading={googleLoading}>
                Continue with Google
              </Button>

              <Button
                mode="text"
                onPress={navigateToRegister}
                labelStyle={[
                  styles.registerText,
                  {color: theme.colors.primary},
                ]}>
                Don't have an account? Register
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    appBar: {flexDirection: 'row', alignItems: 'center'},
    appIconSmall: {width: 40, height: 40, margin: 8},
    appBarTitle: {fontSize: 20, fontWeight: 'bold'},
    keyboardAvoiding: {flex: 1},
    scrollViewContent: {flexGrow: 1, justifyContent: 'center', padding: 16},
    formContainer: {flex: 1, justifyContent: 'center'},
    formContent: {gap: 16},
    loginTitle: {textAlign: 'center'},
    tagline: {textAlign: 'center'},
    input: {marginBottom: 12},
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rememberMeContainer: {flexDirection: 'row', alignItems: 'center'},
    rememberMeText: {marginLeft: 8},
    forgotPasswordText: {textDecorationLine: 'underline'},
    loginButton: {marginTop: 12},
    loginButtonText: {fontWeight: 'bold'},
    registerText: {marginTop: 16, textAlign: 'center'},
  });

export default LoginScreen;
