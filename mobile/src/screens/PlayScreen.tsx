import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { useCountdown } from '../hooks/useCountdown';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const PlayScreen: React.FC<Props> = ({ navigation }) => {
  const { game, updateSwitchStates, endRound } = useGame();
  const [paused, setPaused] = useState(false);
  const gameEndedRef = useRef(false);

  const card = game.currentCard;
  const items = card?.items ?? [];
  const switches = game.switchStates;
  const score = switches.filter(Boolean).length;

  const finishGame = useCallback(() => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;

    const nailed = items.filter((_, i) => switches[i]);
    const missed = items.filter((_, i) => !switches[i]);
    endRound(nailed, missed, score);
    navigation.replace('GameOver');
  }, [items, switches, score, endRound, navigation]);

  const { timeLeft, stop } = useCountdown({
    initialSeconds: game.timeRemaining,
    paused,
    onExpire: finishGame,
  });

  // Perfect score — all items toggled ON
  useEffect(() => {
    if (score === items.length && items.length > 0 && !gameEndedRef.current) {
      stop();
      finishGame();
    }
  }, [score]);

  const toggleSwitch = (index: number) => {
    if (paused || gameEndedRef.current) return;
    const next = [...switches];
    next[index] = !next[index];
    updateSwitchStates(next);
  };

  if (!card) {
    navigation.goBack();
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.categoryName} numberOfLines={1}>{card.category}</Text>
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timer}>:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</Text>
        <Text style={styles.scoreLabel}>{score}/{items.length}</Text>
      </View>

      <ScrollView style={styles.itemList} contentContainerStyle={styles.itemListContent}>
        {items.map((item, index) => (
          <Pressable
            key={index}
            style={styles.itemRow}
            onPress={() => toggleSwitch(index)}
            disabled={paused}
          >
            <Text style={[
              styles.itemText,
              switches[index] && styles.itemTextNailed,
            ]}>
              {item}
            </Text>
            <Switch
              value={switches[index]}
              onValueChange={() => toggleSwitch(index)}
              disabled={paused}
              trackColor={{ false: '#334155', true: '#22c55e' }}
              thumbColor={switches[index] ? '#fff' : '#94a3b8'}
            />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => setPaused(!paused)}>
          <Text style={styles.controlText}>{paused ? 'Resume' : 'Pause'}</Text>
        </Pressable>
        {paused && (
          <Pressable style={[styles.controlButton, styles.exitButton]} onPress={() => navigation.popToTop()}>
            <Text style={styles.controlText}>Exit</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1eafe2',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'NanumBrush',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timer: {
    fontSize: 36,
    fontWeight: '800',
    color: '#e2e8f0',
    fontFamily: 'Witless',
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#38bdf8',
  },
  itemList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemListContent: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  itemText: {
    fontSize: 17,
    color: '#e2e8f0',
    flex: 1,
    marginRight: 12,
  },
  itemTextNailed: {
    color: '#22c55e',
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
  },
  controlButton: {
    backgroundColor: '#334155',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  exitButton: {
    backgroundColor: '#ef4444',
  },
  controlText: {
    color: '#e2e8f0',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default PlayScreen;
