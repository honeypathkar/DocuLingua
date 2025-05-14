// screens/HomeScreen.js
import React, {useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ImageBackground,
  Platform,
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

// --- Navigation Imports ---
import {useNavigation} from '@react-navigation/native';
import useUserStore from '../../store/userStore';

// Placeholder data for the file list
const filesData = [
  {
    id: '1',
    name: 'Business Contract.pdf',
    date: 'Today, 10:45 AM',
    icon: 'file-pdf-box',
    type: 'pdf',
  },
  {
    id: '2',
    name: 'Meeting Notes.docx',
    date: 'Yesterday, 3:15 PM',
    icon: 'file-word-box',
    type: 'doc',
  },
  {
    id: '3',
    name: 'Presentation Slides.pptx',
    date: 'April 14, 9:00 AM',
    icon: 'file-powerpoint-box',
    type: 'ppt',
  },
  {
    id: '4',
    name: 'Invoice_April.xlsx',
    date: 'April 12, 11:00 AM',
    icon: 'file-excel-box',
    type: 'xls',
  },
];

// --- Define base button data ---
const baseButtons = [
  {value: 'recent', label: 'Recent'},
  {value: 'favorites', label: 'Favorites'},
  {value: 'all', label: 'All Files'},
];

export default function HomeScreen() {
  const theme = useTheme();
  const [listTab, setListTab] = useState('recent');
  const navigation = useNavigation(); // Use navigation hook
  const {fetchDetails} = useUserStore();

  useEffect(() => {
    fetchDetails();
  }, []);

  // --- Create Styles INSIDE the component ---
  const styles = useMemo(() => createStyles(theme), [theme]); // Pass theme

  // --- Create styled buttons dynamically based on listTab state ---
  const styledButtons = useMemo(
    () =>
      baseButtons.map(button => {
        const isActive = button.value === listTab;
        return {
          ...button,
          style: {
            // Style for the button itself within SegmentedButtons
            backgroundColor: isActive
              ? theme.colors.primaryContainer
              : 'transparent', // Use transparent for inactive
            borderColor: theme.colors.outline, // Use outline color for border
          },
          labelStyle: {
            // Style for the text label inside the button
            color: isActive
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurface,
            fontWeight: isActive ? 'bold' : 'normal',
          },
          // Adding ripple color for feedback
          rippleColor: theme.colors.primaryContainer,
        };
      }),
    [listTab, theme],
  );

  // Filter files based on tab (example - you'd implement actual filtering)
  const displayedFiles = filesData; // Placeholder: Show all files for now

  // --- Handle Navigation ---
  const handleFilePress = file => {
    console.log(`Navigating to view: ${file.name}`);
    navigation.navigate('DocumentView', {
      // Navigate with parameters
      documentId: file.id,
      documentName: file.name,
    });
  };

  // --- JSX Structure ---
  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80', // Example image
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

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            <Surface style={styles.quickActionSurface} elevation={2}>
              <TouchableRipple
                onPress={() => console.log('Scan Note pressed')}
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
                onPress={() => console.log('Upload PDF pressed')}
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

        {/* Files Section */}
        <View style={styles.sectionContainer}>
          <SegmentedButtons
            value={listTab}
            onValueChange={setListTab}
            style={styles.segmentedButtons} // Styles for the container View
            buttons={styledButtons} // Pass the styled buttons array
            density="medium" // Adjust density for spacing
          />
          <List.Section style={styles.listSection}>
            {displayedFiles.map((file, index) => (
              <List.Item
                key={file.id}
                title={file.name}
                description={file.date}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={file.icon}
                    color={theme.colors.primary}
                  />
                )}
                right={props => (
                  <List.Icon
                    {...props}
                    icon="chevron-right"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
                onPress={() => handleFilePress(file)} // Pass the file object
                style={[
                  styles.listItem,
                  // Add border only if it's not the last item
                  index < displayedFiles.length - 1
                    ? {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.colors.outlineVariant,
                      }
                    : null,
                ]}
                titleStyle={styles.listItemTitle}
                descriptionStyle={styles.listItemDescription}
                // Ripple effect for list item press
                rippleColor="rgba(0, 0, 0, .1)"
              />
            ))}
            {displayedFiles.length === 0 && (
              <Text style={styles.noFilesText}>
                No files found in this category.
              </Text>
            )}
          </List.Section>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles function (createStyles) ---
const createStyles = theme =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background},
    scrollContent: {paddingHorizontal: 16, paddingBottom: 20},
    welcomeContainer: {
      marginTop: 16, // Add space from AppHeader
      marginBottom: 24,
      borderRadius: 12,
      overflow: 'hidden', // Needed for borderRadius on ImageBackground
      // Add elevation/shadow for depth
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {elevation: 4},
      }),
      backgroundColor: theme.colors.surface, // Ensure background for shadow
    },
    welcomeImageBackground: {height: 200, justifyContent: 'center'}, // Reduced height
    imageBackgroundImageStyle: {borderRadius: 12}, // Match container radius
    textOverlay: {
      // Dark overlay for better text readability
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      borderRadius: 12,
    },
    welcomeContent: {
      padding: 20, // Increased padding
      alignItems: 'flex-start', // Align text to the start
    },
    welcomeTitle: {
      color: 'white',
      fontWeight: 'bold',
      marginBottom: 4,
      fontSize: 24, // Larger title
    },
    welcomeSubtitle: {
      color: 'white',
      fontSize: 14,
      opacity: 0.9, // Slightly transparent subtitle
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
      justifyContent: 'space-between', // Use space-between for edge spacing
    },
    quickActionSurface: {
      borderRadius: 12,
      width: '48%', // Slightly adjust width for spacing
      backgroundColor: theme.colors.surface,
      // Consistent elevation with welcome card
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
      borderRadius: 12, // Match Surface borderRadius
      alignItems: 'center', // Center content horizontally
    },
    quickActionContent: {
      alignItems: 'center', // Center icon and text vertically
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
      // Container styling handled internally by SegmentedButtons usually
    },
    listSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      overflow: 'hidden', // Clip List.Item borders to the rounded corners
      // Add elevation/shadow
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
      backgroundColor: 'transparent', // Let List.Section handle background
    },
    listItemTitle: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500', // Medium weight title
    },
    listItemDescription: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant, // Subdued color for date/description
    },
    noFilesText: {
      textAlign: 'center',
      paddingVertical: 20,
      color: theme.colors.onSurfaceVariant,
    },
  });
