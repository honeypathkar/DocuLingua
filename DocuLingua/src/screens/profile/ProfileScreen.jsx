import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import AppHeader from '../../components/AppHeader';

export default function ProfileScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]); // Pass theme

  return (
    <View style={styles.container}>
      <AppHeader />
    </View>
  );
}

const createStyles = theme =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: theme.colors.background},
  });
