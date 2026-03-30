import { getScoreComment, getStarRating } from '../utils/scoreComments';

describe('getStarRating', () => {
  it('returns 3 stars for score 10', () => {
    expect(getStarRating(10)).toBe(3);
  });

  it('returns 2 stars for scores 8-9', () => {
    expect(getStarRating(8)).toBe(2);
    expect(getStarRating(9)).toBe(2);
  });

  it('returns 1 star for scores 6-7', () => {
    expect(getStarRating(6)).toBe(1);
    expect(getStarRating(7)).toBe(1);
  });

  it('returns 0 stars for scores 0-5', () => {
    expect(getStarRating(0)).toBe(0);
    expect(getStarRating(3)).toBe(0);
    expect(getStarRating(5)).toBe(0);
  });
});

describe('getScoreComment', () => {
  it('returns a string for every score 0-10', () => {
    for (let i = 0; i <= 10; i++) {
      const comment = getScoreComment(i);
      expect(typeof comment).toBe('string');
      expect(comment.length).toBeGreaterThan(0);
    }
  });

  it('clamps out-of-range scores', () => {
    expect(typeof getScoreComment(-1)).toBe('string');
    expect(typeof getScoreComment(11)).toBe('string');
  });
});
