import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {Text, Appbar} from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View>
      <Appbar.Header style={styles.appBar}>
        <Image
          source={require('../assets/images/logo.png')} // Adjust path if needed
          style={styles.appIconSmall}
        />
        <Text style={styles.appBarTitle}>
          <Text style={{color: '#3777F8'}}>Docu</Text>Lingua
        </Text>
      </Appbar.Header>

      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text variant="headlineSmall">Home Screen</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: 'white',
    elevation: 4,
    paddingHorizontal: 10,
  },
  appIconSmall: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
