import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { getStarRating } from '../utils/scoreComments';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

const STAR_DISPLAY = ['', '\u2605', '\u2605\u2605', '\u2605\u2605\u2605'];

const GameOverScreen: React.FC<Props> = ({ navigation }) => {
  const { game, saveGameResult } = useGame();
  const stars = getStarRating(game.score);
  const isPerfect = game.score >= 10;

  useEffect(() => {
    saveGameResult().catch((err) => console.error('Failed to save game:', err));

    const timeout = setTimeout(() => {
      navigation.replace('ReportCard');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isPerfect ? 'Perfect!' : "Time's Up!"}</Text>
      <Text style={styles.stars}>{STAR_DISPLAY[stars]}</Text>
      <Text style={styles.score}>{game.score}</Text>
      <Text style={styles.label}>{isPerfect ? 'victory' : 'score'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 16,
    fontFamily: 'Witless',
  },
  stars: {
    fontSize: 48,
    color: '#fbbf24',
    marginBottom: 12,
  },
  score: {
    fontSize: 72,
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: 'Witless',
  },
  label: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default GameOverScreen;
