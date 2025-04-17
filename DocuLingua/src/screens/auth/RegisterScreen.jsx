// screens/auth/RegisterScreen.jsx
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
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Checkbox,
  useTheme,
  Appbar, // Already imported useTheme
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

  const theme = useTheme(); // Already called
  // Create styles inside, dependent on theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Functions remain the same...
  const handleRegister = () => {
    /* ... validation ... */ Alert.alert('Success', 'Account created!', [
      {text: 'OK', onPress: () => navigation.navigate('Login')},
    ]);
  };
  const toggleAgreeToTerms = () => setAgreeToTerms(!agreeToTerms);
  const navigateToLogin = () => navigation.navigate('Login');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Manual Appbar */}
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
              {/* Apply theme text color */}
              <Text
                variant="headlineMedium"
                style={[styles.pageTitle, {color: theme.colors.onBackground}]}>
                Create Account
              </Text>

              {/* Form Fields... Apply theme colors */}
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
                left={
                  <TextInput.Icon
                    icon="email-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                } // Themed icon
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
                } // Themed icon
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    onPress={() => setPasswordVisible(!passwordVisible)}
                    color={theme.colors.onSurfaceVariant}
                  />
                } // Themed icon
              />
              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!confirmPasswordVisible}
                autoCapitalize="none"
                left={
                  <TextInput.Icon
                    icon="lock-check-outline"
                    color={theme.colors.onSurfaceVariant}
                  />
                } // Themed icon
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
                } // Themed icon
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
                  />
                  {/* Apply theme text color */}
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.checkboxLabel,
                      {color: theme.colors.onSurfaceVariant},
                    ]}>
                    I agree to the Terms of Service and Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Register Button... */}
              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
                buttonColor={theme.colors.primary} // Use theme color
                // textColor={theme.colors.onPrimary} // Usually automatic
              >
                Create Account
              </Button>

              {/* Login Link... */}
              <View style={styles.loginLinkContainer}>
                {/* Apply theme text color */}
                <Text
                  variant="bodyMedium"
                  style={{color: theme.colors.onSurface}}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
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
    safeArea: {flex: 1, backgroundColor: theme.colors.background}, // Theme background
    appBar: {backgroundColor: theme.colors.surface, paddingHorizontal: 10}, // Theme surface
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
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    formContainer: {width: '95%', maxWidth: 400},
    formContent: {
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 30,
    },
    pageTitle: {marginBottom: 20}, // Color applied inline
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
    checkboxLabel: {marginLeft: 2, flexShrink: 1, lineHeight: 16}, // Color applied inline
    registerButton: {width: '100%', paddingVertical: 5, marginTop: 10},
    registerButtonText: {fontSize: 16, fontWeight: 'bold'},
    loginLinkContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 25,
    },
    loginLinkText: {fontWeight: 'bold'}, // Color applied inline
  });

export default RegisterScreen;
