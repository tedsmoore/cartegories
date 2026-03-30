import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveGame } from '../services/database';
import { db } from '../db/db';
import { decks as decksTable, cards as cardsTable } from '../db/schema';
import { hydrateDecks, getDefaultActiveDecks } from '../utils/hydrate';
import { Deck, Card, GameState } from '../types';

type GameContextValue = {
  decks: Deck[];
  loading: boolean;
  game: GameState;
  drawCard: () => Card | null;
  startNewRound: () => void;
  setActiveDecks: (deckIds: string[]) => void;
  setTimerSeconds: (seconds: number) => void;
  setCurrentCard: (card: Card | null) => void;
  updateSwitchStates: (states: boolean[]) => void;
  endRound: (nailed: string[], missed: string[], score: number) => void;
  saveGameResult: () => Promise<void>;
};

const defaultGameState: GameState = {
  score: 0,
  timeRemaining: 60,
  activeDecks: [],
  currentCard: null,
  drawnCards: [],
  nailedItems: [],
  missedItems: [],
  switchStates: Array(10).fill(false),
};

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<GameState>(defaultGameState);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const deckRows = await db.select().from(decksTable).orderBy(decksTable.priority);
      const cardRows = await db.select().from(cardsTable);
      const hydratedDecks = hydrateDecks(deckRows, cardRows);

      setDecks(hydratedDecks);

      const storedActive = await AsyncStorage.getItem('activeDecks');
      const parsed = storedActive ? JSON.parse(storedActive) : null;
      const activeDecks = getDefaultActiveDecks(hydratedDecks, parsed);
      setGame((current) => ({ ...current, activeDecks }));

      setLoading(false);
    };

    load();
  }, []);

  // All cards from active decks
  const playableCards = useMemo(() => {
    const activeDeckLookup = new Set(game.activeDecks);
    return decks
      .filter((d) => activeDeckLookup.has(d.id))
      .flatMap((deck) => deck.cards);
  }, [decks, game.activeDecks]);

  const drawCard = (): Card | null => {
    const drawnSet = new Set(game.drawnCards);
    const available = playableCards.filter((c) => !drawnSet.has(c.id));
    if (!available.length) return null;

    const next = available[Math.floor(Math.random() * available.length)];
    setGame((current) => ({
      ...current,
      currentCard: next,
      drawnCards: [...current.drawnCards, next.id],
      switchStates: Array(next.items.length).fill(false),
      score: 0,
    }));
    return next;
  };

  const startNewRound = () => {
    setGame((current) => ({
      ...current,
      score: 0,
      currentCard: null,
      timeRemaining: current.timeRemaining > 0 ? current.timeRemaining : 60,
      drawnCards: [],
      nailedItems: [],
      missedItems: [],
      switchStates: Array(10).fill(false),
    }));
  };

  const setActiveDecks = (deckIds: string[]) => {
    setGame((current) => ({ ...current, activeDecks: deckIds }));
    AsyncStorage.setItem('activeDecks', JSON.stringify(deckIds)).catch(() => {});
  };

  const setTimerSeconds = (seconds: number) => {
    setGame((current) => ({ ...current, timeRemaining: seconds }));
  };

  const setCurrentCard = (card: Card | null) => {
    setGame((current) => ({
      ...current,
      currentCard: card,
      switchStates: card ? Array(card.items.length).fill(false) : Array(10).fill(false),
      score: 0,
    }));
  };

  const updateSwitchStates = (states: boolean[]) => {
    setGame((current) => ({
      ...current,
      switchStates: states,
      score: states.filter(Boolean).length,
    }));
  };

  const endRound = (nailed: string[], missed: string[], score: number) => {
    setGame((current) => ({
      ...current,
      nailedItems: nailed,
      missedItems: missed,
      score,
    }));
  };

  const saveGameResult = async () => {
    await saveGame(game.score, game.drawnCards.length, game.activeDecks);
  };

  const value: GameContextValue = {
    decks,
    loading,
    game,
    drawCard,
    startNewRound,
    setActiveDecks,
    setTimerSeconds,
    setCurrentCard,
    updateSwitchStates,
    endRound,
    saveGameResult,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
