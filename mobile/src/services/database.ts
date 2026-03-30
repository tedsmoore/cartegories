import { db } from '../db/db';
import { games, GameRecord } from '../db/schema';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations';
import { seedDecks } from '../db/seed';

export { games, GameRecord };

export const initDatabase = async () => {
  try {
    await migrate(db, migrations);
    console.log('Migrations applied successfully');
    await seedDecks(db);
  } catch (error) {
    console.error('Database init error:', error);
  }
};

export const saveGame = async (score: number, drawnCardsCount: number, activeDecks: string[]) => {
  await db.insert(games).values({
    score,
    drawnCardsCount,
    activeDecks: JSON.stringify(activeDecks),
  });
};

export const getGames = async (): Promise<GameRecord[]> => {
  return await db.select().from(games).orderBy(sql`${games.timestamp} DESC`);
};

export const deleteGame = async (id: number) => {
  await db.delete(games).where(sql`${games.id} = ${id}`);
};

export const clearAllGames = async () => {
  await db.delete(games);
};
