// TranslateScreen.js
import React, {useMemo} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert, // <-- Import Alert
} from 'react-native';
import {Text, useTheme, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader';

// --- Import Camera functionalities ---
import {
  launchCamera,
  ImageLibraryOptions, // Use this type for options object
  Asset, // Type for the selected asset
} from 'react-native-image-picker';

export default function TranslateScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  const handleOptionPress = docType => {
    console.log(`Selected option: ${docType}`);
    // Navigate with documentType for standard file/image uploads
    navigation.getParent()?.navigate('UploadScreen', {documentType: docType});
  };

  // --- Updated Camera Handler ---
  const handleOpenCamera = async () => {
    console.log('Open Camera pressed');
    const options = {
      mediaType: 'photo', // Only allow taking photos
      quality: 0.8, // Reduce quality slightly for faster uploads (adjust as needed)
      saveToPhotos: true, // Optional: Saves the photo to the public gallery (requires permissions)
    };

    try {
      const result = await launchCamera(options);

      if (result.didCancel) {
        console.log('User cancelled camera');
        return; // Exit if the user cancelled
      }
      if (result.errorCode) {
        console.error('Camera Error:', result.errorCode, result.errorMessage);
        Alert.alert(
          'Camera Error',
          result.errorMessage || 'Could not open camera.',
        );
        return; // Exit on error
      }
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Captured image asset:', JSON.stringify(asset, null, 2));

        // --- Prepare the file data structure expected by UploadScreen ---
        const fileData = {
          uri: asset.uri,
          // Use fileName if available, otherwise generate one
          name: asset.fileName || `cam_${Date.now()}.jpg`,
          // Use type if available, otherwise default to jpeg
          type: asset.type || 'image/jpeg',
          size: asset.fileSize, // Size might be null sometimes
        };

        // --- Navigate to UploadScreen ---
        // Pass 'Image' as documentType AND the captured image data
        navigation.getParent()?.navigate('UploadScreen', {
          documentType: 'Image', // Explicitly set type to Image
          capturedImageData: fileData, // Pass the captured image details
        });
      } else {
        // This case might occur if assets array is empty unexpectedly
        console.warn('Camera finished without assets, cancellation, or error.');
        Alert.alert('Error', 'Failed to capture image. Please try again.');
      }
    } catch (err) {
      // Catch any other unexpected errors during launch
      console.error('Error launching camera:', err);
      Alert.alert('Error', 'An error occurred while opening the camera.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Image
          source={require('../../assets/images/translate_screen.png')}
          style={styles.topImage}
          resizeMode="cover"
        />
        <Text style={styles.title}>Upload a Document</Text>
        <Text style={styles.subtitle}>
          Select a document type to get started with translation
        </Text>

        {/* Options Container */}
        <View style={styles.optionsContainer}>
          {/* PDF Option */}
          <TouchableOpacity
            onPress={() => handleOptionPress('PDF')}
            activeOpacity={0.7}>
            <View style={styles.optionItem}>
              {/* ... Icon, Text ... */}
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: theme.colors.error},
                ]}>
                <Icon name="file-pdf-box" size={24} color="#fff" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>PDF Document</Text>
                <Text style={styles.optionDescription}>
                  Upload a PDF file from your device
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceDisabled}
              />
            </View>
          </TouchableOpacity>

          {/* Image Option */}
          <TouchableOpacity
            onPress={() => handleOptionPress('Image')}
            activeOpacity={0.7}>
            <View style={styles.optionItem}>
              {/* ... Icon, Text ... */}
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: theme.colors.primary},
                ]}>
                <Icon name="image-outline" size={24} color="#fff" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Image</Text>
                <Text style={styles.optionDescription}>
                  Upload an image containing text
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceDisabled}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Scan Text */}
        <Text style={styles.scanText}>Need to scan a physical document?</Text>

        {/* --- Open Camera Button --- calls updated handleOpenCamera */}
        <Button
          mode="contained"
          onPress={handleOpenCamera}
          style={styles.cameraButton}
          labelStyle={styles.cameraButtonLabel}
          icon="camera-outline">
          Open Camera
        </Button>
      </ScrollView>
    </View>
  );
}

// Styles Definition (Keep existing styles)
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    topImage: {
      width: '100%',
      height: 200,
      marginBottom: 25,
      borderRadius: 8,
      alignSelf: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 30,
    },
    optionsContainer: {
      marginBottom: 40,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    optionTextContainer: {
      flex: 1,
      marginRight: 10,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    scanText: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 15,
    },
    cameraButton: {
      paddingVertical: 8,
      borderRadius: 8,
    },
    cameraButtonLabel: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
