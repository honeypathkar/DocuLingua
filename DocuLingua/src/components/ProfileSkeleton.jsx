import {useMemo} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export const ProfileSkeleton = ({theme}) => {
  const screenWidth = Dimensions.get('window').width;

  const skeletonStyles = useMemo(() => createSkeletonStyles(theme), [theme]);

  return (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surfaceVariant}
      highlightColor={theme.colors.backdrop}
      speed={1000}>
      <View style={skeletonStyles.container}>
        <View style={skeletonStyles.header}>
          <SkeletonPlaceholder.Item
            width={100}
            height={100}
            borderRadius={50}
            marginBottom={12}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.5}
            height={24}
            borderRadius={4}
            marginBottom={6}
          />
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.6}
            height={18}
            borderRadius={4}
            marginBottom={10}
          />
        </View>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-around"
          alignItems="center"
          marginBottom={20}
          paddingVertical={15}
          borderRadius={12}
          height={60}
        />
        <View style={skeletonStyles.listSection}>
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.4}
            height={20}
            borderRadius={4}
            marginBottom={15}
          />
          {[1, 2].map(key => (
            <SkeletonPlaceholder.Item
              key={`list1-${key}`}
              flexDirection="row"
              alignItems="center"
              marginBottom={15}>
              <SkeletonPlaceholder.Item
                width={24}
                height={24}
                borderRadius={12}
                marginRight={15}
              />
              <View>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.7}
                  height={18}
                  borderRadius={4}
                  marginBottom={5}
                />
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.5}
                  height={14}
                  borderRadius={4}
                />
              </View>
            </SkeletonPlaceholder.Item>
          ))}
        </View>
        <View style={skeletonStyles.listSection}>
          <SkeletonPlaceholder.Item
            width={screenWidth * 0.3}
            height={20}
            borderRadius={4}
            marginBottom={15}
          />
          {[1, 2].map(key => (
            <SkeletonPlaceholder.Item
              key={`list2-${key}`}
              flexDirection="row"
              alignItems="center"
              marginBottom={15}>
              <SkeletonPlaceholder.Item
                width={24}
                height={24}
                borderRadius={12}
                marginRight={15}
              />
              <View>
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.7}
                  height={18}
                  borderRadius={4}
                  marginBottom={5}
                />
                <SkeletonPlaceholder.Item
                  width={screenWidth * 0.5}
                  height={14}
                  borderRadius={4}
                />
              </View>
            </SkeletonPlaceholder.Item>
          ))}
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};
const createSkeletonStyles = theme =>
  StyleSheet.create({
    container: {paddingHorizontal: 16, paddingTop: 0},
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      marginBottom: 20,
    },
    listSection: {marginBottom: 20},
  });
