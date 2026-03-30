const COMMENTS: Record<number, string[]> = {
  0: ['That\'s terrible.', 'A goose egg.', 'Zilch.'],
  1: ['One is the loneliest number', 'And a partridge in a pear tree'],
  2: ['Two bad.', 'I\'m not impressed'],
  3: ['There were three stooges, too.', 'Three blind mice.'],
  4: ['Maybe next time'],
  5: ['High five!', 'Mambo number five!', 'The glass is half full'],
  6: ['Six sick sheep', 'Rock on.', 'You\'re in the winners circle'],
  7: ['Nice!', 'A solid performance'],
  8: ['Like a good pizza', 'Great work!'],
  9: ['So. Close.', 'Amazing!', 'Not bad at all', 'Very good!', 'That\'ll do, pig.'],
  10: [
    'You\'re awesome!', 'GOOOOOOOAAAALLLLL!', 'Stupendous!', 'Bing. Bang. BOOM!',
    'You got \'em all!', 'Borderline eleven!', 'Nice job!', 'It\'s outta here!',
    'Out of this world!', 'Simply perfection!', 'Gold star!', 'Hot dog!',
  ],
};

export function getScoreComment(score: number): string {
  const clamped = Math.max(0, Math.min(10, Math.round(score)));
  const options = COMMENTS[clamped] ?? COMMENTS[0];
  return options[Math.floor(Math.random() * options.length)];
}

export function getStarRating(score: number): number {
  if (score >= 10) return 3;
  if (score >= 8) return 2;
  if (score >= 6) return 1;
  return 0;
}
