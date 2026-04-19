import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      testID="decks-scroll-view"
    >
      <Text style={styles.sectionHeader} testID="your-decks-header">Your Decks</Text>
      <FlatList
        data={owned}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <DeckCell
            deck={item}
            active={game.activeDecks.includes(item.id)}
            onPress={() => toggleActive(item)}
          />
        )}
      />

      <Text style={styles.sectionHeader} testID="get-more-decks-header">Get More Decks</Text>
      <FlatList
        data={locked}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <DeckCell deck={item} locked onPress={() => showLockedAlert(item)} />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: ACCENT,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
});

export default DecksScreen;
