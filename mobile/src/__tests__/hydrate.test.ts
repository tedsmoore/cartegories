import { hydrateDecks, getDefaultActiveDecks } from '../utils/hydrate';
import { DeckRecord, CardRecord } from '../db/schema';
import { Deck } from '../types';

const makeDeck = (overrides: Partial<DeckRecord> = {}): DeckRecord => ({
  id: 'general',
  name: 'General',
  priority: 1,
  image: null,
  isFree: true,
  productId: null,
  ...overrides,
});

const makeCard = (overrides: Partial<CardRecord> = {}): CardRecord => ({
  id: 1000,
  category: 'Beach Things',
  items: JSON.stringify(['Sand', 'Waves', 'Sunscreen']),
  fact: 'Fun fact',
  deckId: 'general',
  ...overrides,
});

describe('hydrateDecks', () => {
  it('creates one Card per category row (not flattened)', () => {
    const decks = hydrateDecks([makeDeck()], [makeCard()]);

    expect(decks).toHaveLength(1);
    expect(decks[0].cards).toHaveLength(1);
    expect(decks[0].cards[0].category).toBe('Beach Things');
    expect(decks[0].cards[0].items).toEqual(['Sand', 'Waves', 'Sunscreen']);
    expect(decks[0].cards[0].fact).toBe('Fun fact');
  });

  it('preserves card ID from the DB key', () => {
    const card = makeCard({ id: 14000 });
    const decks = hydrateDecks([makeDeck()], [card]);

    expect(decks[0].cards[0].id).toBe(14000);
  });

  it('assigns correct deckId to cards', () => {
    const decks = hydrateDecks(
      [makeDeck({ id: 'food-drink', name: 'Food & Drink' })],
      [makeCard({ deckId: 'food-drink' })],
    );

    expect(decks[0].cards[0].deckId).toBe('food-drink');
  });

  it('groups cards by deckId across multiple decks', () => {
    const deckRows = [
      makeDeck({ id: 'general', name: 'General' }),
      makeDeck({ id: 'music', name: 'Music', isFree: true }),
    ];
    const cardRows = [
      makeCard({ id: 100, deckId: 'general' }),
      makeCard({ id: 200, deckId: 'music' }),
      makeCard({ id: 201, deckId: 'music' }),
    ];

    const decks = hydrateDecks(deckRows, cardRows);

    expect(decks[0].cards).toHaveLength(1);
    expect(decks[1].cards).toHaveLength(2);
  });

  it('returns empty cards for a deck with no card rows', () => {
    const decks = hydrateDecks([makeDeck()], []);
    expect(decks[0].cards).toHaveLength(0);
  });

  it('preserves deck metadata', () => {
    const deck = makeDeck({
      id: 'star-wars',
      name: 'Star Wars',
      priority: 96,
      image: 'Blobs_StarWars',
      isFree: false,
      productId: 'com.example.starwars',
    });
    const result = hydrateDecks([deck], []);

    expect(result[0]).toMatchObject({
      id: 'star-wars',
      name: 'Star Wars',
      priority: 96,
      image: 'Blobs_StarWars',
      isFree: false,
    });
  });

  it('converts null image to undefined', () => {
    const decks = hydrateDecks([makeDeck({ image: null })], []);
    expect(decks[0].image).toBeUndefined();
  });

  it('coerces numeric items to strings', () => {
    const card = makeCard({ items: JSON.stringify([1984, 'Normal', 42]) });
    const decks = hydrateDecks([makeDeck()], [card]);

    expect(decks[0].cards[0].items).toEqual(['1984', 'Normal', '42']);
  });

  it('produces unique card IDs across decks', () => {
    const deckRows = [
      makeDeck({ id: 'a' }),
      makeDeck({ id: 'b' }),
    ];
    const cardRows = [
      makeCard({ id: 100, deckId: 'a' }),
      makeCard({ id: 200, deckId: 'b' }),
    ];

    const decks = hydrateDecks(deckRows, cardRows);
    const allIds = decks.flatMap((d) => d.cards.map((c) => c.id));
    const unique = new Set(allIds);
    expect(unique.size).toBe(allIds.length);
  });
});

describe('getDefaultActiveDecks', () => {
  const freeDecks: Deck[] = [
    { id: 'general', name: 'General', cards: [], isFree: true },
    { id: 'food-drink', name: 'Food & Drink', cards: [], isFree: true },
    { id: 'music', name: 'Music', cards: [], isFree: true },
  ];

  const paidDecks: Deck[] = [
    { id: 'star-wars', name: 'Star Wars', cards: [], isFree: false },
    { id: 'harry-potter', name: 'Harry Potter', cards: [], isFree: false },
  ];

  const allDecks = [...freeDecks, ...paidDecks];

  it('returns free deck IDs when no stored prefs', () => {
    const result = getDefaultActiveDecks(allDecks, null);
    expect(result).toEqual(['general', 'food-drink', 'music']);
  });

  it('restores valid stored preferences', () => {
    const result = getDefaultActiveDecks(allDecks, ['star-wars', 'general']);
    expect(result).toEqual(['star-wars', 'general']);
  });

  it('filters out deck IDs that no longer exist', () => {
    const result = getDefaultActiveDecks(allDecks, ['general', 'deleted-deck']);
    expect(result).toEqual(['general']);
  });

  it('falls back to free decks if all stored IDs are invalid', () => {
    const result = getDefaultActiveDecks(allDecks, ['deleted-1', 'deleted-2']);
    expect(result).toEqual(['general', 'food-drink', 'music']);
  });

  it('falls back to free decks for empty stored array', () => {
    const result = getDefaultActiveDecks(allDecks, []);
    expect(result).toEqual(['general', 'food-drink', 'music']);
  });
});
