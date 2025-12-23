import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

const DecksScreen: React.FC<Props> = () => {
  const { decks, game, setActiveDecks, loading } = useGame();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose active decks</Text>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const active = game.activeDecks.includes(item.id);
          return (
            <Pressable
              style={[styles.deckRow, active ? styles.deckRowActive : undefined]}
              onPress={() => {
                const next = active
                  ? game.activeDecks.filter((d) => d !== item.id)
                  : [...game.activeDecks, item.id];
                setActiveDecks(next);
              }}
            >
              <View>
                <Text style={styles.deckName}>{item.name}</Text>
                <Text style={styles.deckMeta}>{item.cards.length} cards</Text>
              </View>
              <Text style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}>
                {active ? 'Active' : 'Tap to activate'}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  deckRow: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckRowActive: {
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  deckName: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  deckMeta: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
  },
  pillActive: {
    backgroundColor: '#0f172a',
    color: '#38bdf8',
  },
  pillInactive: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
  },
});

export default DecksScreen;

