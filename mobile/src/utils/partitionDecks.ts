import { Deck } from '../types';

export function partitionDecks(decks: Deck[]): { owned: Deck[]; locked: Deck[] } {
  const owned: Deck[] = [];
  const locked: Deck[] = [];
  for (const d of decks) {
    if (d.isFree) {
      owned.push(d);
    } else {
      locked.push(d);
    }
  }
  return { owned, locked };
}
