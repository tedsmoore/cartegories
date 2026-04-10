import { parseSoundPreference } from '../state/SoundContext';

describe('parseSoundPreference', () => {
  it('returns true when stored value is null (default)', () => {
    expect(parseSoundPreference(null)).toBe(true);
  });

  it('returns true when stored value is "true"', () => {
    expect(parseSoundPreference('true')).toBe(true);
  });

  it('returns false when stored value is "false"', () => {
    expect(parseSoundPreference('false')).toBe(false);
  });
});
