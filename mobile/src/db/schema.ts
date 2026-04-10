import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const decks = sqliteTable('decks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  priority: integer('priority').notNull().default(0),
  image: text('image'),
  isFree: integer('is_free', { mode: 'boolean' }).notNull().default(false),
  productId: text('product_id'),
});

export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey(),
  category: text('category').notNull(),
  items: text('items').notNull(), // JSON array of prompts
  fact: text('fact'),
  deckId: text('deck_id').notNull().references(() => decks.id),
});

export const games = sqliteTable('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  score: integer('score').notNull(),
  drawnCardsCount: integer('drawn_cards_count').notNull(),
  activeDecks: text('active_decks').notNull(),
  nailedItems: text('nailed_items').notNull().default('[]'),
  missedItems: text('missed_items').notNull().default('[]'),
  timestamp: text('timestamp').default(sql`(CURRENT_TIMESTAMP)`),
});

export type DeckRecord = typeof decks.$inferSelect;
export type CardRecord = typeof cards.$inferSelect;
export type GameRecord = typeof games.$inferSelect;
