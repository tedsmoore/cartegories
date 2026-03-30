import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { getScoreComment, getStarRating } from '../utils/scoreComments';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportCard'>;

const STAR_DISPLAY = ['', '\u2605', '\u2605\u2605', '\u2605\u2605\u2605'];

const ReportCardScreen: React.FC<Props> = ({ navigation }) => {
  const { game } = useGame();
  const [showFact, setShowFact] = useState(false);
  const stars = getStarRating(game.score);
  const comment = React.useMemo(() => getScoreComment(game.score), [game.score]);
  const fact = game.currentCard?.fact;

  const onPlayAgain = () => {
    navigation.navigate('CardSelection');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.stars}>{STAR_DISPLAY[stars]}</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreNumber}>{game.score}</Text>
          <Text style={styles.scoreLabel}>/ {game.currentCard?.items.length ?? 10}</Text>
        </View>

        <Text style={styles.comment}>{comment}</Text>

        {game.nailedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nailed It</Text>
            {game.nailedItems.map((item, i) => (
              <Text key={i} style={styles.nailedItem}>{item}</Text>
            ))}
          </View>
        )}

        {game.missedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Missed</Text>
            {game.missedItems.map((item, i) => (
              <Text key={i} style={styles.missedItem}>{item}</Text>
            ))}
          </View>
        )}

        {fact && (
          <Pressable style={styles.factArea} onPress={() => setShowFact(!showFact)}>
            <Text style={styles.factToggle}>{showFact ? 'Hide Fun Fact' : 'Show Fun Fact'}</Text>
            {showFact && <Text style={styles.factText}>{fact}</Text>}
          </Pressable>
        )}
      </ScrollView>

      <View style={styles.buttonArea}>
        <Button
          title="Play Again"
          baseColor="#e94b24"
          onPress={onPlayAgain}
          width={200}
          breathing
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  stars: {
    fontSize: 40,
    color: '#fbbf24',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: 'Witless',
  },
  scoreLabel: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 4,
  },
  comment: {
    fontSize: 22,
    color: '#e2e8f0',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
    fontFamily: 'NanumBrush',
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nailedItem: {
    fontSize: 16,
    color: '#22c55e',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  missedItem: {
    fontSize: 16,
    color: '#ef4444',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  factArea: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  factToggle: {
    color: '#38bdf8',
    fontWeight: '700',
    textAlign: 'center',
  },
  factText: {
    color: '#cbd5e1',
    marginTop: 12,
    lineHeight: 22,
  },
  buttonArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});

export default ReportCardScreen;
