import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import {
  Text,
  useTheme,
  TouchableRipple,
  ActivityIndicator,
  Appbar,
  Icon,
  Menu,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {
  DocumentsUrl,
  DocumentCurdOperationUrl,
  DeleteDocumentsUrl,
} from '../../../API';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DocumentViewScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();

  const {documentId, documentName: initialDocumentName} = route.params;

  const [activeTab, setActiveTab] = useState('original');
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [documentName, setDocumentName] = useState(initialDocumentName);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState(initialDocumentName);
  const [isUpdating, setIsUpdating] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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

  const handleUpdateName = async () => {
    if (!newDocumentName.trim()) {
      Alert.alert('Error', 'Document name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.patch(
        `${DocumentCurdOperationUrl}/${documentId}`,
        {documentName: newDocumentName},
        {headers: {Authorization: `Bearer ${token}`}},
      );
      setDocumentName(newDocumentName);
      setEditModalVisible(false);
      ToastAndroid.show(
        'Document name updated successfully.',
        ToastAndroid.SHORT,
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update document name.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDocument = async () => {
    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(DeleteDocumentsUrl, {
        headers: {Authorization: `Bearer ${token}`},
        data: {docIds: [documentId]},
      });
      setDeleteModalVisible(false);
      ToastAndroid.show('Document deleted successfully.', ToastAndroid.SHORT);
      navigation.goBack();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete document.';
      Alert.alert('Error', errorMessage);
      setIsUpdating(false);
    }
  };

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
        <Text style={styles.contentText} selectable={true}>
          {textToShow}
        </Text>
      </ScrollView>
    );
  };

  const styles = getStyles(theme);

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Document Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setNewDocumentName}
              value={newDocumentName}
              placeholder="Enter new name"
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateName}
                disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteDocument}
                disabled={isUpdating}>
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <Appbar.Action
                icon="dots-vertical"
                color={theme.colors.onSurface}
                onPress={openMenu}
              />
            }>
            <Menu.Item
              onPress={() => {
                setNewDocumentName(documentName);
                setEditModalVisible(true);
                closeMenu();
              }}
              title="Edit Name"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setDeleteModalVisible(true);
                closeMenu();
              }}
              title="Delete"
              leadingIcon="trash-can-outline"
              titleStyle={{color: 'red'}}
            />
          </Menu>
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
    </>
  );
}

const getStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    appbarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
      width: '85%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {elevation: 5},
      }),
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: theme.colors.onSurface,
    },
    modalMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 22,
    },
    input: {
      width: '100%',
      height: 45,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 20,
      fontSize: 16,
      color: theme.colors.onSurface,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
      backgroundColor: theme.colors.secondaryContainer,
    },
    confirmButton: {
      backgroundColor: theme.colors.primary,
    },
    deleteButton: {
      backgroundColor: theme.colors.error,
    },
    modalButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
