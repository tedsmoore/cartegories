import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { getStarRating } from '../utils/scoreComments';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

const STAR_IMAGES = [
  require('../../assets/images/stars-0@2x.png'),
  require('../../assets/images/stars-1@2x.png'),
  require('../../assets/images/stars-2@2x.png'),
  require('../../assets/images/stars-3@2x.png'),
];

const GameOverScreen: React.FC<Props> = ({ navigation }) => {
  const { game, saveGameResult } = useGame();
  const stars = getStarRating(game.score);
  const isPerfect = game.score >= 10;

  useEffect(() => {
    saveGameResult().catch((err) => console.error('Failed to save game:', err));
  }, []);

  return (
    <Pressable style={styles.container} onPress={() => navigation.replace('ReportCard')}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isPerfect ? 'Perfect!' : "Time's Up!"}</Text>
        <Image source={STAR_IMAGES[stars]} style={styles.starsImage} resizeMode="contain" />
        <Text style={styles.score}>{game.score}</Text>
        <Text style={styles.label}>{isPerfect ? 'victory' : 'score'}</Text>

        {game.nailedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeaderNailed}>Nailed ({game.nailedItems.length})</Text>
            {game.nailedItems.map((item, i) => (
              <Text key={i} style={styles.itemNailed}>{item}</Text>
            ))}
          </View>
        )}

        {game.missedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeaderMissed}>Missed ({game.missedItems.length})</Text>
            {game.missedItems.map((item, i) => (
              <Text key={i} style={styles.itemMissed}>{item}</Text>
            ))}
          </View>
        )}

        <Text style={styles.continueHint}>Tap anywhere to continue</Text>
      </ScrollView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 12,
    fontFamily: 'Witless',
  },
  starsImage: {
    width: 200,
    height: 92,
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
    marginBottom: 24,
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionHeaderNailed: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22c55e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeaderMissed: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemNailed: {
    fontSize: 16,
    color: '#22c55e',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  itemMissed: {
    fontSize: 16,
    color: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  continueHint: {
    fontSize: 14,
    color: '#475569',
    marginTop: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default GameOverScreen;
