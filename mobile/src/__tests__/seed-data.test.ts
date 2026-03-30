import deckData from '../../data/decks.json';
import { slugify } from '../utils/slugify';

describe('decks.json seed data', () => {
  const decks = deckData.decks;

  it('contains exactly 15 decks', () => {
    expect(decks).toHaveLength(15);
  });

  it('has 1733 total cards', () => {
    const total = decks.reduce((sum, d) => sum + d.cards.length, 0);
    expect(total).toBe(1733);
  });

  it('every deck has required fields', () => {
    for (const deck of decks) {
      expect(typeof deck.name).toBe('string');
      expect(deck.name.length).toBeGreaterThan(0);
      expect(typeof deck.isFree).toBe('boolean');
      // Free decks have null productId
      expect(deck.productId === null || typeof deck.productId === 'string').toBe(true);
      expect(typeof deck.image).toBe('string');
      expect(typeof deck.priority).toBe('number');
      expect(Array.isArray(deck.cards)).toBe(true);
      expect(deck.cards.length).toBeGreaterThan(0);
    }
  });

  it('every card has a unique key across the entire dataset', () => {
    const allKeys = decks.flatMap((d) => d.cards.map((c) => c.key));
    const unique = new Set(allKeys);
    expect(unique.size).toBe(allKeys.length);
  });

  it('every card has a category, 9-10 items, and a fact', () => {
    for (const deck of decks) {
      for (const card of deck.cards) {
        expect(typeof card.category).toBe('string');
        expect(card.category.length).toBeGreaterThan(0);
        expect(Array.isArray(card.items)).toBe(true);
        // Most cards have 10 items; a few have 9
        expect(card.items.length).toBeGreaterThanOrEqual(9);
        expect(card.items.length).toBeLessThanOrEqual(10);
        expect(typeof card.fact).toBe('string');
        for (const item of card.items) {
          // Most items are strings; a few are numbers (e.g. "1984", golf holes)
          expect(typeof item === 'string' || typeof item === 'number').toBe(true);
          expect(String(item).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('produces unique slugified IDs for all decks', () => {
    const ids = decks.map((d) => slugify(d.name));
    const unique = new Set(ids);
    expect(unique.size).toBe(decks.length);
  });

  it('free decks are the expected 7', () => {
    const freeNames = decks.filter((d) => d.isFree).map((d) => d.name).sort();
    expect(freeNames).toEqual([
      'Food & Drink',
      'General',
      'History & Geography',
      'Music',
      'Science & Nature',
      'Sports & Leisure',
      'TV & Movies',
    ]);
  });

  it('card keys do not collide when multiplied by 100 (hydration ID space)', () => {
    const allKeys = decks.flatMap((d) => d.cards.map((c) => c.key));
    // With 10 items per card, IDs span [key*100, key*100+9].
    // Ensure no two key ranges overlap.
    const sorted = [...allKeys].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = sorted[i - 1] * 100 + 9;
      const nextStart = sorted[i] * 100;
      expect(nextStart).toBeGreaterThan(prevEnd);
    }
  });
});
