import { buildGameRow } from '../utils/buildGameRow';

describe('buildGameRow', () => {
  it('serializes nailedItems to JSON string', () => {
    const row = buildGameRow(3, 5, ['deck1'], ['cat', 'dog'], ['fish']);
    expect(row.nailedItems).toBe('["cat","dog"]');
  });

  it('serializes missedItems to JSON string', () => {
    const row = buildGameRow(3, 5, ['deck1'], ['cat'], ['dog', 'fish']);
    expect(row.missedItems).toBe('["dog","fish"]');
  });

  it('serializes empty arrays correctly', () => {
    const row = buildGameRow(0, 5, ['deck1'], [], []);
    expect(row.nailedItems).toBe('[]');
    expect(row.missedItems).toBe('[]');
  });

  it('preserves score and drawnCardsCount as numbers', () => {
    const row = buildGameRow(7, 12, ['a', 'b'], ['x'], ['y']);
    expect(row.score).toBe(7);
    expect(row.drawnCardsCount).toBe(12);
  });

  it('serializes activeDecks to JSON string', () => {
    const row = buildGameRow(5, 3, ['deck1', 'deck2'], ['a'], ['b']);
    expect(row.activeDecks).toBe('["deck1","deck2"]');
  });
});
