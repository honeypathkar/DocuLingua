import React, {useMemo, useState, useCallback} from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {Text, useTheme, Button, Appbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import DocumentPicker, {types} from '@react-native-documents/picker'; // Import document picker

// Define configurations for each document type
const uploadConfig = {
  PDF: {
    label: 'PDF',
    mimeTypes: [types.pdf],
    maxSizeMB: 50,
    icon: 'file-pdf-box',
  },
  Image: {
    label: 'Image',
    mimeTypes: [types.images], // Covers jpg, png, gif etc.
    maxSizeMB: 10,
    icon: 'image',
  },
  Document: {
    label: 'Document',
    mimeTypes: [types.doc, types.docx, types.plainText], // DOC, DOCX, TXT
    maxSizeMB: 20,
    icon: 'file-document',
  },
};

export default function UploadScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [selectedFile, setSelectedFile] = useState(null);

  // Get document type from navigation params, default to 'Document' if somehow missing
  const documentType = route.params?.documentType || 'Document';
  const config = uploadConfig[documentType];

  // File Picker Logic
  const handlePickDocument = useCallback(async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory', // Recommended for handling files
        type: config.mimeTypes, // Use dynamic mime types
      });
      console.log('Selected file:', pickerResult);
      // Basic size check (optional, enhance as needed)
      if (
        pickerResult.size &&
        pickerResult.size / (1024 * 1024) > config.maxSizeMB
      ) {
        alert(`File size exceeds the limit of ${config.maxSizeMB}MB.`);
        setSelectedFile(null);
      } else {
        setSelectedFile(pickerResult);
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error picking document:', err);
        alert('An error occurred while picking the file.');
        setSelectedFile(null);
      }
    }
  }, [config.mimeTypes, config.maxSizeMB]); // Recreate function if config changes

  const handleContinue = () => {
    if (!selectedFile) {
      alert('Please select a file to continue.');
      return;
    }
    console.log('Continuing with file:', selectedFile.name);
    // Add logic to proceed with translation (e.g., upload file, navigate)
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} />
        <Appbar.Content
          title="Upload Document"
          titleStyle={styles.headerTitle}
        />
        {/* Optionally add more actions here */}
      </Appbar.Header>

      <View style={styles.content}>
        {/* Top descriptive text (from image) - optional */}
        <Text style={styles.infoText}>
          Upload your file to begin translation
        </Text>

        {/* Upload Box */}
        <TouchableOpacity onPress={handlePickDocument} activeOpacity={0.7}>
          <View style={styles.uploadBox}>
            <Icon
              name="cloud-upload-outline"
              size={50}
              color={theme.colors.primary}
            />
            <Text style={styles.uploadBoxText}>
              {selectedFile ? selectedFile.name : 'Click to upload'}
            </Text>
            {!selectedFile && (
              <Text style={styles.uploadHintText}>
                {config.label} (up to {config.maxSizeMB}MB)
              </Text>
            )}
            {selectedFile && (
              <Text style={styles.uploadHintText}>
                Size:{' '}
                {selectedFile.size
                  ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
                  : 'N/A'}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* --- Language Selection (Placeholder) --- */}
        {/* Replace these with actual dropdown components */}
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Source Language</Text>
          <View style={styles.languageSelector}>
            <Text>Auto-detect</Text>
            <Icon
              name="chevron-down"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>
        <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Target Language</Text>
          <View style={styles.languageSelector}>
            <Text>Spanish</Text>
            <Icon
              name="chevron-down"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </View>
        {/* --- End Language Selection --- */}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleGoBack}
            style={[styles.button, styles.backButton]}
            labelStyle={styles.buttonLabel}>
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={[styles.button, styles.continueButton]}
            labelStyle={styles.buttonLabel}
            disabled={!selectedFile} // Disable Continue if no file selected
          >
            Continue
          </Button>
        </View>
      </View>
    </View>
  );
}

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      fontWeight: 'bold', // Make header title bold
    },
    content: {
      flex: 1,
      padding: 20,
      paddingTop: 30, // Add some space below header
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
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant + '33', // Light background tint
      padding: 20,
      marginBottom: 40,
    },
    uploadBoxText: {
      marginTop: 15,
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
      textAlign: 'center',
    },
    uploadHintText: {
      marginTop: 5,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
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
      borderRadius: 4,
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: theme.colors.surface,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 'auto', // Push buttons to the bottom
      paddingTop: 20,
      borderTopWidth: 1, // Optional separator line
      borderTopColor: theme.colors.outlineVariant,
    },
    button: {
      flex: 1, // Make buttons take equal width
      marginHorizontal: 5, // Add space between buttons
      borderRadius: 8,
    },
    backButton: {
      borderColor: theme.colors.outline, // Use standard outline color
    },
    continueButton: {
      // Use primary color (default for contained)
    },
    buttonLabel: {
      paddingVertical: 5, // Add vertical padding inside button
      fontWeight: 'bold',
    },
  });
