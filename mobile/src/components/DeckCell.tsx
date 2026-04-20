import React from 'react';
import { Pressable, Image, Text, StyleSheet } from 'react-native';
import { Deck } from '../types';
import { getBlobImage } from '../constants/deckImages';

type Props = {
  deck: Deck;
  active?: boolean;
  locked?: boolean;
  onPress: () => void;
};

const ACCENT = '#1EAFE2';

const DeckCell: React.FC<Props> = ({ deck, active, locked, onPress }) => {
  return (
    <Pressable
      style={[styles.cell, active && styles.cellActive]}
      onPress={onPress}
      accessibilityLabel={deck.name}
      accessibilityState={{ selected: !!active, disabled: !!locked }}
    >
      <Image source={getBlobImage(deck.name)} style={styles.image} resizeMode="contain" />
      <Text style={styles.label} numberOfLines={2}>
        {locked ? '\uD83D\uDD12 ' : ''}
        {deck.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: '100%',
    aspectRatio: 1,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  cellActive: {
    borderColor: ACCENT,
  },
  image: {
    flex: 1,
    width: '90%',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
});

export default DeckCell;
