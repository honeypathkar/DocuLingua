// EditProfileScreen.js
import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView, // Added for better keyboard handling
} from 'react-native';
import {
  Appbar,
  Avatar,
  TextInput,
  Button,
  useTheme,
  IconButton,
  Text,
  HelperText,
} from 'react-native-paper';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {UpdateAccountUrl} from '../../../API';

// Adjust the path to your default placeholder image
const defaultUserImage = require('../../assets/images/no-user-image.png'); // <--- ADJUST PATH IF NEEDED

const MAX_IMAGE_SIZE_MB = 10; // Max image size in Megabytes
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const EditProfileScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();
  const route = useRoute();

  // --- Safe Parameter Handling ---
  const initialUser = route.params?.user || {};
  const initialFullName = initialUser.fullName || '';
  const initialEmail = initialUser.email || '';
  const initialImage = initialUser.userImage || null; // Store initial image URI for comparison
  const initialLanguages = Array.isArray(initialUser.language)
    ? initialUser.language.join(', ')
    : '';

  // --- State ---
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail); // Email state (though disabled)
  const [languagesInput, setLanguagesInput] = useState(initialLanguages);
  const [profilePicUri, setProfilePicUri] = useState(initialImage); // For display
  const [selectedImageResponse, setSelectedImageResponse] = useState(null); // Store selected image data
  const [userToken, setUserToken] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken'); // <--- Ensure this key is correct
        if (token) {
          setUserToken(token);
        } else {
          console.error('Auth Error: Token not found.');
          Alert.alert(
            'Authentication Error',
            'Session expired or token not found. Please log in again.',
            [
              {text: 'OK', onPress: () => navigation.navigate('Login')}, // Adjust navigation target if needed
            ],
          );
        }
      } catch (error) {
        console.error('AsyncStorage Error:', error);
        Alert.alert('Error', 'Failed to retrieve session token.');
      }
    };
    getToken();
  }, [navigation]);

  // --- Handlers ---
  const handleChoosePhoto = useCallback(() => {
    if (isUpdating) return; // Prevent opening picker during update

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          return;
        }
        if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
          Alert.alert(
            'Image Picker Error',
            response.errorMessage || 'Could not select image.',
          );
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const selectedAsset = response.assets[0];
          const selectedUri = selectedAsset.uri;
          const selectedSize = selectedAsset.fileSize;

          console.log('Selected Image Size:', selectedSize, 'bytes');

          if (selectedSize && selectedSize > MAX_IMAGE_SIZE_BYTES) {
            Alert.alert(
              'Image Too Large',
              `Please select an image smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
            );
            return; // Stop if too large
          }

          setProfilePicUri(selectedUri); // Update display URI
          setSelectedImageResponse(selectedAsset); // Store selected asset info
          console.log('Image selected (size OK):', selectedUri);
        }
      },
    );
  }, [isUpdating]); // Dependency: isUpdating

  const handleUpdate = useCallback(async () => {
    if (!userToken) {
      Alert.alert('Error', 'Authentication token is missing. Cannot update.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    setIsUpdating(true);

    // Prepare languages array
    const languagesArray = languagesInput
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => lang); // Remove empty entries

    // Construct payload based on backend expectations
    const payload = {
      fullName: fullName.trim(),
      // Use singular 'language' key as requested, but send array value
      language: languagesArray,
    };

    // Conditionally add userImage field ONLY if a new image was selected
    if (selectedImageResponse && selectedImageResponse.uri !== initialImage) {
      payload.userImage = selectedImageResponse.uri;
    }

    console.log('Updating profile with payload:', payload);
    console.log('Using URL:', UpdateAccountUrl);

    try {
      const response = await axios.put(UpdateAccountUrl, payload, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Optional: Add a timeout (15 seconds)
      });

      console.log('Update successful:', response.data);
      Alert.alert('Success', 'Profile updated successfully!');
      // Reset selected image response so it's not sent again unless re-chosen
      setSelectedImageResponse(null);
      // You might want to update the initialImage state here if needed,
      // or rely on a screen refresh/refetch after navigating back.
      // initialImage = payload.userImage || initialImage; // Example, but potentially risky

      // navigation.goBack(); // Navigate back on success
    } catch (error) {
      console.error('Update failed:', error);
      let errorMessage = 'An unexpected error occurred during the update.';
      if (error.response) {
        // Server responded with a status code outside 2xx range
        console.error('Error Data:', error.response.data);
        console.error('Error Status:', error.response.status);
        // Try to get a meaningful message from the response data
        const serverMessage =
          typeof error.response.data?.message === 'string'
            ? error.response.data.message
            : JSON.stringify(error.response.data);
        errorMessage = `Server Error ${error.response.status}: ${
          serverMessage || 'Failed to update profile.'
        }`;
      } else if (error.request) {
        // Request was made but no response received (network error, timeout)
        console.error('Error Request:', error.request);
        errorMessage =
          'Network Error: Could not connect to the server. Please check your connection.';
      } else {
        // Setup error or other unexpected issue
        console.error('Error Message:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsUpdating(false); // Ensure loading state is always reset
    }
  }, [
    userToken,
    fullName,
    languagesInput,
    selectedImageResponse,
    initialImage,
    navigation,
  ]); // Dependencies

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // --- Render ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} disabled={isUpdating} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        {/* --- Avatar --- */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handleChoosePhoto}
            style={styles.avatarTouchable}
            disabled={isUpdating}>
            <Avatar.Image
              size={120}
              source={profilePicUri ? {uri: profilePicUri} : defaultUserImage}
              style={{backgroundColor: theme.colors.surfaceVariant}} // Add a bg color for loading/error
            />
            <IconButton
              icon="pencil"
              size={24}
              style={[
                styles.editIcon,
                {backgroundColor: theme.colors.primaryContainer},
              ]}
              iconColor={theme.colors.onPrimaryContainer}
              onPress={handleChoosePhoto}
              disabled={isUpdating}
            />
          </TouchableOpacity>
        </View>

        {/* --- Full Name Input --- */}
        <TextInput
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={styles.input}
          disabled={isUpdating}
          autoCapitalize="words"
        />

        {/* --- Email Input (Disabled) --- */}
        <TextInput
          label="Email"
          value={email}
          mode="outlined"
          style={styles.input}
          disabled // Email is not editable
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* --- Languages Input --- */}
        <TextInput
          label="Languages"
          value={languagesInput}
          onChangeText={setLanguagesInput}
          mode="outlined"
          style={styles.input}
          disabled={isUpdating}
          autoCapitalize="none"
          placeholder="e.g., English, Spanish, French" // Use placeholder
        />
        <HelperText type="info" visible={true} style={styles.helperText}>
          Enter languages separated by commas.
        </HelperText>

        {/* --- Update Button --- */}
        <Button
          mode="contained"
          onPress={handleUpdate}
          style={styles.button}
          icon="check-circle"
          disabled={isUpdating}
          loading={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </ScrollView>
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
      flexGrow: 1, // Ensure scroll view can grow
      padding: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 20,
      position: 'relative',
      width: 120,
      height: 120,
    },
    avatarTouchable: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: 'center',
      alignItems: 'center',
      // Add a subtle border or background for the touchable area itself
      // backgroundColor: theme.colors.surfaceVariant, // Optional: background for the circle
    },
    editIcon: {
      position: 'absolute',
      right: -5,
      bottom: -5,
      borderWidth: 1.5, // Slightly thicker border
      borderColor: theme.colors.background, // Border matches background for cutout effect
    },
    input: {
      width: '100%',
      marginBottom: 5,
    },
    helperText: {
      width: '100%',
      marginBottom: 10,
      paddingLeft: 0, // Adjust if needed based on TextInput style
    },
    button: {
      width: '100%',
      marginTop: 20,
      paddingVertical: 6,
    },
  });

export default EditProfileScreen;
