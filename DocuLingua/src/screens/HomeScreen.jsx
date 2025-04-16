// screens/HomeScreen.tsx
import React, {useState, useMemo} from 'react'; // Import useMemo for optimization
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
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
import AppHeader from '../components/AppHeader';

// Placeholder data for the file list (remains the same)
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
];

// --- Define base button data ---
const baseButtons = [
  {value: 'recent', label: 'Recent'},
  {value: 'favorites', label: 'Favorites'},
  {value: 'all', label: 'All Files'},
];

export default function HomeScreen() {
  const theme = useTheme(); // Access theme
  const [listTab, setListTab] = useState('recent');
  const displayedFiles = filesData;

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
            backgroundColor: isActive
              ? theme.colors.primaryContainer
              : undefined,
            // You can add other conditional styles like borderColor if needed
            // borderColor: isActive ? theme.colors.primary : theme.colors.outline,
          },
          labelStyle: {
            color: isActive
              ? theme.colors.onPrimaryContainer
              : theme.colors.onSurface,
          },
        };
      }),
    [listTab, theme],
  ); // Recalculate when listTab or theme changes

  // --- JSX Structure ---
  return (
    <View style={styles.container}>
      <AppHeader showSearchIcon={true} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
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

        {/* Quick Actions Section */}
        <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            {/* Scan Note Action */}
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
            {/* Upload PDF Action */}
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
          {/* Use the dynamically styled buttons */}
          <SegmentedButtons
            value={listTab}
            onValueChange={setListTab}
            style={styles.segmentedButtons} // Styles for the container View
            // REMOVED incorrect backgroundColor prop from here
            buttons={styledButtons} // Pass the styled buttons array
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
                onPress={() => console.log(`Pressed ${file.name}`)}
                style={[
                  styles.listItem,
                  {
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
                titleStyle={styles.listItemTitle}
              />
            ))}
          </List.Section>
        </View>
      </ScrollView>
    </View>
  );
}

// --- Moved Styles creation into a function to pass theme ---
// (Keep this function as defined in the previous correct example)
const createStyles = theme =>
  StyleSheet.create({
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
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        android: {elevation: 4},
      }),
      backgroundColor: theme.colors.surface,
    },
    welcomeImageBackground: {height: 200, justifyContent: 'center'},
    imageBackgroundImageStyle: {borderRadius: 12},
    textOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 12,
    },
    welcomeContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
      justifyContent: 'center',
    },
    welcomeTitle: {color: 'white', fontWeight: 'bold', marginBottom: 4},
    welcomeSubtitle: {color: 'white', fontSize: 14},
    sectionContainer: {marginBottom: 24},
    sectionTitle: {
      marginBottom: 12,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    quickActionSurface: {
      borderRadius: 12,
      width: '45%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    quickActionTouchable: {
      width: '100%',
      paddingVertical: 20,
      borderRadius: 12,
    },
    quickActionContent: {alignItems: 'center', justifyContent: 'center'},
    quickActionText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    segmentedButtons: {marginBottom: 16}, // Styles FOR THE CONTAINER
    listSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },
    listItem: {paddingVertical: 10, backgroundColor: theme.colors.surface},
    listItemTitle: {fontSize: 16, color: theme.colors.onSurface},
  });
