// UploadScreen.js
import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Modal as ReactNativeModal,
  Pressable,
  ScrollView,
} from 'react-native';
import {Text, useTheme, Button, Appbar, Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';

import DocumentPicker, {
  types,
  isCancel,
  pick,
} from '@react-native-documents/picker';

// import {launchImageLibrary} from 'react-native-image-picker';
import ImageCropPicker from 'react-native-image-crop-picker';

const uploadConfig = {maxSizeMB: 50};

const availableLanguages = [
  {label: 'Auto-detect', value: 'auto'},
  {label: 'English', value: 'en'},
  {label: 'Spanish', value: 'es'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Hindi', value: 'hi'},
];
const targetLanguages = availableLanguages.filter(
  lang => lang.value !== 'auto',
);

const documentTypesForPicker = {
  pdf: [types.pdf], // Use the constant from the library
  image: [], // Images are handled by image picker
  // Add other types if you uncomment the 'Document' option in TranslateScreen
  // document: [
  //  types.doc, // Includes .doc
  //  types.docx, // Includes .docx
  //  types.plainText, // Includes .txt
  // ],
};

export default function UploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const initialDocType = route.params?.documentType; // 'PDF' or 'Image'
  const capturedImageData = route.params?.capturedImageData; // Data from camera

  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);
  const [selectedSourceLang, setSelectedSourceLang] = useState(
    availableLanguages[0], // Default to Auto-detect
  );
  const [selectedTargetLang, setSelectedTargetLang] = useState(
    targetLanguages.find(lang => lang.value === 'es') || targetLanguages[0], // Default to Spanish or first target lang
  );

  const showModal = useCallback(() => setIsModalVisible(true), []);
  const hideModal = useCallback(() => setIsModalVisible(false), []);

  const processSelectedFile = useCallback(
    fileData => {
      if (!fileData || !fileData.uri) {
        console.error('Invalid file data received:', fileData);
        Alert.alert('Error', 'Failed to process the selected file.');
        setSelectedFile(null);
        return;
      }
      const fileSize = typeof fileData.size === 'number' ? fileData.size : 0;
      if (fileSize > 0 && fileSize / (1024 * 1024) > uploadConfig.maxSizeMB) {
        Alert.alert(
          'File Too Large',
          `File size (${(fileSize / (1024 * 1024)).toFixed(
            2,
          )} MB) exceeds the limit of ${uploadConfig.maxSizeMB}MB.`,
        );
        setSelectedFile(null); // Clear selection if too large
      } else {
        const finalFile = {
          uri: fileData.uri,
          name: fileData.name || 'Unnamed File', // Provide a fallback name
          type: fileData.type || 'application/octet-stream', // Provide a fallback type
          size: fileSize > 0 ? fileSize : null, // Keep size null if not provided/zero
        };
        console.log('Processed file for state update:', finalFile);
        setSelectedFile(finalFile); // Update the state
      }
    },
    [uploadConfig.maxSizeMB], // Dependency: maxSizeMB
  );

  useEffect(() => {
    if (capturedImageData) {
      console.log('Received captured image data on mount:', capturedImageData);
      processSelectedFile(capturedImageData); // Process the captured image
    }
  }, [capturedImageData, processSelectedFile]); // Dependencies

  // --- Picker Handlers ---

  const handleLaunchGallery = useCallback(async () => {
    hideModal(); // Close the selection modal first

    try {
      const image = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        // width: 500,
        // height: 500,
        compressImageQuality: 0.7,
        cropperToolbarTitle: 'Crop Image',
        cropperToolbarColor: theme.colors.background,
        cropperToolbarWidgetColor: theme.colors.onSurface,
        cropperActiveWidgetColor: theme.colors.primary,
        cropperStatusBarColor: theme.colors.background,
      });

      if (image) {
        console.log('Selected image from gallery:', image.path);

        if (image.size && image.size > uploadConfig.maxSizeMB * 1024 * 1024) {
          Alert.alert(
            'Image Too Large',
            `Please select an image smaller than ${
              1024 * 1024 * uploadConfig.maxSizeMB
            } MB.`,
          );
          return;
        }

        processSelectedFile({
          uri: image.path,
          name: image.filename || 'selected.jpg',
          type: image.mime || 'image/jpeg',
          size: image.size,
        });
      } else {
        console.warn('No image returned from picker.');
      }
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
        console.log('User cancelled gallery picker');
      } else {
        console.error('Gallery Picker Error:', error);
        Alert.alert(
          'Gallery Picker Error',
          error.message || 'An error occurred while selecting image.',
        );
      }
    }
  }, [hideModal, processSelectedFile, theme]);

  const handleBrowseDocuments = async () => {
    hideModal(); // Ensure modal is hidden
    console.log('Attempting to browse documents (expecting PDF)...');
    // Determine which document types to allow based on initialDocType
    // For now, we assume if this function is called, it's for PDF
    const typesToPick = documentTypesForPicker.pdf;

    if (!typesToPick || typesToPick.length === 0) {
      Alert.alert(
        'Configuration Error',
        'No document types configured for PDF selection.',
      );
      return;
    }
    console.log('Using types:', typesToPick);

    try {
      const [pickerResult] = await pick({
        mode: 'open', // Use 'open' to get read access
        allowMultiSelection: false, // Only one document
        type: typesToPick, // Specify allowed types (PDF)
        // presentationStyle: 'fullScreen', // Optional: iOS presentation style
        // copyTo: 'cachesDirectory', // Optional: copy file for stable URI, might increase time
      });

      console.log(
        'Document Picker Success (Raw Result):',
        JSON.stringify(pickerResult, null, 2),
      );

      if (!pickerResult.uri || !pickerResult.name) {
        console.error(
          'Document Picker Success but missing URI or Name:',
          pickerResult,
        );
        Alert.alert('Picker Error', 'Selected file details are incomplete.');
        return;
      }
      // Process the selected document
      processSelectedFile({
        uri: pickerResult.uri,
        name: pickerResult.name,
        type: pickerResult.type,
        size: pickerResult.size,
      });
    } catch (err) {
      if (isCancel(err)) {
        console.log('User cancelled document picker.');
      } else {
        // Log detailed error
        console.error('--- Document Picker Error ---');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Full Error Object:', JSON.stringify(err, null, 2));
        console.error('--- End Document Picker Error ---');
        Alert.alert(
          'Document Picker Error',
          `Could not open documents. ${
            err.message || 'Please check permissions or try again.'
          } (Code: ${err.code || 'N/A'})`,
        );
        // Potentially re-throw specific errors if needed elsewhere
        // throw err;
      }
    }
  };

  // --- Upload Box Press Handler ---
  const handleUploadBoxPress = useCallback(() => {
    console.log(`Upload box pressed. InitialDocType: ${initialDocType}`);
    // Trigger specific picker based on how the screen was entered
    if (initialDocType === 'PDF') {
      handleBrowseDocuments();
    } else if (initialDocType === 'Image') {
      // Allow changing the image via gallery even if one was loaded from camera
      handleLaunchGallery();
    } else {
      // Fallback: Show the modal if no type specified (e.g., direct navigation)
      console.log('No specific document type provided, showing modal.');
      showModal();
    }
  }, [initialDocType, handleBrowseDocuments, handleLaunchGallery, showModal]); // Dependencies

  // --- Navigation Handlers ---
  const handleContinue = useCallback(() => {
    if (!selectedFile) {
      Alert.alert('Selection Required', 'Please select a file to continue.');
      return;
    }
    // Log details before proceeding
    console.log('--- Starting Translation Process ---');
    console.log(
      'Selected File:',
      selectedFile.name,
      selectedFile.size
        ? `(${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`
        : '(Size N/A)',
      selectedFile.type,
    );
    console.log('File URI:', selectedFile.uri);
    console.log(
      'Source Language:',
      selectedSourceLang.label,
      `(${selectedSourceLang.value})`,
    );
    console.log(
      'Target Language:',
      selectedTargetLang.label,
      `(${selectedTargetLang.value})`,
    );

    // **TODO:** Implement actual upload and translation API call here
    Alert.alert('Proceeding', 'Upload/Translation logic would start here.'); // Placeholder

    // Example: Navigate to a result or processing screen
    // navigation.navigate('ProcessingScreen', {
    //   fileDetails: selectedFile,
    //   sourceLang: selectedSourceLang.value,
    //   targetLang: selectedTargetLang.value,
    // });
  }, [selectedFile, selectedSourceLang, selectedTargetLang, navigation]); // Dependencies

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // --- Language Menu Handlers ---
  const openSourceMenu = useCallback(() => setSourceMenuVisible(true), []);
  const closeSourceMenu = useCallback(() => setSourceMenuVisible(false), []);
  const openTargetMenu = useCallback(() => setTargetMenuVisible(true), []);
  const closeTargetMenu = useCallback(() => setTargetMenuVisible(false), []);

  const handleSelectSourceLang = useCallback(lang => {
    setSelectedSourceLang(lang);
    closeSourceMenu();
  }, []); // Dependency: closeSourceMenu

  const handleSelectTargetLang = useCallback(lang => {
    setSelectedTargetLang(lang);
    closeTargetMenu();
  }, []); // Dependency: closeTargetMenu

  // --- Render Component ---
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        {' '}
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content
          title="Upload Content"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled" // Good practice for scrollviews with inputs/menus
      >
        <Text style={styles.infoText}>
          {selectedFile
            ? 'Review selection and languages'
            : initialDocType
            ? `Select a ${initialDocType} file and languages`
            : 'Select content source for translation'}
        </Text>

        {/* Upload Box Trigger */}
        <TouchableOpacity onPress={handleUploadBoxPress} activeOpacity={0.7}>
          <View style={styles.uploadBox}>
            <Icon
              name={
                selectedFile ? 'file-check-outline' : 'cloud-upload-outline'
              }
              size={50}
              color={theme.colors.primary}
            />
            <Text
              style={styles.uploadBoxText}
              numberOfLines={2}
              ellipsizeMode="middle">
              {selectedFile
                ? selectedFile.name
                : `Tap to select ${initialDocType || 'source'}`}
            </Text>
            {!selectedFile && (
              <Text style={styles.uploadHintText}>
                {initialDocType === 'PDF' &&
                  'Browse device documents  \n (Choose Image that contains text)'}
                {initialDocType === 'Image' &&
                  'Choose from gallery  \n (Choose Image that contains text)'}
                {!initialDocType && 'Gallery or Documents'}
              </Text>
            )}
            {selectedFile && (
              <Text style={styles.uploadHintText}>
                Size:{' '}
                {selectedFile.size
                  ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
                  : 'N/A'}
                {' | '}Type: {selectedFile.type || 'N/A'}
                {'\n'}(Tap to change selection) {/* Hint to re-select */}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Language Selection: Source */}
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Source Language</Text>
          <Menu
            visible={sourceMenuVisible}
            onDismiss={closeSourceMenu}
            anchor={
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={openSourceMenu}
                activeOpacity={0.8}>
                <Text style={styles.languageSelectorText}>
                  {selectedSourceLang.label}
                </Text>
                <Icon
                  name="chevron-down"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            }>
            {availableLanguages.map(lang => (
              <Menu.Item
                key={lang.value}
                onPress={() => handleSelectSourceLang(lang)}
                title={lang.label}
                // Optional: Style the selected item differently
                // titleStyle={selectedSourceLang.value === lang.value ? { color: theme.colors.primary } : {}}
              />
            ))}
          </Menu>
        </View>

        {/* Language Selection: Target */}
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Target Language</Text>
          <Menu
            visible={targetMenuVisible}
            onDismiss={closeTargetMenu}
            anchor={
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={openTargetMenu}
                activeOpacity={0.8}>
                <Text style={styles.languageSelectorText}>
                  {selectedTargetLang.label}
                </Text>
                <Icon
                  name="chevron-down"
                  size={24}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            }>
            {targetLanguages.map(lang => (
              <Menu.Item
                key={lang.value}
                onPress={() => handleSelectTargetLang(lang)}
                title={lang.label}
                // titleStyle={selectedTargetLang.value === lang.value ? { color: theme.colors.primary } : {}}
              />
            ))}
          </Menu>
        </View>
      </ScrollView>

      {/* Bottom Buttons Area */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleGoBack}
          style={[styles.button, styles.backButton]}
          labelStyle={styles.buttonLabel}
          accessibilityLabel="Go back">
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={[styles.button, styles.continueButton]}
          labelStyle={styles.buttonLabel}
          disabled={!selectedFile} // Disable if no file is selected
          accessibilityLabel="Continue with selected file">
          Continue
        </Button>
      </View>

      {/* Selection Modal (Fallback) */}
      <ReactNativeModal
        visible={isModalVisible}
        transparent={true}
        animationType="fade" // Or 'slide'
        onRequestClose={hideModal} // Handle Android back button press
      >
        <Pressable style={styles.modalBackdrop} onPress={hideModal}>
          {/* Prevent clicks inside the modal from closing it */}
          <Pressable
            style={[
              styles.modalContentContainer,
              {backgroundColor: theme.colors.elevation.level2},
            ]}
            onPress={e => e.stopPropagation()}>
            <Text style={[styles.modalTitle, {color: theme.colors.onSurface}]}>
              Select Source
            </Text>

            {/* Gallery Option */}
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={handleLaunchGallery}
              accessibilityRole="button"
              accessibilityLabel="Choose from Gallery">
              <Icon
                name="image-multiple"
                size={24}
                color={theme.colors.primary}
                style={styles.modalOptionIcon}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  {color: theme.colors.onSurface},
                ]}>
                Choose from Gallery (Photos Only)
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.modalDivider,
                {backgroundColor: theme.colors.outlineVariant},
              ]}
            />

            {/* Document Option */}
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={handleBrowseDocuments}
              accessibilityRole="button"
              accessibilityLabel="Browse Documents">
              <Icon
                name="file-document-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.modalOptionIcon}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  {color: theme.colors.onSurface},
                ]}>
                Browse Documents (PDF)
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.modalDivider,
                {backgroundColor: theme.colors.outlineVariant},
              ]}
            />

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={hideModal}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection">
              <Text
                style={[styles.modalCancelText, {color: theme.colors.primary}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </ReactNativeModal>
    </View>
  );
}

