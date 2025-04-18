// TranslateScreen.js
import React, {useMemo} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView, // Keep ScrollView import
} from 'react-native';
import {Text, useTheme, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import AppHeader from '../../components/AppHeader'; // Assuming you are using this specific header

export default function TranslateScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  const handleOptionPress = docType => {
    console.log(`Selected option: ${docType}`);
    navigation.getParent()?.navigate('UploadScreen', {documentType: docType});
  };

  const handleOpenCamera = () => {
    console.log('Open Camera pressed');
  };

  return (
    <View style={styles.container}>
      {/* Keep your AppHeader if it's outside the scrollable area */}
      <AppHeader />

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {/* --- Add Image Here --- */}
        <Image
          source={require('../../assets/images/translate_screen.png')} // Make sure this path is correct
          style={styles.topImage}
          resizeMode="cover"
        />

        {/* Title and Subtitle */}
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
              {/* ... icon, text, etc. */}
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

          {/* Document Option */}
          {/*   <TouchableOpacity
            onPress={() => handleOptionPress('Document')}
            activeOpacity={0.7}>
            <View style={styles.optionItem}>
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: '#4CAF50'},
                ]}>
                <Icon name="file-document-outline" size={24} color="#fff" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Document</Text>
                <Text style={styles.optionDescription}>
                  Upload DOC, DOCX, or TXT files
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceDisabled}
              />
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Scan Text */}
        <Text style={styles.scanText}>Need to scan a physical document?</Text>

        {/* Open Camera Button */}
        <Button
          mode="contained"
          onPress={handleOpenCamera}
          style={styles.cameraButton}
          labelStyle={styles.cameraButtonLabel}
          icon="camera-outline">
          Open Camera
        </Button>
        {/* Add some extra space at the bottom if needed for better scrolling feel */}
        {/* <View style={{ height: 40 }} /> */}
      </ScrollView>
    </View>
  );
}

// Styles Definition
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1, // Container takes full screen height
      backgroundColor: theme.colors.background,
    },
    // Style for the content container WITHIN the ScrollView
    scrollContentContainer: {
      padding: 20, // Apply padding here
      // Use paddingBottom instead of adding an empty View
      paddingBottom: 40, // Add padding at the bottom
    },
    // Remove styles.content if not used elsewhere, or keep it without flex: 1
    // content: {
    // //  padding: 20, // Padding moved to contentContainerStyle
    // },
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
      // marginBottom: 20 // Add margin if needed before bottom padding kicks in
    },
    cameraButtonLabel: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
