// screens/auth/WelcomeScreen.jsx
import React, {useMemo} from 'react'; // Import useMemo
import {StyleSheet, View, Image, SafeAreaView, Dimensions} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper'; // Import useTheme

const {width, height} = Dimensions.get('window');

const WELCOME_IMAGE_PATH = require('../../assets/images/welcome_image.png'); // adjust path
const LOGO_IMAGE_PATH = require('../../assets/images/logo.png'); // adjust path

const WelcomeScreen = ({navigation}) => {
  const theme = useTheme(); // Get the theme object
  // Create styles inside, dependent on theme
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLoginPress = () => navigation.navigate('Login');
  const handleSignupPress = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Name */}
        <View style={styles.header}>
          {/* Use theme color for primary part */}
          <Text style={[styles.appName, {color: theme.colors.primary}]}>
            Docu
          </Text>
          {/* Use theme color for rest */}
          <Text style={[styles.appName, {color: theme.colors.onBackground}]}>
            Lingua
          </Text>
        </View>

        {/* Welcome Image */}
        <View style={styles.imageContainer}>
          <Image
            source={WELCOME_IMAGE_PATH}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={LOGO_IMAGE_PATH}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLoginPress}
            style={styles.button}
            // Use theme color for button background
            buttonColor={theme.colors.primary}
            // Text color should contrast with buttonColor (onPrimary)
            // Paper usually handles this automatically for contained buttons
            // textColor={theme.colors.onPrimary} // Usually not needed
            labelStyle={styles.buttonLabel}>
            Login
          </Button>
          <Button
            mode="outlined"
            onPress={handleSignupPress}
            // Use theme color for border and text
            style={[styles.button, {borderColor: theme.colors.primary}]}
            textColor={theme.colors.primary}
            labelStyle={styles.buttonLabel}>
            Signup
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Function to create styles based on theme
const createStyles = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background, // Use theme background
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
    },
    header: {
      marginVertical: 20,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      // color removed, applied inline with theme colors
    },
    imageContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      top: -70, // Keep existing layout adjustments
    },
    welcomeImage: {
      width: '100%',
      height: 400, // Adjust if needed
    },
    logoContainer: {
      alignItems: 'center',
      marginVertical: 10,
      top: -150, // Keep existing layout adjustments
    },
    logo: {
      width: 120,
      height: 120,
    },
    buttonContainer: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 30,
      gap: 10,
      top: -80, // Keep existing layout adjustments
    },
    button: {
      width: '80%',
      paddingVertical: 8,
    },
    buttonLabel: {
      fontSize: 16,
    },
  });

export default WelcomeScreen;