// --- Styles ---
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appBar: {
      // backgroundColor: theme.colors.surface, // Optional: Different background for AppBar
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontWeight: 'bold',
      textAlign: 'left',
      // fontSize: 18, // Adjust size if needed
    },
    contentScroll: {
      flex: 1, // Ensure ScrollView takes available space
    },
    content: {
      padding: 20,
      paddingTop: 30, // More space below AppBar
      paddingBottom: 40, // Space at the bottom
    },
    infoText: {
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 25,
    },
    uploadBox: {
      height: 180, // Adjust height as needed
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.roundness * 2, // Consistent rounding
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer + '4D', // Use theme color with alpha
      padding: 20,
      marginBottom: 30,
    },
    uploadBoxText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.colors.primary, // Use primary text color
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 10,
    },
    uploadHintText: {
      marginTop: 5,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant, // Use a secondary text color
      textAlign: 'center',
      paddingHorizontal: 10,
      lineHeight: 18, // Improve readability for multi-line hint
    },
    languageSection: {
      marginBottom: 20,
    },
    languageLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
      fontWeight: 'bold', // Make label bold
    },
    languageSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline, // Use theme outline color
      borderRadius: theme.roundness, // Standard rounding
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.surface, // Background for the selector
      minHeight: 50,
    },
    languageSelectorText: {
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background, // Match screen background
    },
    button: {
      flex: 1, // Each button takes half the space
      marginHorizontal: 5, // Space between buttons
      borderRadius: theme.roundness * 2.5, // More rounded buttons
    },
    backButton: {
      borderColor: theme.colors.primary, // Outline color for back button
    },
    continueButton: {
      // Contained uses primary color by default
    },
    buttonLabel: {
      paddingVertical: 5, // Internal padding for button text
      fontWeight: 'bold',
      fontSize: 15,
    },
    // --- Modal Styles ---
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker backdrop
      justifyContent: 'center', // Center modal vertically
      alignItems: 'center', // Center modal horizontally
      padding: 20, // Padding around the modal content area
    },
    modalContentContainer: {
      width: '100%',
      maxWidth: 450, // Max width for larger screens/tablets
      borderRadius: theme.roundness * 3, // More prominent rounding
      paddingTop: 20,
      paddingBottom: 10,
      paddingHorizontal: 0, // Use padding on inner items instead
      backgroundColor: theme.colors.elevation.level2, // Elevated background
      elevation: 8, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15, // Space below title
      textAlign: 'center',
      paddingHorizontal: 20, // Padding for title text
      color: theme.colors.onSurface, // Use theme text color
    },
    modalOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16, // Comfortable touch area
      paddingHorizontal: 20, // Indent options
    },
    modalOptionIcon: {
      marginRight: 20, // Space icon from text
    },
    modalOptionText: {
      fontSize: 17, // Slightly larger text for options
      color: theme.colors.onSurface,
    },
    modalDivider: {
      height: StyleSheet.hairlineWidth, // Standard divider height
      backgroundColor: theme.colors.outlineVariant, // Use theme color
      marginVertical: 4, // Space above/below divider
      marginHorizontal: 20, // Indent divider line
    },
    modalCancelButton: {
      marginTop: 10, // Space above cancel button
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center', // Center the cancel text
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary, // Use primary color for cancel action
    },
  });
