// screens/DocumentViewScreen.js
import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Platform, Alert} from 'react-native';
import {
  Text,
  useTheme,
  TouchableRipple,
  ActivityIndicator,
  Appbar,
  Icon,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {DocumentsUrl} from '../../../API'; // Import your API URL
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Main Screen Component ---
export default function DocumentViewScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  const {documentId, documentName} = route.params;

  const [activeTab, setActiveTab] = useState('original');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch document details from the API ---
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      if (!documentId) {
        setError('No document ID provided.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await axios.get(`${DocumentsUrl}/${documentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        // Assuming the API returns an object with these properties
        setOriginalText(
          response.data.originalText || 'No original content found.',
        );
        setTranslatedText(
          response.data.translatedText || 'No translated content found.',
        );
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to load document.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [documentId]);

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

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Appbar.Header
        style={{backgroundColor: theme.colors.surface}}
        statusBarHeight={0}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          color={theme.colors.onSurface}
        />
        <Appbar.Content
          title={documentName}
          titleStyle={styles.appbarTitle}
          numberOfLines={1}
          color={theme.colors.onSurface}
        />
      </Appbar.Header>

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
