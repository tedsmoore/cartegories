import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { Card } from '../types';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'CardSelection'>;

const CardSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { drawCard, game, startNewRound } = useGame();
  const [card, setCard] = useState<Card | null>(game.currentCard);

  const onDrawCard = () => {
    const next = drawCard();
    setCard(next);
  };

  const onPlay = () => {
    if (card) {
      navigation.navigate('Play');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {card ? (
          <>
            <Text style={styles.categoryLabel}>{card.category}</Text>
            <Text style={styles.deckLabel}>{card.deckId}</Text>
            <Text style={styles.itemCount}>{card.items.length} items</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>Tap "New Card" to draw a category</Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="New Card"
          baseColor="#38bdf8"
          onPress={onDrawCard}
          width={160}
          breathing={!card}
        />
        <Button
          title="Play!"
          baseColor={card ? '#e94b24' : '#64748b'}
          onPress={onPlay}
          width={160}
          breathing={!!card}
        />
      </View>

      <Pressable style={styles.settingsLink} onPress={() => navigation.navigate('Decks')}>
        <Text style={styles.settingsText}>Decks & Settings</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArea: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    marginBottom: 32,
  },
  categoryLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    textAlign: 'center',
    fontFamily: 'NanumBrush',
  },
  deckLabel: {
    color: '#64748b',
    marginTop: 8,
    fontSize: 14,
  },
  itemCount: {
    color: '#94a3b8',
    marginTop: 4,
    fontSize: 13,
  },
  placeholder: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  settingsLink: {
    paddingVertical: 12,
  },
  settingsText: {
    color: '#38bdf8',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CardSelectionScreen;
