import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Platform,
  Alert,
  ToastAndroid,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Title,
  Paragraph,
  Icon,
  SegmentedButtons,
  List,
  useTheme,
  TouchableRipple,
  Surface,
  Checkbox,
  Button,
} from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import DocumentListSkeleton from '../../components/DocumentSkeleton';
import useDocumentStore from '../../store/documentStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {DeleteDocumentsUrl} from '../../../API';

const baseButtons = [
  {value: 'recent', label: 'Recent'},
  {value: 'all', label: 'All Files'},
];

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // State from Zustand store
  const {documents, loading, error, page, totalPages, fetchDocuments} =
    useDocumentStore();

  // Local UI state
  const [listTab, setListTab] = useState('recent');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const MAX_IMAGE_SIZE_MB = 10;

  useEffect(() => {
    if (isFocused) {
      fetchDocuments(page);
    }
  }, [isFocused, page, fetchDocuments]);

  const handleOptionPress = docType => {
    navigation.getParent()?.navigate('UploadScreen', {documentType: docType});
  };

  const handleOpenCamera = async () => {
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
        const fileName =
          image.filename ||
          image.path?.split('/').pop() ||
          `cam_${Date.now()}.jpg`;

        const fileUri = image.path.startsWith('file://')
          ? image.path
          : `file://${image.path}`;

        const fileData = {
          uri: fileUri,
          name: fileName,
          type: image.mime || 'image/jpeg',
          size: image.size || 0,
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

  const handleLongPress = documentId => {
    setSelectionMode(true);
    setSelectedDocuments(new Set([documentId]));
  };

  const handleDocumentSelect = documentId => {
    if (selectionMode) {
      const newSelected = new Set(selectedDocuments);
      if (newSelected.has(documentId)) {
        newSelected.delete(documentId);
      } else {
        newSelected.add(documentId);
      }
      setSelectedDocuments(newSelected);

      // Exit selection mode if no documents are selected
      if (newSelected.size === 0) {
        setSelectionMode(false);
      }
    }
  };

  const handleDeleteDocuments = async () => {
    if (selectedDocuments.size === 0) return;
    setDeleteModalVisible(true);
  };

  const confirmDeleteDocuments = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(DeleteDocumentsUrl, {
        headers: {Authorization: `Bearer ${token}`},
        data: {docIds: Array.from(selectedDocuments)},
      });

      ToastAndroid.show(
        `${selectedDocuments.size} document${
          selectedDocuments.size > 1 ? 's' : ''
        } deleted successfully.`,
        ToastAndroid.SHORT,
      );

      // Reset selection state
      setSelectionMode(false);
      setSelectedDocuments(new Set());
      setDeleteModalVisible(false);

      // Refresh documents
      fetchDocuments(page);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete documents.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedDocuments(new Set());
  };

  const styles = useMemo(() => createStyles(theme), [theme]);

  const styledButtons = useMemo(
    () =>
      baseButtons.map(button => {
        const isActive = button.value === listTab;
        return {
          ...button,
          style: {
            backgroundColor: isActive
              ? theme.colors.primaryContainer
              : 'transparent',
            borderColor: theme.colors.outline,
          },
          labelStyle: {
            color: isActive
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurface,
            fontWeight: isActive ? 'bold' : 'normal',
          },
        };
      }),
    [listTab, theme],
  );

  const handleFilePress = file => {
    if (selectionMode) {
      handleDocumentSelect(file._id);
    } else {
      navigation.navigate('DocumentView', {
        documentId: file._id,
        documentName: file.documentName,
      });
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileIcon = fileName => {
    if (!fileName) return 'file-image';
    if (fileName.endsWith('.pdf')) return 'file-pdf-box';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc'))
      return 'file-word-box';
    if (
      fileName.endsWith('.jpg') ||
      fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') ||
      fileName.endsWith('.gif') ||
      fileName.endsWith('.webp')
    )
      return 'file-image';
    return 'file-image';
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <TouchableRipple
          onPress={() => fetchDocuments(page - 1)}
          disabled={page === 1 || loading}>
          <Icon
            source="chevron-left"
            size={24}
            color={
              page === 1 || loading
                ? theme.colors.disabled
                : theme.colors.primary
            }
          />
        </TouchableRipple>
        <Text style={styles.paginationText}>
          Page {page} of {totalPages}
        </Text>
        <TouchableRipple
          onPress={() => fetchDocuments(page + 1)}
          disabled={page === totalPages || loading}>
          <Icon
            source="chevron-right"
            size={24}
            color={
              page === totalPages || loading
                ? theme.colors.disabled
                : theme.colors.primary
            }
          />
        </TouchableRipple>
      </View>
    );
  };

  const renderFileList = () => {
    if (loading && documents.length === 0) {
      return <DocumentListSkeleton />;
    }

    if (error && documents.length === 0) {
      return <Text style={styles.noFilesText}>{error}</Text>;
    }

    if (documents.length === 0) {
      return <Text style={styles.noFilesText}>No documents found.</Text>;
    }

    const visibleDocs =
      listTab === 'recent' ? documents.slice(0, 5) : documents;

    return (
      <>
        {visibleDocs.map((file, index) => (
          <List.Item
            key={file._id}
            title={file.documentName}
            description={`Translated on: ${formatDate(file.createdAt)}`}
            left={() =>
              selectionMode ? (
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={
                      selectedDocuments.has(file._id) ? 'checked' : 'unchecked'
                    }
                    onPress={() => handleDocumentSelect(file._id)}
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <List.Icon
                  icon={getFileIcon(file.documentName)}
                  color={theme.colors.primary}
                />
              )
            }
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => handleFilePress(file)}
            onLongPress={() => handleLongPress(file._id)}
            style={[
              styles.listItem,
              selectedDocuments.has(file._id) && styles.selectedListItem,
              index < visibleDocs.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.outlineVariant,
              },
            ]}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        ))}
        {listTab === 'all' && totalPages > 1 && renderPagination()}
      </>
    );
  };

  const renderDeleteModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={deleteModalVisible}
      onRequestClose={() => setDeleteModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Confirm Deletion</Text>
          <Text style={styles.modalMessage}>
            Are you sure you want to delete {selectedDocuments.size} document
            {selectedDocuments.size > 1 ? 's' : ''}? This action cannot be
            undone.
          </Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={confirmDeleteDocuments}
              disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderSelectionBar = () => {
    if (!selectionMode) return null;

    return (
      <Surface style={styles.selectionBar} elevation={4}>
        <View style={styles.selectionContent}>
          <Text style={styles.selectionText}>
            {selectedDocuments.size} document
            {selectedDocuments.size !== 1 ? 's' : ''} selected
          </Text>
          <View style={styles.selectionActions}>
            <Button
              mode="text"
              onPress={handleCancelSelection}
              textColor={theme.colors.onSurface}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleDeleteDocuments}
              loading={isDeleting}
              disabled={isDeleting || selectedDocuments.size === 0}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}>
              Delete
            </Button>
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
            }}
            style={styles.welcomeImageBackground}
            imageStyle={styles.imageBackgroundImageStyle}
            resizeMode="cover">
            <View style={styles.textOverlay} />
            <View style={styles.welcomeContent}>
              <Title style={styles.welcomeTitle}>Welcome back!</Title>
              <Paragraph style={styles.welcomeSubtitle}>
                Scan, translate, and manage your documents seamlessly.
              </Paragraph>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            <Surface style={styles.quickActionSurface} elevation={2}>
              <TouchableRipple
                onPress={() => handleOpenCamera()}
                style={styles.quickActionTouchable}
                borderless={true}>
                <View style={styles.quickActionContent}>
                  <Icon
                    source="camera-plus-outline"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.quickActionText}>Scan Note</Text>
                </View>
              </TouchableRipple>
            </Surface>
            <Surface style={styles.quickActionSurface} elevation={2}>
              <TouchableRipple
                onPress={() => handleOptionPress('PDF')}
                style={styles.quickActionTouchable}
                borderless={true}>
                <View style={styles.quickActionContent}>
                  <Icon
                    source="upload"
                    size={32}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.quickActionText}>Upload PDF</Text>
                </View>
              </TouchableRipple>
            </Surface>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <SegmentedButtons
            value={listTab}
            onValueChange={setListTab}
            style={styles.segmentedButtons}
            buttons={styledButtons}
            density="medium"
          />
          <List.Section style={styles.listSection}>
            {renderFileList()}
          </List.Section>
        </View>
      </ScrollView>
      {renderSelectionBar()}
      {renderDeleteModal()}
    </View>
  );
}

