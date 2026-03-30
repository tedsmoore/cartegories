import { Deck, Card } from '../types';
import { DeckRecord, CardRecord } from '../db/schema';

export function hydrateDecks(deckRows: DeckRecord[], cardRows: CardRecord[]): Deck[] {
  const cardsByDeck = new Map<string, CardRecord[]>();
  for (const card of cardRows) {
    const existing = cardsByDeck.get(card.deckId) ?? [];
    existing.push(card);
    cardsByDeck.set(card.deckId, existing);
  }

  return deckRows.map((deck) => {
    const deckCards = cardsByDeck.get(deck.id) ?? [];
    const flatCards: Card[] = deckCards.flatMap((card) => {
      const items: unknown[] = JSON.parse(card.items);
      return items.map((rawPrompt, idx) => ({
        id: card.id * 100 + idx,
        prompt: String(rawPrompt),
        deckId: deck.id,
      }));
    });

    return {
      id: deck.id,
      name: deck.name,
      priority: deck.priority,
      cards: flatCards,
      image: deck.image ?? undefined,
      isFree: deck.isFree,
    };
  });
}

export function getDefaultActiveDecks(decks: Deck[], storedIds: string[] | null): string[] {
  const freeDecks = decks.filter((d) => d.isFree).map((d) => d.id);
  if (!storedIds) return freeDecks;

  const validIds = new Set(decks.map((d) => d.id));
  const filtered = storedIds.filter((id) => validIds.has(id));
  return filtered.length > 0 ? filtered : freeDecks;
}
