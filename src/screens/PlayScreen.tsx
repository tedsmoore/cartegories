import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { Card } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Play'>;

const PlayScreen: React.FC<Props> = ({ navigation }) => {
  const { drawCard, game } = useGame();
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  useEffect(() => {
    const next = drawCard();
    setCurrentCard(next);
  }, []);

  const onResult = (nailed: boolean) => {
    if (nailed) {
      // TODO: mirror iOS scoring (include timer hit/miss, nailedItems store).
    }
    const next = drawCard();
    if (!next) {
      navigation.navigate('GameOver');
      return;
    }
    setCurrentCard(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>Time: {game.timeRemaining}s</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Card #{game.cardIndex}</Text>
        <Text style={styles.prompt}>{currentCard?.prompt ?? 'No more cards'}</Text>
      </View>
      <View style={styles.row}>
        <Pressable style={[styles.actionButton, styles.actionMiss]} onPress={() => onResult(false)}>
          <Text style={styles.actionText}>Missed</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.actionHit]} onPress={() => onResult(true)}>
          <Text style={styles.actionText}>Nailed it</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  timer: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    marginVertical: 32,
  },
  cardLabel: {
    color: '#cbd5e1',
    marginBottom: 8,
  },
  prompt: {
    fontSize: 24,
    color: '#e2e8f0',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionHit: {
    backgroundColor: '#10b981',
  },
  actionMiss: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default PlayScreen;

