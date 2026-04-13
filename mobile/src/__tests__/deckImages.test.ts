import { DECK_IMAGES, getBlobImage } from '../constants/deckImages';

describe('deckImages', () => {
  it('returns the correct blob for a known deck name', () => {
    const image = getBlobImage('Food & Drink');
    expect(image).toBeDefined();
    expect(image).toBe(DECK_IMAGES['Food & Drink']);
  });

  it('returns general blob for unknown deck name', () => {
    const image = getBlobImage('Nonexistent Deck');
    expect(image).toBe(DECK_IMAGES['General']);
  });

  it('returns general blob for undefined', () => {
    const image = getBlobImage(undefined);
    expect(image).toBe(DECK_IMAGES['General']);
  });

  it('returns general blob for empty string', () => {
    expect(getBlobImage('')).toBe(DECK_IMAGES['General']);
  });

  it('has entries for all known decks', () => {
    const expectedDecks = [
      'Food & Drink', 'General', 'Harry Potter',
      'History & Geography', 'Music', 'Sci-Fi & Fantasy',
      'Science & Nature', 'Sports & Leisure', 'TV & Movies',
      'Theater', 'Video Games', 'Wordplay',
    ];
    for (const deck of expectedDecks) {
      expect(DECK_IMAGES[deck]).toBeDefined();
    }
  });
});
