import React, {useState} from 'react';
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
  useTheme,
  Appbar, // 👈 import Appbar from react-native-paper
} from 'react-native-paper';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const theme = useTheme();

  const handleLogin = () => {
    console.log('Login attempt with:', {email, password, rememberMe});
    navigation.replace('MainApp');
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password pressed');
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const navigateToRegister = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: 'white'}]}>
      {/* 🔵 Appbar/Header */}
      <Appbar.Header style={styles.appBar}>
        <Image
          source={require('../../assets/images/logo.png')} // Adjust path if needed
          style={styles.appIconSmall}
        />
        <Text style={styles.appBarTitle}>
          <Text style={{color: '#3777F8'}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      {/* 🔵 Main Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.keyboardAvoiding}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              {/* Removed logo and header from here */}

              <Text
                variant="headlineLarge"
                style={{marginBottom: 10, fontWeight: 'bold'}}>
                Login
              </Text>

              <Text variant="bodyMedium" style={styles.tagline}>
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
                left={<TextInput.Icon icon="email-outline" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
              />

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={toggleRememberMe}
                  activeOpacity={0.7}>
                  <Checkbox
                    status={rememberMe ? 'checked' : 'unchecked'}
                    onPress={toggleRememberMe}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodyMedium" style={styles.rememberMeText}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <Button
                  mode="text"
                  onPress={handleForgotPassword}
                  uppercase={false}
                  labelStyle={styles.forgotPasswordText}
                  compact>
                  Forgot Password?
                </Button>
              </View>

              <Button
                mode="contained"
                buttonColor="#3777F8"
                onPress={handleLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}>
                Log In
              </Button>
            </View>
            {/* Login Link... */}
            <View style={styles.loginLinkContainer}>
              <Text variant="bodyMedium">Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text
                  variant="bodyMedium"
                  style={[styles.loginLinkText, {color: theme.colors.primary}]}>
                  {' '}
                  Register{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appBar: {
    backgroundColor: 'white',
    elevation: 4,
    paddingHorizontal: 10,
  },
  appIconSmall: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingVertical: 20,
    // paddingHorizontal: 10,
  },
  formContainer: {
    width: '95%',
    maxWidth: 400,
  },
  formContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 25,
  },
  tagline: {
    marginBottom: 30,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 5,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 2,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 5,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 25,
  },
  loginLinkText: {fontWeight: 'bold'},
});

export default LoginScreen;
