import { partitionDecks } from '../utils/partitionDecks';
import { Deck } from '../types';

const deck = (id: string, isFree: boolean): Deck => ({
  id,
  name: id,
  cards: [],
  isFree,
});

describe('partitionDecks', () => {
  it('separates free decks into owned and paid into locked', () => {
    const decks = [deck('a', true), deck('b', false), deck('c', true)];
    const { owned, locked } = partitionDecks(decks);
    expect(owned.map((d) => d.id)).toEqual(['a', 'c']);
    expect(locked.map((d) => d.id)).toEqual(['b']);
  });

  it('treats undefined isFree as locked (paid)', () => {
    const decks = [{ id: 'x', name: 'x', cards: [] } as Deck];
    const { owned, locked } = partitionDecks(decks);
    expect(owned).toEqual([]);
    expect(locked.map((d) => d.id)).toEqual(['x']);
  });

  it('handles empty input', () => {
    expect(partitionDecks([])).toEqual({ owned: [], locked: [] });
  });

  it('preserves source order within each section', () => {
    const decks = [deck('a', true), deck('b', false), deck('c', true), deck('d', false)];
    const { owned, locked } = partitionDecks(decks);
    expect(owned.map((d) => d.id)).toEqual(['a', 'c']);
    expect(locked.map((d) => d.id)).toEqual(['b', 'd']);
  });
});
