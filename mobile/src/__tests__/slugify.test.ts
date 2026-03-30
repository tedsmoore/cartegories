import { slugify } from '../utils/slugify';

describe('slugify', () => {
  it('converts deck names to kebab-case IDs', () => {
    expect(slugify('Food & Drink')).toBe('food-drink');
    expect(slugify('General')).toBe('general');
    expect(slugify('TV & Movies')).toBe('tv-movies');
    expect(slugify('Science & Nature')).toBe('science-nature');
    expect(slugify('Cartoons & Animation')).toBe('cartoons-animation');
    expect(slugify('Lord of the Rings')).toBe('lord-of-the-rings');
    expect(slugify('Sci-Fi & Fantasy')).toBe('sci-fi-fantasy');
  });

  it('strips leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
    expect(slugify('  spaced  ')).toBe('spaced');
  });

  it('collapses multiple special characters into one hyphen', () => {
    expect(slugify('A & B & C')).toBe('a-b-c');
    expect(slugify('one...two///three')).toBe('one-two-three');
  });

  it('handles single words', () => {
    expect(slugify('Theater')).toBe('theater');
    expect(slugify('Wordplay')).toBe('wordplay');
    expect(slugify('Music')).toBe('music');
  });

  it('produces unique IDs for all 15 real deck names', () => {
    const deckNames = [
      'Cartoons & Animation', 'Food & Drink', 'General', 'Harry Potter',
      'History & Geography', 'Lord of the Rings', 'Music', 'Sci-Fi & Fantasy',
      'Science & Nature', 'Sports & Leisure', 'Star Wars', 'TV & Movies',
      'Theater', 'Video Games', 'Wordplay',
    ];
    const ids = deckNames.map(slugify);
    const unique = new Set(ids);
    expect(unique.size).toBe(15);
  });
});
