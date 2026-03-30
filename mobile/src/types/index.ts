export type Card = {
  id: number;
  category: string;
  items: string[];
  fact: string | null;
  deckId: string;
};

export type Deck = {
  id: string;
  name: string;
  cards: Card[];
  priority?: number;
  image?: string;
  isFree?: boolean;
};

export type GameState = {
  score: number;
  timeRemaining: number;
  activeDecks: string[];
  currentCard: Card | null;
  drawnCards: number[];
  nailedItems: string[];
  missedItems: string[];
  switchStates: boolean[];
};
