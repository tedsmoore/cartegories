export const buildGameRow = (
  score: number,
  drawnCardsCount: number,
  activeDecks: string[],
  nailedItems: string[],
  missedItems: string[],
) => ({
  score,
  drawnCardsCount,
  activeDecks: JSON.stringify(activeDecks),
  nailedItems: JSON.stringify(nailedItems),
  missedItems: JSON.stringify(missedItems),
});
