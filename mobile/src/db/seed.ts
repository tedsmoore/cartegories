import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { count } from 'drizzle-orm';
import * as schema from './schema';
import deckData from '../../data/decks.json';

type DeckJson = {
  name: string;
  isFree: boolean;
  productId: string;
  image: string;
  priority: number;
  cards: { key: number; category: string; items: string[]; fact: string }[];
};

import { slugify } from '../utils/slugify';

export async function seedDecks(db: ExpoSQLiteDatabase<typeof schema>) {
  const [{ total }] = await db.select({ total: count() }).from(schema.decks);
  if (total > 0) return;

  const decks = deckData.decks as DeckJson[];

  await db.transaction(async (tx) => {
    for (const deck of decks) {
      const deckId = slugify(deck.name);

      await tx.insert(schema.decks).values({
        id: deckId,
        name: deck.name,
        priority: deck.priority,
        image: deck.image,
        isFree: deck.isFree,
        productId: deck.productId,
      });

      for (const card of deck.cards) {
        await tx.insert(schema.cards).values({
          id: card.key,
          category: card.category,
          items: JSON.stringify(card.items),
          fact: card.fact,
          deckId,
        });
      }
    }
  });

  console.log(`Seeded ${decks.length} decks`);
}
