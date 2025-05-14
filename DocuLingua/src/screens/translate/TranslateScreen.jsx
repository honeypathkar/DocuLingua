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
import ImageCropPicker from 'react-native-image-crop-picker';

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
  const MAX_IMAGE_SIZE_MB = 10; // Set maximum image size to 5 MB

  const handleOptionPress = docType => {
    console.log(`Selected option: ${docType}`);
    // Navigate with documentType for standard file/image uploads
    navigation.getParent()?.navigate('UploadScreen', {documentType: docType});
  };

  // --- Updated Camera Handler ---
  const handleOpenCamera = async () => {
    console.log('Open Camera pressed');

    try {
      const image = await ImageCropPicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        compressImageQuality: 1,
        cropperToolbarTitle: 'Crop Image',
        cropperToolbarColor: theme.colors.background,
        cropperToolbarWidgetColor: theme.colors.onSurface,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperStatusBarColor: theme.colors.background,
      });

      if (image) {
        console.log('Captured and cropped image:', image.path);

        const fileData = {
          uri: image.path,
          name: image.filename || `cam_${Date.now()}.jpg`,
          type: image.mime || 'image/jpeg',
          size: image.size,
        };

        if (fileData.size && fileData.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          Alert.alert(
            'Image Too Large',
            `Please select an image smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
          );
          return;
        }

        navigation.getParent()?.navigate('UploadScreen', {
          documentType: 'Image',
          capturedImageData: fileData,
        });
      } else {
        console.warn('No image returned from camera');
        Alert.alert('Error', 'Failed to capture image.');
      }
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('User cancelled camera');
      } else {
        console.error('Camera Picker Error:', error);
        Alert.alert(
          'Camera Error',
          error.message || 'An error occurred while opening the camera.',
        );
      }
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