const createStyles = theme => ({
  container: {flex: 1, backgroundColor: theme.colors.background},
  scrollContent: {paddingHorizontal: 16, paddingBottom: 20},
  welcomeContainer: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {elevation: 4},
    }),
    backgroundColor: theme.colors.surface,
  },
  welcomeImageBackground: {height: 200, justifyContent: 'center'},
  imageBackgroundImageStyle: {borderRadius: 12},
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
  },
  welcomeContent: {
    padding: 20,
    alignItems: 'flex-start',
  },
  welcomeTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 24,
  },
  welcomeSubtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  sectionContainer: {marginBottom: 24},
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontSize: 18,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionSurface: {
    borderRadius: 12,
    width: '48%',
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {elevation: 2},
    }),
  },
  quickActionTouchable: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  listSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {elevation: 2},
    }),
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  selectedListItem: {
    backgroundColor: theme.colors.primaryContainer + '20',
  },
  listItemTitle: {
    fontSize: 16,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  listItemDescription: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  noFilesText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: theme.colors.onSurfaceVariant,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
  },
  paginationText: {
    marginHorizontal: 16,
    color: theme.colors.onSurface,
    fontSize: 14,
  },
  checkboxContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  selectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  selectionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.onSurface,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.onSurfaceVariant,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: theme.colors.secondaryContainer,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  modalButtonText: {
    color: theme.colors.onSecondaryContainer,
    fontWeight: 'bold',
  },
});
