import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;

const ACCENT = '#1EAFE2';

const PRESETS: { seconds: number; label: string }[] = [
  { seconds: 60, label: '60 Seconds' },
  { seconds: 75, label: '75 Seconds' },
  { seconds: 99, label: '99 Seconds' },
];

const TimerScreen: React.FC<Props> = ({ navigation }) => {
  const { game, setTimerSeconds } = useGame();
  const selected = game.timerPreset;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Timer" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {PRESETS.map(({ seconds, label }) => {
            const active = selected === seconds;
            return (
              <Pressable
                key={seconds}
                style={styles.row}
                onPress={() => setTimerSeconds(seconds)}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{label}</Text>
                </View>
                {active ? <Text style={styles.checkmark}>{'✓'}</Text> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCENT,
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    width: '70%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    color: '#0f172a',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: '600',
  },
});

export default TimerScreen;
