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
  KeyboardAvoidingView,
  ToastAndroid, // Added for better keyboard handling
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
import ImageCropPicker from 'react-native-image-crop-picker';
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

    ImageCropPicker.openPicker({
      mediaType: 'photo',
      cropping: true,
      width: 500,
      height: 500,
      compressImageQuality: 0.7,
      cropperToolbarTitle: 'Crop Image',
      cropperToolbarColor: theme.colors.background,
      cropperToolbarWidgetColor: theme.colors.onSurface,
      cropperActiveWidgetColor: theme.colors.primary,
      cropperStatusBarColor: theme.colors.background,
    })
      .then(response => {
        const selectedUri = response.path;
        const selectedSize = response.size;

        console.log('Selected Image Size:', selectedSize, 'bytes');

        if (selectedSize && selectedSize > MAX_IMAGE_SIZE_BYTES) {
          Alert.alert(
            'Image Too Large',
            `Please select an image smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
          );
          return;
        }

        setProfilePicUri(selectedUri); // To preview selected image
        setSelectedImageResponse(response); // Store full response for upload
        console.log('Image selected (size OK):', selectedUri);
      })
      .catch(error => {
        if (error.code === 'E_PICKER_CANCELLED') {
          console.log('User cancelled image picker');
        } else {
          console.log('ImagePicker Error: ', error);
          Alert.alert(
            'Image Picker Error',
            error.message || 'Could not select image.',
          );
        }
      });
  }, [isUpdating]);

  const handleUpdate = useCallback(async () => {
    if (!userToken) {
      Alert.alert('Error', 'Authentication token is missing.');
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    setIsUpdating(true);

    const languagesArray = languagesInput
      .split(',')
      .map(lang => lang.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append('fullName', fullName.trim());
    languagesArray.forEach(lang => formData.append('language', lang));

    if (selectedImageResponse && selectedImageResponse.path !== initialImage) {
      formData.append('userImage', {
        uri: selectedImageResponse.path, // <--- Corrected from `uri` to `path`
        type: selectedImageResponse.mime || 'image/jpeg',
        name: selectedImageResponse.filename || 'profile.jpg',
      });
    }

    try {
      const response = await axios.put(UpdateAccountUrl, formData, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      });

      ToastAndroid.show('Profile Updated Successfully.', ToastAndroid.SHORT);

      if (navigation.canGoBack()) {
        navigation.goBack();
      }

      setSelectedImageResponse(null);
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || error.message,
      );
    } finally {
      setIsUpdating(false);
    }
  }, [
    userToken,
    fullName,
    languagesInput,
    selectedImageResponse,
    navigation,
    initialImage,
  ]);

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
        {/* <TextInput
          label="Email"
          value={email}
          mode="outlined"
          style={styles.input}
          disabled // Email is not editable
          keyboardType="email-address"
          autoCapitalize="none"
        /> */}

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
        <View style={styles.bottomButtonContainer}>
          <Button
            mode="contained"
            onPress={handleUpdate}
            style={styles.button} // Use general button style if needed
            icon="check-circle"
            disabled={isUpdating}
            loading={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Profile'}
          </Button>
        </View>
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
    bottomButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20, // Match scrollview horizontal padding
      paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Padding below the button (adjust for safe areas if needed)
      paddingTop: 10, // Padding above the button
      backgroundColor: theme.colors.background, // Match background to avoid transparency issues
      borderTopWidth: StyleSheet.hairlineWidth, // Optional: add a subtle top border
      borderTopColor: theme.colors.outlineVariant, // Optional: border color
    },
    // General button style (can potentially remove width: '100%' if container handles it)
    button: {
      paddingVertical: 8, // Slightly more padding
    },
  });

export default EditProfileScreen;
