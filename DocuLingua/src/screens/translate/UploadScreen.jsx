import React, {useMemo, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert, // Using RN Alert for user feedback/errors
  Platform,
  Modal as ReactNativeModal, // Using RN built-in Modal
  Pressable,
  ScrollView, // Added ScrollView for modal content if options grow
} from 'react-native';
import {Text, useTheme, Button, Appbar, Menu} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import DocumentPicker, {types} from '@react-native-documents/picker';
import {
  // launchCamera, // Camera functionality removed as requested
  launchImageLibrary,
  ImageLibraryOptions, // Import types for options object
} from 'react-native-image-picker';

// --- Configuration ---
const uploadConfig = {
  maxSizeMB: 50, // General max size in Megabytes
};

// --- Language Definitions ---
const availableLanguages = [
  {label: 'Auto-detect', value: 'auto'},
  {label: 'English', value: 'en'},
  {label: 'Spanish', value: 'es'},
  {label: 'French', value: 'fr'},
  {label: 'German', value: 'de'},
  {label: 'Hindi', value: 'hi'},
  // Add more languages as needed
];
const targetLanguages = availableLanguages.filter(
  lang => lang.value !== 'auto',
);

// --- Document Types Definition ---
const documentTypesForPicker = [
  types.pdf,
  types.doc,
  types.docx,
  types.plainText,
  types.csv,
  // Add other document types you support: types.xls, types.ppt etc.
];

