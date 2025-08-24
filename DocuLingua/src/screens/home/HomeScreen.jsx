import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Platform,
  Alert,
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
} from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import ImageCropPicker from 'react-native-image-crop-picker';
import DocumentListSkeleton from '../../components/DocumentSkeleton';
import useDocumentStore from '../../store/documentStore'; // Import the store

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
  const MAX_IMAGE_SIZE_MB = 10;

  useEffect(() => {
    // Fetch documents when the screen is focused to keep data fresh
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
    navigation.navigate('DocumentView', {
      documentId: file._id,
      documentName: file.documentName,
    });
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
            left={() => (
              <List.Icon
                icon={getFileIcon(file.documentName)}
                color={theme.colors.primary}
              />
            )}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => handleFilePress(file)}
            style={[
              styles.listItem,
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
    </View>
  );
}

// The createStyles function remains unchanged
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
});
