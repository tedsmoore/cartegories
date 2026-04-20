import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { partitionDecks } from '../utils/partitionDecks';
import DeckCell from '../components/DeckCell';
import { Deck } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

const ACCENT = '#1EAFE2';
const NUM_COLS = 5;

const DecksScreen: React.FC<Props> = () => {
  const { decks, game, setActiveDecks, loading } = useGame();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  const { owned, locked } = partitionDecks(decks);

  // General is the canonical "first" deck — pin it before everything else.
  const ownedSorted = [...owned].sort((a, b) => {
    if (a.name === 'General') return -1;
    if (b.name === 'General') return 1;
    return 0;
  });

  const toggleActive = (deck: Deck) => {
    const isActive = game.activeDecks.includes(deck.id);
    const next = isActive
      ? game.activeDecks.filter((d) => d !== deck.id)
      : [...game.activeDecks, deck.id];
    setActiveDecks(next);
  };

  const showLockedAlert = (deck: Deck) => {
    Alert.alert('Coming soon', `"${deck.name}" launches with the next update.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} testID="decks-scroll-view">
      <Text style={styles.sectionHeader} testID="your-decks-header">Your Decks</Text>
      <View style={styles.grid}>
        {ownedSorted.map((deck) => (
          <View key={deck.id} style={styles.cellWrap}>
            <DeckCell
              deck={deck}
              active={game.activeDecks.includes(deck.id)}
              onPress={() => toggleActive(deck)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionHeader} testID="get-more-decks-header">Get More Decks</Text>
      <View style={styles.grid}>
        {locked.map((deck) => (
          <View key={deck.id} style={styles.cellWrap}>
            <DeckCell deck={deck} locked onPress={() => showLockedAlert(deck)} />
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 12,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: `${100 / NUM_COLS}%`,
    padding: 6,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: ACCENT,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
});

export default DecksScreen;
