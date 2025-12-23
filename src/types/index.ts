export type Card = {
  id: number;
  prompt: string;
  deckId: string;
};

export type Deck = {
  id: string;
  name: string;
  cards: Card[];
  priority?: number;
  image?: string;
  forSale?: boolean;
};

export type GameState = {
  score: number;
  cardIndex: number;
  timeRemaining: number;
  activeDecks: string[];
  playableCards: number[];
  drawnCards: number[];
  nailedItems: string[];
  missedItems: string[];
};

