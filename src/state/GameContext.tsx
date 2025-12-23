import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCategories, fetchMetadata } from '../services/firebase';
import { Deck, Card, GameState } from '../types';

type GameContextValue = {
  decks: Deck[];
  loading: boolean;
  game: GameState;
  startNewRound: () => void;
  drawCard: () => Card | null;
  setActiveDecks: (deckIds: string[]) => void;
  setTimerSeconds: (seconds: number) => void;
};

const defaultGameState: GameState = {
  score: 0,
  cardIndex: 0,
  timeRemaining: 60,
  activeDecks: ['general', 'food-drink', 'science-nature', 'sports-leisure', 'history-geography', 'tv-movies', 'music'],
  playableCards: [],
  drawnCards: [],
  nailedItems: [],
  missedItems: [],
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameState>(defaultGameState);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [remoteCategories, remoteMetadata] = await Promise.all([fetchCategories(), fetchMetadata()]);

      const hydratedDecks: Deck[] = remoteCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        priority: cat.priority ?? index,
        cards: cat.items.map((prompt, idx) => ({
          id: index * 1000 + idx,
          prompt,
          deckId: cat.id,
        })),
        forSale: remoteMetadata.decksForSale.includes(cat.id),
        image: cat.image,
      }));

      setDecks(hydratedDecks);

      const storedActive = await AsyncStorage.getItem('activeDecks');
      if (storedActive) {
        setGame((current) => ({ ...current, activeDecks: JSON.parse(storedActive) }));
      }

      setLoading(false);
    };

    load();
  }, []);

  const playableCards = useMemo(() => {
    const activeDeckLookup = new Set(game.activeDecks);
    const cards = decks
      .filter((d) => activeDeckLookup.has(d.id))
      .flatMap((deck) => deck.cards)
      .map((c) => c.id);
    return cards;
  }, [decks, game.activeDecks]);

  useEffect(() => {
    setGame((current) => ({ ...current, playableCards }));
  }, [playableCards]);

  const startNewRound = () => {
    setGame((current) => ({
      ...current,
      score: 0,
      cardIndex: 0,
      timeRemaining: current.timeRemaining > 0 ? current.timeRemaining : 60,
      drawnCards: [],
      nailedItems: [],
      missedItems: [],
    }));
  };

  const drawCard = (): Card | null => {
    const available = playableCards.filter((cardId) => !game.drawnCards.includes(cardId));
    if (!available.length) {
      return null;
    }
    const nextId = available[Math.floor(Math.random() * available.length)];
    const nextCard = decks.flatMap((d) => d.cards).find((c) => c.id === nextId) ?? null;

    setGame((current) => ({
      ...current,
      drawnCards: [...current.drawnCards, nextId],
      cardIndex: current.cardIndex + 1,
    }));

    return nextCard;
  };

  const setActiveDecks = (deckIds: string[]) => {
    setGame((current) => ({ ...current, activeDecks: deckIds }));
    AsyncStorage.setItem('activeDecks', JSON.stringify(deckIds)).catch(() => {});
  };

  const setTimerSeconds = (seconds: number) => {
    setGame((current) => ({ ...current, timeRemaining: seconds }));
  };

  const value: GameContextValue = {
    decks,
    loading,
    game,
    startNewRound,
    drawCard,
    setActiveDecks,
    setTimerSeconds,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
