import React from 'react';
import {StyleSheet, View, Image, SafeAreaView, Dimensions} from 'react-native';
import {Title, Button, Text} from 'react-native-paper';

const {width, height} = Dimensions.get('window');

const WELCOME_IMAGE_PATH = require('../../assets/images/welcome_image.png'); // adjust path
const LOGO_IMAGE_PATH = require('../../assets/images/logo.png'); // adjust path

const WelcomeScreen = ({navigation}) => {
  const handleLoginPress = () => navigation.navigate('Login');
  const handleSignupPress = () => navigation.navigate('Register');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Name */}
        <View style={styles.header}>
          <Text style={[styles.appName, {color: '#3777F8'}]}>Docu</Text>
          <Text style={styles.appName}>Lingua</Text>
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
            buttonColor="#3777F8"
            labelStyle={styles.buttonLabel}>
            Login
          </Button>
          <Button
            mode="outlined"
            onPress={handleSignupPress}
            style={[styles.button, {borderColor: '#3777F8'}]}
            labelStyle={[styles.buttonLabel, {color: '#3777F8'}]}>
            Signup
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
  },
  imageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    top: -70,
  },
  welcomeImage: {
    width: '100%',
    height: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
    top: -150,
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
    top: -80,
  },
  button: {
    width: '80%',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});
