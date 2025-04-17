// screens/DocumentViewScreen.js
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Platform} from 'react-native';
// --- Import Appbar and useNavigation ---
import {
  Text,
  useTheme,
  TouchableRipple,
  ActivityIndicator,
  Appbar, // Import Appbar
  Icon,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native'; // Import useNavigation
// --- End Imports ---

// --- Main Screen Component ---
export default function DocumentViewScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation(); // Get navigation object

  const documentId = route.params?.documentId ?? 'unknown';
  const documentName = route.params?.documentName ?? 'Document';

  const [activeTab, setActiveTab] = useState('original');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Simulate fetching data (useEffect remains the same) ---
  useEffect(() => {
    console.log(`Fetching content for document ID: ${documentId}`);
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        if (documentId === 'error') {
          throw new Error('Failed to load document content.');
        }
        setOriginalText(
          `This is the ORIGINAL content for ${documentName} (ID: ${documentId}).\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
        );
        setTranslatedText(
          `Este es el contenido TRADUCIDO para ${documentName} (ID: ${documentId}).\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
        );
        setLoading(false);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err.message || 'An unexpected error occurred.');
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [documentId, documentName]);

  // --- renderContent function remains the same ---
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredMessage}>
          <ActivityIndicator
            animating={true}
            color={theme.colors.primary}
            size="large"
          />
          <Text style={styles.loadingText}>Loading Content...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centeredMessage}>
          <Icon
            source="alert-circle-outline"
            size={40}
            color={theme.colors.error}
          />
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      );
    }
    const textToShow = activeTab === 'original' ? originalText : translatedText;
    return (
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}>
        <Text style={styles.contentText}>{textToShow}</Text>
      </ScrollView>
    );
  };

  // --- Styles ---
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      {/* --- Add Appbar --- */}
      <Appbar.Header
        style={{backgroundColor: theme.colors.surface}}
        statusBarHeight={0} // Adjust if status bar is handled differently
      >
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color={theme.colors.onSurface}
        />
        <Appbar.Content
          title={documentName}
          titleStyle={styles.appbarTitle}
          numberOfLines={1} // Ensure long titles don't wrap excessively
          color={theme.colors.onSurface}
        />
        {/* Add other actions if needed, e.g., share, translate options */}
        {/* <Appbar.Action icon="share-variant" onPress={() => {}} color={theme.colors.onSurface} /> */}
      </Appbar.Header>
      {/* --- End Appbar --- */}

      {/* Tab Buttons Container */}
      <View style={styles.tabBar}>
        <TouchableRipple
          onPress={() => setActiveTab('original')}
          style={[
            styles.tabButton,
            activeTab === 'original' && styles.activeTab,
          ]}
          rippleColor="rgba(0, 0, 0, .1)"
          borderless={true}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'original'
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}>
            Original
          </Text>
        </TouchableRipple>
        <TouchableRipple
          onPress={() => setActiveTab('translated')}
          style={[
            styles.tabButton,
            activeTab === 'translated' && styles.activeTab,
          ]}
          rippleColor="rgba(0, 0, 0, .1)"
          borderless={true}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'translated'
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}>
            Translated
          </Text>
        </TouchableRipple>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>{renderContent()}</View>
    </View>
  );
}

// --- Function to generate styles ---
// Added appbarTitle style
const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Style for Appbar Title if needed (e.g., font size)
    appbarTitle: {
      fontSize: 18, // Adjust as needed
      fontWeight: 'bold',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      // Shadow/elevation can remain here or be part of Appbar's style if preferred
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.1,
          shadowRadius: 1,
        },
        android: {elevation: 2},
      }),
    },
    tabButton: {
      flex: 1,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    inactiveTabText: {
      color: theme.colors.onSurfaceVariant,
    },
    contentArea: {
      flex: 1,
    },
    scrollArea: {
      flex: 1,
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    contentText: {
      color: theme.colors.onSurface,
      fontSize: 16,
      lineHeight: 24,
    },
    centeredMessage: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
    },
    errorText: {
      marginTop: 10,
      color: theme.colors.error,
      fontSize: 16,
      textAlign: 'center',
    },
  });
