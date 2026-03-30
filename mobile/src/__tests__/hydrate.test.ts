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
  it('flattens card items into individual Card objects', () => {
    const decks = hydrateDecks([makeDeck()], [makeCard()]);

    expect(decks).toHaveLength(1);
    expect(decks[0].cards).toHaveLength(3);
    expect(decks[0].cards[0].prompt).toBe('Sand');
    expect(decks[0].cards[1].prompt).toBe('Waves');
    expect(decks[0].cards[2].prompt).toBe('Sunscreen');
  });

  it('generates unique card IDs using key * 100 + index', () => {
    const card = makeCard({ id: 14000 });
    const decks = hydrateDecks([makeDeck()], [card]);

    expect(decks[0].cards[0].id).toBe(1400000);
    expect(decks[0].cards[1].id).toBe(1400001);
    expect(decks[0].cards[2].id).toBe(1400002);
  });

  it('assigns correct deckId to flattened cards', () => {
    const decks = hydrateDecks(
      [makeDeck({ id: 'food-drink', name: 'Food & Drink' })],
      [makeCard({ deckId: 'food-drink' })],
    );

    for (const card of decks[0].cards) {
      expect(card.deckId).toBe('food-drink');
    }
  });

  it('groups cards by deckId across multiple decks', () => {
    const deckRows = [
      makeDeck({ id: 'general', name: 'General' }),
      makeDeck({ id: 'music', name: 'Music', isFree: true }),
    ];
    const cardRows = [
      makeCard({ id: 100, deckId: 'general', items: JSON.stringify(['A', 'B']) }),
      makeCard({ id: 200, deckId: 'music', items: JSON.stringify(['X', 'Y', 'Z']) }),
      makeCard({ id: 201, deckId: 'music', items: JSON.stringify(['P', 'Q']) }),
    ];

    const decks = hydrateDecks(deckRows, cardRows);

    expect(decks[0].cards).toHaveLength(2);
    expect(decks[1].cards).toHaveLength(5);
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

  it('produces globally unique card IDs across decks', () => {
    const deckRows = [
      makeDeck({ id: 'a' }),
      makeDeck({ id: 'b' }),
    ];
    const cardRows = [
      makeCard({ id: 100, deckId: 'a', items: JSON.stringify(['x', 'y']) }),
      makeCard({ id: 200, deckId: 'b', items: JSON.stringify(['x', 'y']) }),
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
