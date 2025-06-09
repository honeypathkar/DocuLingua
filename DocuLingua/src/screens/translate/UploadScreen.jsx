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
  ToastAndroid,
} from 'react-native';
import {
  Text,
  useTheme,
  Button,
  Appbar,
  Menu,
  ActivityIndicator, // Still needed for the simple loader
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';

import DocumentPicker, {
  types,
  isCancel,
  pick,
} from '@react-native-documents/picker';

import ImageCropPicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {UploadDocumentUrl, TranslateTextUrl} from '../../../API';
import MLKitOCR from 'react-native-mlkit-ocr';

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
  pdf: [types.pdf],
  image: [],
};

export default function UploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const initialDocType = route.params?.documentType;
  const capturedImageData = route.params?.capturedImageData;

  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [targetMenuVisible, setTargetMenuVisible] = useState(false);
  const [selectedSourceLang, setSelectedSourceLang] = useState(
    availableLanguages[0],
  );
  const [selectedTargetLang, setSelectedTargetLang] = useState(
    targetLanguages.find(lang => lang.value === 'es') || targetLanguages[0],
  );

  // Only `isLoading` state is needed now
  const [isLoading, setIsLoading] = useState(false);

  const showModal = useCallback(() => setIsModalVisible(true), []);
  const hideModal = useCallback(() => setIsModalVisible(false), []);

  const processSelectedFile = useCallback(fileData => {
    if (!fileData || !fileData.uri) {
      Alert.alert('Error', 'Failed to process the selected file.');
      setSelectedFile(null);
      return;
    }
    const fileSize = typeof fileData.size === 'number' ? fileData.size : 0;
    if (fileSize > 0 && fileSize / (1024 * 1024) > uploadConfig.maxSizeMB) {
      Alert.alert(
        'File Too Large',
        `File size is too large. Max size: ${uploadConfig.maxSizeMB}MB.`,
      );
      setSelectedFile(null);
    } else {
      const finalFile = {
        uri: fileData.uri,
        name: fileData.name || 'Unnamed File',
        type: fileData.type || 'application/octet-stream',
        size: fileSize > 0 ? fileSize : null,
      };
      setSelectedFile(finalFile);
    }
  }, []);

  useEffect(() => {
    if (capturedImageData) {
      processSelectedFile(capturedImageData);
    }
  }, [capturedImageData, processSelectedFile]);

  const handleLaunchGallery = useCallback(async () => {
    hideModal();
    try {
      const image = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        compressImageQuality: 0.7,
      });
      if (image) {
        processSelectedFile({
          uri: image.path,
          name: image.filename || 'selected.jpg',
          type: image.mime || 'image/jpeg',
          size: image.size,
        });
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Gallery Error', error.message || 'An error occurred.');
      }
    }
  }, [hideModal, processSelectedFile]);

  const handleBrowseDocuments = useCallback(async () => {
    hideModal();
    try {
      const [pickerResult] = await pick({
        mode: 'open',
        type: [types.pdf],
      });
      processSelectedFile(pickerResult);
    } catch (err) {
      if (!isCancel(err)) {
        Alert.alert('Picker Error', err.message || 'Could not open documents.');
      }
    }
  }, [hideModal, processSelectedFile]);

  const handleUploadBoxPress = useCallback(() => {
    if (initialDocType === 'PDF') {
      handleBrowseDocuments();
    } else if (initialDocType === 'Image') {
      handleLaunchGallery();
    } else {
      showModal();
    }
  }, [initialDocType, handleBrowseDocuments, handleLaunchGallery, showModal]);

  const extractTextFromImage = async imageUri => {
    try {
      const result = await MLKitOCR.detectFromUri(imageUri);

      if (Array.isArray(result) && result.length > 0) {
        return result.map(block => block.text).join(' ');
      } else {
        if (result && Array.isArray(result.blocks)) {
          return result.blocks.map(block => block.text).join(' ');
        }
      }
      return '';
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  };

  const handleContinue = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Selection Required', 'Please select a file to continue.');
      return;
    }

    setIsLoading(true);
    const token = await AsyncStorage.getItem('userToken');

    try {
      // Logic for IMAGE file
      if (selectedFile.type.startsWith('image/')) {
        const extractedText = await extractTextFromImage(selectedFile.uri);

        if (!extractedText) {
          throw new Error('No text could be extracted from the image.');
        }

        const responseText = await axios.post(
          TranslateTextUrl,
          {
            documentName: selectedFile.name,
            targetLanguage: selectedTargetLang.value,
            text: extractedText,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );
        ToastAndroid.show('Translation successful!', ToastAndroid.SHORT);
        console.log(responseText.data);

        // Logic for PDF file
      } else if (selectedFile.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('documentName', selectedFile.name);
        formData.append('targetLanguage', selectedTargetLang.value);
        formData.append('file', {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.type,
        });

        const responsePDF = await axios.post(UploadDocumentUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        ToastAndroid.show('Upload successful!', ToastAndroid.SHORT);
        console.log(responsePDF.data);
      } else {
        throw new Error(`Unsupported file type: ${selectedFile.type}`);
      }
      // Navigate to Home Screen on success
      navigation.navigate('MainApp');
    } catch (error) {
      console.error('Processing Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.message ||
          'Failed to process document.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, selectedTargetLang, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content
          title="Upload Content"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.infoText}>
          {selectedFile
            ? 'Review selection and languages'
            : `Select a ${initialDocType || 'file'} and languages`}
        </Text>

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
            {selectedFile && (
              <Text style={styles.uploadHintText}>
                Size:{' '}
                {selectedFile.size
                  ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
                  : 'N/A'}
                {' | '}Type: {selectedFile.type || 'N/A'}
                {'\n'}(Tap to change selection)
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Target Language</Text>
          <Menu
            visible={targetMenuVisible}
            onDismiss={closeTargetMenu}
            anchor={
              <TouchableOpacity
                style={styles.languageSelector}
                onPress={openTargetMenu}>
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

      {/* --- Bottom Buttons Area --- */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleGoBack}
          style={[styles.button, styles.backButton]}
          labelStyle={styles.buttonLabel}
          disabled={isLoading} // Also disable back button while loading
        >
          Back
        </Button>

        {/* This section now shows either the button or the loader */}
        <View style={[styles.button, styles.continueButtonWrapper]}>
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.continueButton}
              labelStyle={styles.buttonLabel}
              disabled={!selectedFile}>
              Continue
            </Button>
          )}
        </View>
      </View>

      {/* --- Selection Modal (Fallback) --- */}
      <ReactNativeModal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal}>
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
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={handleLaunchGallery}>
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
                Photos
              </Text>
            </TouchableOpacity>
            <View style={styles.modalDivider} />
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={handleBrowseDocuments}>
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
                Documents (PDF)
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </ReactNativeModal>

      {/* The Dialog and Portal have been removed */}
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineVariant,
    },
    headerTitle: {
      fontWeight: 'bold',
      textAlign: 'left',
    },
    contentScroll: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingTop: 30,
      paddingBottom: 40,
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
      borderRadius: theme.roundness * 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer + '4D',
      padding: 20,
      marginBottom: 30,
    },
    uploadBoxText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 10,
    },
    uploadHintText: {
      marginTop: 5,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 10,
      lineHeight: 18,
    },
    languageSection: {
      marginBottom: 20,
    },
    languageLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
      fontWeight: 'bold',
    },
    languageSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: theme.roundness,
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.surface,
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
      backgroundColor: theme.colors.background,
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
    },
    backButton: {
      borderColor: theme.colors.primary,
      borderRadius: theme.roundness * 2.5,
    },
    continueButtonWrapper: {
      // Wrapper to hold either the button or the loader
    },
    continueButton: {
      borderRadius: theme.roundness * 2.5,
    },
    buttonLabel: {
      paddingVertical: 5,
      fontWeight: 'bold',
      fontSize: 15,
    },
    loadingWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness * 2.5,
      height: 48, // Match button height
    },
    loadingText: {
      marginLeft: 10,
      fontSize: 15,
      fontWeight: 'bold',
      color: theme.colors.onPrimary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContentContainer: {
      width: '100%',
      maxWidth: 450,
      borderRadius: theme.roundness * 3,
      paddingVertical: 10,
      backgroundColor: theme.colors.elevation.level2,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      paddingHorizontal: 20,
      color: theme.colors.onSurface,
    },
    modalOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    modalOptionIcon: {
      marginRight: 20,
    },
    modalOptionText: {
      fontSize: 17,
      color: theme.colors.onSurface,
    },
    modalDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outlineVariant,
      marginHorizontal: 20,
    },
  });
