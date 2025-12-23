import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

const PRESETS = [45, 60, 90, 120];

const TimerScreen: React.FC<Props> = ({ navigation }) => {
  const { game, setTimerSeconds } = useGame();
  const [selected, setSelected] = useState(game.timeRemaining || 60);

  const save = () => {
    setTimerSeconds(selected);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Round Timer</Text>
      <Text style={styles.subtitle}>Matches the TimerTableViewController flow from iOS.</Text>
      <View style={styles.pillRow}>
        {PRESETS.map((value) => {
          const active = selected === value;
          return (
            <Pressable
              key={value}
              style={[styles.pill, active ? styles.pillActive : undefined]}
              onPress={() => setSelected(value)}
            >
              <Text style={[styles.pillText, active ? styles.pillTextActive : undefined]}>{value}s</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.primary} onPress={save}>
        <Text style={styles.primaryText}>Save</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: '#38bdf8',
  },
  pillText: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#0f172a',
  },
  primary: {
    marginTop: 24,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: 16,
  },
});

export default TimerScreen;

