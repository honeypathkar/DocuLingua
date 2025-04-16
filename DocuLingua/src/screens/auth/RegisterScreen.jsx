// screens/auth/RegisterScreen.jsx

import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image, // Ensure Image is imported
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Checkbox,
  useTheme,
  Appbar, // 👈 Ensure Appbar is imported
} from 'react-native-paper';

const RegisterScreen = ({navigation}) => {
  // State variables remain the same...
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const theme = useTheme();

  // Functions remain the same...
  const handleRegister = () => {
    /* ... validation and navigation ... */
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'You must agree to the Terms & Privacy Policy.');
      return;
    }
    console.log('Registration attempt');
    Alert.alert('Success', 'Account created successfully!', [
      {text: 'OK', onPress: () => navigation.navigate('Login')},
    ]);
  };
  const toggleAgreeToTerms = () => setAgreeToTerms(!agreeToTerms);
  const navigateToLogin = () => navigation.navigate('Login');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔵 Manual Appbar */}
      <Appbar.Header style={styles.appBar} elevated={true}>
        <Image
          source={require('../../assets/images/logo.png')} // Adjust path
          style={styles.appIconSmall}
        />
        <Text style={styles.appBarTitle}>
          <Text style={{color: '#3777F8'}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      {/* 🔵 Keyboard Avoiding View starts *below* the Appbar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} // Use padding
        style={styles.keyboardAvoiding} // Takes remaining space
      >
        {/* ScrollView to contain the centered form */}
        <ScrollView
          contentContainerStyle={styles.scrollViewContent} // flexGrow: 1 and justifyContent: 'center'
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Form Container View */}
          <View style={styles.formContainer}>
            <View style={styles.formContent}>
              {/* Content Specific Title */}
              <Text variant="headlineMedium" style={{marginBottom: 20}}>
                Create Account
              </Text>

              {/* Form Fields... */}
              <View style={styles.nameRow}>
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={styles.nameInput}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  style={styles.nameInput}
                  autoCapitalize="words"
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
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!confirmPasswordVisible}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-check-outline" />}
                right={
                  <TextInput.Icon
                    icon={
                      confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'
                    }
                    onPress={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  />
                }
              />

              {/* Terms Checkbox... */}
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={toggleAgreeToTerms}
                  activeOpacity={0.7}>
                  <Checkbox
                    status={agreeToTerms ? 'checked' : 'unchecked'}
                    onPress={toggleAgreeToTerms}
                    color={theme.colors.primary}
                  />
                  <Text variant="bodySmall" style={styles.checkboxLabel}>
                    {' '}
                    I agree to the Terms of Service and Privacy Policy{' '}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Register Button... */}
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                buttonColor="#3777F8">
                {' '}
                Create Account{' '}
              </Button>

              {/* Login Link... */}
              <View style={styles.loginLinkContainer}>
                <Text variant="bodyMedium">Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.loginLinkText,
                      {color: theme.colors.primary},
                    ]}>
                    {' '}
                    Login{' '}
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

// --- Styles --- (Use the same StyleSheet as LoginScreen, adding/removing specific ones if needed)
const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: 'white'},
  appBar: {backgroundColor: 'white', paddingHorizontal: 10},
  appIconSmall: {width: 32, height: 32, marginRight: 10},
  appBarTitle: {fontSize: 22, fontWeight: 'bold', color: '#333'},
  keyboardAvoiding: {flex: 1},
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  formContainer: {
    width: '95%',
    maxWidth: 400,
    // backgroundColor: '#ffffff',
    // borderRadius: 8,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  formContent: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 30,
  },
  // Branding styles (appIcon, title, tagline) used within content are removed/modified as needed
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  nameInput: {width: '48%'},
  input: {width: '100%', marginBottom: 15},
  checkboxRow: {width: '100%', marginTop: 5, marginBottom: 20},
  checkboxContainer: {flexDirection: 'row', alignItems: 'center'},
  checkboxLabel: {marginLeft: 2, flexShrink: 1, lineHeight: 16},
  registerButton: {width: '100%', paddingVertical: 5, marginTop: 10},
  registerButtonText: {fontSize: 16, fontWeight: 'bold'},
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  loginLinkText: {fontWeight: 'bold'},
});

export default RegisterScreen;
