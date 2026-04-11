import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image, ImageSourcePropType } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';

const DECK_IMAGES: Record<string, ImageSourcePropType> = {
  'Food & Drink': require('../../assets/images/blobs-food-and-drink.png'),
  'General': require('../../assets/images/blobs-general.png'),
  'Harry Potter': require('../../assets/images/blobs-harry-potter.png'),
  'History & Geography': require('../../assets/images/blobs-history-and-geography.png'),
  'Music': require('../../assets/images/blobs-music.png'),
  'Sci-Fi & Fantasy': require('../../assets/images/blobs-sci-fi-and-fantasy.png'),
  'Science & Nature': require('../../assets/images/blobs-science-and-nature.png'),
  'Sports & Leisure': require('../../assets/images/blobs-sports-and-leisure.png'),
  'TV & Movies': require('../../assets/images/blobs-tv-and-movies.png'),
  'Theater': require('../../assets/images/blobs-theater.png'),
  'Video Games': require('../../assets/images/blobs-video-games.png'),
  'Wordplay': require('../../assets/images/blobs-wordplay.png'),
};

type Props = NativeStackScreenProps<RootStackParamList, 'Decks'>;

const DecksScreen: React.FC<Props> = ({ navigation }) => {
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
      <Text style={styles.header}>Your Decks</Text>
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
              {DECK_IMAGES[item.name] && (
                <Image source={DECK_IMAGES[item.name]} style={styles.deckImage} resizeMode="contain" />
              )}
              <View style={styles.deckInfo}>
                <Text style={styles.deckName}>
                  {!item.isFree && '\uD83D\uDD12 '}{item.name}
                </Text>
                <Text style={styles.deckMeta}>{item.cards.length} cards</Text>
              </View>
              <Text style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}>
                {active ? 'Active' : 'Tap to activate'}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.optionsSection}>
            <Text style={styles.header}>Options</Text>
            <Pressable style={styles.optionRow} onPress={() => navigation.navigate('Timer')}>
              <Text style={styles.optionText}>Timer</Text>
              <Text style={styles.optionValue}>{game.timeRemaining}s</Text>
            </Pressable>
          </View>
        }
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
    borderColor: '#1eafe2',
  },
  deckImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
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
    color: '#1eafe2',
  },
  pillInactive: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
  },
  optionsSection: {
    marginTop: 20,
  },
  optionRow: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  optionValue: {
    color: '#1eafe2',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default DecksScreen;
