import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [soundFx, setSoundFx] = useState(true);
  const [timer, setTimer] = useState(60);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preferences</Text>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>Sound Effects</Text>
          <Text style={styles.subtitle}>Match iOS setting stored in UserDefaults.</Text>
        </View>
        <Switch value={soundFx} onValueChange={setSoundFx} />
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.title}>Timer</Text>
          <Text style={styles.subtitle}>Currently {timer} seconds</Text>
        </View>
        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Timer')}>
          <Text style={styles.linkText}>Edit</Text>
        </Pressable>
      </View>

      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Tutorial')}>
        <Text style={styles.linkText}>View tutorial</Text>
      </Pressable>
      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Rules')}>
        <Text style={styles.linkText}>Rules</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  row: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  linkButton: {
    paddingVertical: 10,
  },
  linkText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});

export default SettingsScreen;

