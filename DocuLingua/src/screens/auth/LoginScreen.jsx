// screens/auth/LoginScreen.jsx
import React, {useState, useMemo} from 'react'; // Import useMemo
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Checkbox,
  useTheme, // Already imported
  Appbar,
} from 'react-native-paper';

import axios from 'axios'; // Import axios
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import {LoginUrl} from '../../../API';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const theme = useTheme(); // Already called
  // Create styles inside, dependent on theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogin = async () => {
    console.log('Login Url: ', LoginUrl);
    try {
      const response = await axios.post(
        'http://localhost:8001/api/users/login',
        {
          email: email,
          password: password,
        },
      );

      if (response.status === 200) {
        const token = response.data.token;
        // Store the token in AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        // Store the "remember me" status
        await AsyncStorage.setItem('rememberMe', JSON.stringify(rememberMe));

        // Navigate to the MainApp
        navigation.replace('MainApp');
      } else {
        // Handle other status codes (e.g., 401, 500)
        console.error('Login failed:', response.status, response.data);
        // Display an error message to the user (e.g., using Alert)
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Login error:', error);
      // Display an error message to the user
    }
  };
  const handleForgotPassword = () => {
    /* ... */
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
        {/* Apply theme colors */}
        <Text style={[styles.appBarTitle, {color: theme.colors.onSurface}]}>
          <Text style={{color: theme.colors.primary}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      {/* Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // height might work better sometimes
        style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              {/* Apply theme text color */}
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

              {/* TextInput usually adapts to theme, but check placeholder/icon colors */}
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                left={
                  <TextInput.Icon
                    icon="email-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                } // Themed icon color
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                left={
                  <TextInput.Icon
                    icon="lock-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                } // Themed icon color
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    color={theme.colors.onSurfaceVariant} // Themed icon color
                  />
                }
              />

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={toggleRememberMe}
                  activeOpacity={0.7}>
                  {/* Checkbox uses theme primary color by default */}
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={toggleRememberMe}
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
                  ]} // Use theme color
                  compact>
                  Forgot Password?
                </Button>
              </View>

              <Button
                mode="contained"
                buttonColor={theme.colors.primary} // Use theme color
                onPress={handleLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                // textColor={theme.colors.onPrimary} // Usually automatic
              >
                Log In
              </Button>
            </View>

            <View style={styles.loginLinkContainer}>
              {/* Apply theme text color */}
              <Text
                variant="bodyMedium"
                style={{color: theme.colors.onSurface}}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
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
      backgroundColor: theme.colors.background, // Theme background
    },
    appBar: {
      backgroundColor: theme.colors.surface, // Theme surface
      paddingHorizontal: 10,
    },
    appIconSmall: {width: 32, height: 32, marginRight: 10},
    appBarTitle: {
      fontSize: 22,
      fontWeight: 'bold' /* color: theme.colors.onSurface */,
    }, // Color applied inline
    keyboardAvoiding: {flex: 1},
    scrollViewContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    formContainer: {width: '95%', maxWidth: 400},
    formContent: {
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 25,
    },
    loginTitle: {marginBottom: 10, fontWeight: 'bold'}, // Color applied inline
    tagline: {marginBottom: 30, textAlign: 'center'}, // Color applied inline
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
    rememberMeText: {marginLeft: 2}, // Color applied inline
    forgotPasswordText: {fontSize: 14}, // Color applied inline via Button prop
    loginButton: {width: '100%', paddingVertical: 5, marginTop: 10},
    loginButtonText: {fontSize: 16, fontWeight: 'bold'},
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    loginLinkText: {fontWeight: 'bold'}, // Color applied inline
  });

export default LoginScreen;
