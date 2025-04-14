import React from 'react';
import {View} from 'react-native';
import {Text, Appbar} from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View>
      <Appbar.Header>
        <Appbar.Content title="Home" />
      </Appbar.Header>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text variant="headlineSmall">Home Screen</Text>
      </View>
    </View>
  );
}
