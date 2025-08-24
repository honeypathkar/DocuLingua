import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';

const DocumentListSkeleton = () => {
  const theme = useTheme();

  return (
    <View style={{marginTop: 20}}>
      <SkeletonPlaceholder
        backgroundColor={theme.colors.surfaceVariant}
        highlightColor={theme.colors.backdrop}
        speed={1000}
        borderRadius={8}>
        {[...Array(5)].map((_, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              paddingHorizontal: 16,
            }}>
            <SkeletonPlaceholder.Item width={40} height={40} borderRadius={8} />

            <View style={{marginLeft: 12, flex: 1}}>
              <SkeletonPlaceholder.Item
                width="70%"
                height={14}
                borderRadius={4}
                marginBottom={6}
              />
              <SkeletonPlaceholder.Item
                width="50%"
                height={12}
                borderRadius={4}
              />
            </View>

            <SkeletonPlaceholder.Item
              width={20}
              height={20}
              borderRadius={10}
            />
          </View>
        ))}
      </SkeletonPlaceholder>
    </View>
  );
};

export default DocumentListSkeleton;
