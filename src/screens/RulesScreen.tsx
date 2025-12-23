import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Rules'>;

const RulesScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Rules</Text>
      <Text style={styles.copy}>
        Split into teams. One player describes the card without saying the word. Team guesses as many as possible before
        the timer ends. Skip or pass is allowed if you like; we will mirror the iOS animations for pass/nailed cards in
        later passes.
      </Text>
      <Text style={styles.copy}>
        Scoring, timer, and deck persistence follow the original Car-Tegories app. Firebase hooks will record stats once
        wired.
      </Text>
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
    fontSize: 22,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  copy: {
    color: '#cbd5e1',
    marginBottom: 12,
    lineHeight: 20,
  },
});

export default RulesScreen;