// --- Component ---
export default function UploadScreen() {
  // --- Hooks ---
  const theme = useTheme();
  const navigation = useNavigation();
  // const route = useRoute(); // Currently not using route params after initial setup
  const styles = useMemo(() => createStyles(theme), [theme]);

  // --- State ---
  const [selectedFile, setSelectedFile] = useState(null); // Stores { uri, name, type, size }
  const [isModalVisible, setIsModalVisible] = useState(false); // RN Modal visibility

  // Language selection state
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);
  const [selectedSourceLang, setSelectedSourceLang] = useState(
    availableLanguages[0], // Default to 'Auto-detect'
  );
  const [selectedTargetLang, setSelectedTargetLang] = useState(
    targetLanguages.find(lang => lang.value === 'es') || targetLanguages[0], // Default to Spanish or first target
  );

  // --- Modal Controls ---
  const showModal = useCallback(() => setIsModalVisible(true), []);
  const hideModal = useCallback(() => setIsModalVisible(false), []);

  // --- File Processing Logic ---
  const processSelectedFile = useCallback(
    fileData => {
      // Basic validation
      if (!fileData || !fileData.uri) {
        console.error('Invalid file data received:', fileData);
        Alert.alert('Error', 'Failed to process the selected file.');
        setSelectedFile(null);
        return;
      }

      // Ensure size is a number
      const fileSize = typeof fileData.size === 'number' ? fileData.size : 0;

      // Size check
      if (fileSize > 0 && fileSize / (1024 * 1024) > uploadConfig.maxSizeMB) {
        Alert.alert(
          'File Too Large',
          `File size (${(fileSize / (1024 * 1024)).toFixed(
            2,
          )} MB) exceeds the limit of ${uploadConfig.maxSizeMB}MB.`,
        );
        setSelectedFile(null); // Clear selection if too large
      } else {
        // Construct the final object consistently
        const finalFile = {
          uri: fileData.uri,
          name: fileData.name || 'Unnamed File', // Provide default name
          type: fileData.type || 'application/octet-stream', // Provide default type
          size: fileSize > 0 ? fileSize : null, // Store size if valid, else null
        };
        console.log('Processed file:', finalFile);
        setSelectedFile(finalFile); // Update state with the selected file
      }
    },
    [uploadConfig.maxSizeMB], // Dependency: maxSizeMB
  );

  // --- Picker Handlers ---
  const handleLaunchGallery = useCallback(async () => {
    hideModal(); // Close the selection modal first
    const options = {
      mediaType: 'mixed', // Allow photo and video
      selectionLimit: 1, // Only one file
      quality: 1.0, // Use original quality
      // presentationStyle: 'fullScreen', // Optional: for iOS modal presentation style
    };
    try {
      const result = await launchImageLibrary(options);
      if (result.didCancel) {
        console.log('User cancelled gallery picker');
        return; // Exit if cancelled
      }
      if (result.errorCode) {
        console.error('Gallery Error:', result.errorCode, result.errorMessage);
        Alert.alert(
          'Gallery Error',
          result.errorMessage || 'Could not open gallery.',
        );
        return; // Exit on error
      }
      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Pass relevant data to the processor
        processSelectedFile({
          uri: asset.uri,
          name: asset.fileName,
          type: asset.type,
          size: asset.fileSize,
        });
      }
    } catch (err) {
      console.error('Error launching gallery:', err);
      Alert.alert('Error', 'An error occurred while opening the gallery.');
    }
  }, [processSelectedFile, hideModal]); // Dependencies

  // (Keep other imports and code the same)

  const handleBrowseDocuments = useCallback(async () => {
    hideModal(); // Close the selection modal first
    console.log('[handleBrowseDocuments] Attempting to browse documents...'); // More specific log
    console.log('Using types:', documentTypesForPicker); // Log types being used

    try {
      console.log(
        '[handleBrowseDocuments] Calling DocumentPicker.pickSingle...',
      );
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen', // iOS style
        // Consider 'documentDirectory' if 'cachesDirectory' causes issues
        copyTo: 'cachesDirectory', // Recommended for stability
        type: documentTypesForPicker, // Pass the defined types
      });

      // Log the successful result BEFORE processing
      console.log(
        'Document Picker Success:',
        JSON.stringify(pickerResult, null, 2), // Keep detailed log
      );

      // Pass document picker result to the processor
      processSelectedFile({
        uri: pickerResult.uri,
        name: pickerResult.name,
        type: pickerResult.type,
        size: pickerResult.size,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker.');
      } else {
        // Log the full error object and potentially specific properties
        console.error(
          '[handleBrowseDocuments] Document Picker Error Object:',
          err,
        );
        console.error('[handleBrowseDocuments] Error Code:', err.code); // Log specific code if available
        console.error('[handleBrowseDocuments] Error Message:', err.message); // Log message
        // Also show a generic error to the user
        // Keep the user alert, but add the logged code for reference if possible
        Alert.alert(
          'Document Picker Error',
          `Could not open documents. ${
            err.message || 'Please check permissions or try again.'
          } (Code: ${err.code || 'N/A'})`,
        );
      }
    }
  }, [processSelectedFile, hideModal]); // Dependencies

  // (Keep rest of the component and styles the same)

  // --- Navigation Handlers ---
  const handleContinue = useCallback(() => {
    if (!selectedFile) {
      Alert.alert('Selection Required', 'Please select a file to continue.');
      return;
    }
    // Log data before proceeding
    console.log('--- Starting Translation Process ---');
    console.log(
      'Selected File:',
      selectedFile.name,
      `(${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)`,
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

    // **TODO:** Implement actual upload/translation logic here
    // Example: navigate to a progress screen or start upload
    // navigation.navigate('TranslationProgress', {
    //   fileDetails: selectedFile,
    //   sourceLang: selectedSourceLang.value,
    //   targetLang: selectedTargetLang.value,
    // });

    Alert.alert('Proceeding', 'Upload/Translation logic would start here.'); // Placeholder
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
  }, []);

  const handleSelectTargetLang = useCallback(lang => {
    setSelectedTargetLang(lang);
    closeTargetMenu();
  }, []);

  // --- Render Component ---
  return (
    <View style={styles.container}>
      {/* App Bar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content
          title="Upload Content"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      {/* Main Content Area */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}>
        <Text style={styles.infoText}>
          Select content source for translation
        </Text>

        {/* Upload Box Trigger */}
        <TouchableOpacity onPress={showModal} activeOpacity={0.7}>
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
              {selectedFile ? selectedFile.name : 'Tap to select source'}
            </Text>
            {!selectedFile && (
              <Text style={styles.uploadHintText}>Gallery or Documents</Text>
            )}
            {selectedFile && (
              <Text style={styles.uploadHintText}>
                Size:{' '}
                {selectedFile.size
                  ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
                  : 'N/A'}
                {' | '}Type: {selectedFile.type || 'N/A'}
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

      {/* Selection Modal (using built-in RN Modal) */}
      <ReactNativeModal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal} // Android back button
      >
        <Pressable style={styles.modalBackdrop} onPress={hideModal}>
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
                Choose from Gallery
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
                Browse Documents
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
      borderBottomWidth: StyleSheet.hairlineWidth, // Use hairline for subtle separator
      borderBottomColor: theme.colors.outlineVariant, // Themed separator color
    },
    headerTitle: {
      fontWeight: 'bold',
    },
    contentScroll: {
      // Added ScrollView for content area
      flex: 1,
    },
    content: {
      // Apply padding to the content container inside scrollview
      padding: 20,
      paddingTop: 30, // Space below header
      paddingBottom: 40, // Extra space at the bottom
    },
    infoText: {
      textAlign: 'center',
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 25,
    },
    uploadBox: {
      height: 180,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.roundness * 2, // Themed rounding
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer + '44', // Faint primary container background
      padding: 20,
      marginBottom: 30,
    },
    uploadBoxText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 10, // Prevent long names from touching edges
    },
    uploadHintText: {
      marginTop: 5,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
    languageSection: {
      marginBottom: 20,
    },
    languageLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
      fontWeight: 'bold', // Make labels stand out
    },
    languageSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.roundness, // Consistent rounding
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.surface, // Use surface color for input-like fields
      minHeight: 50,
    },
    languageSelectorText: {
      fontSize: 16,
      color: theme.colors.onSurface, // Standard text on surface
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15, // Add padding around buttons
      borderTopWidth: StyleSheet.hairlineWidth, // Subtle separator
      borderTopColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background, // Match container background
    },
    button: {
      flex: 1, // Make buttons share width
      marginHorizontal: 5,
      borderRadius: theme.roundness * 2.5, // More rounded buttons
    },
    backButton: {
      borderColor: theme.colors.primary, // Primary outline for back button
    },
    continueButton: {
      // Uses primary background by default for contained
    },
    buttonLabel: {
      paddingVertical: 5, // Increase tappable area inside button
      fontWeight: 'bold',
      fontSize: 15,
    },

    // Styles for Built-in React Native Modal
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Slightly darker backdrop
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20, // Add padding so modal doesn't touch edges
    },
    modalContentContainer: {
      width: '100%', // Use full width within padding
      maxWidth: 450,
      borderRadius: theme.roundness * 3, // More pronounced rounding
      paddingTop: 20, // Padding top inside modal
      paddingBottom: 10, // Less padding at bottom
      paddingHorizontal: 0, // Option buttons will handle horizontal padding
      backgroundColor: theme.colors.elevation.level2, // Use elevation for surface color
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      paddingHorizontal: 20, // Padding for title
    },
    modalOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16, // Slightly larger touch target
      paddingHorizontal: 20, // Indent content
    },
    modalOptionIcon: {
      marginRight: 20, // More space next to icon
    },
    modalOptionText: {
      fontSize: 17, // Slightly larger text
    },
    modalDivider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 4,
      marginHorizontal: 20, // Match option padding
    },
    modalCancelButton: {
      marginTop: 10,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary, // Use primary color for cancel
    },
  });
