import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// We intentionally pull config from env so the Firebase project can be swapped easily.
// The values match the existing iOS plist; if unset we'll fall back to harmless placeholders.
const expoConfig = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: expoConfig.firebaseApiKey ?? process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'FAKE_API_KEY',
  authDomain:
    expoConfig.firebaseAuthDomain ?? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'example.firebaseapp.com',
  databaseURL:
    expoConfig.firebaseDatabaseUrl ?? process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ?? 'https://example.firebaseio.com',
  projectId: expoConfig.firebaseProjectId ?? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'example-id',
  storageBucket: expoConfig.firebaseStorageBucket ?? process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'example.appspot.com',
  messagingSenderId:
    expoConfig.firebaseMessagingSenderId ?? process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId: expoConfig.firebaseAppId ?? process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:000000000000:web:deadbeef',
};

export const ensureFirebaseApp = () => {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
};

export const firebaseDb = () => {
  ensureFirebaseApp();
  return getDatabase();
};

export const firebaseStorage = () => {
  ensureFirebaseApp();
  return getStorage();
};

// ---- Helpers the rest of the app can lean on while we replicate the iOS logic
export type RemoteCategory = {
  id: string;
  name: string;
  items: string[];
  image?: string;
  priority?: number;
  deckId?: string;
};

export type RemoteMetadata = {
  decksForSale: string[];
  lastUpdated?: string;
};

export type RemoteUserStats = {
  playableCards: number[];
  activeDecks: string[];
};

export const fetchCategories = async (): Promise<RemoteCategory[]> => {
  // TODO: Wire to Firebase Realtime Database (Categories node) to mirror iOS logic.
  // Returning mocked data for now so UI can be built without network.
  return [
    {
      id: 'general',
      name: 'General',
      items: ['The Beach', 'An Airplane', 'A Sandwich'],
    },
    {
      id: 'food-drink',
      name: 'Food & Drink',
      items: ['Tacos', 'Chocolate', 'Espresso'],
    },
  ];
};

export const fetchMetadata = async (): Promise<RemoteMetadata> => {
  // TODO: Fetch metadata blob similar to categoriesMetadata in the Swift app.
  return { decksForSale: ['history-geography', 'tv-movies'], lastUpdated: new Date().toISOString() };
};

export const fetchUserStats = async (userId: string): Promise<RemoteUserStats | null> => {
  // TODO: Hook to /User Stats/{userId} path.
  return null;
};

export const persistUserStats = async (_userId: string, _stats: RemoteUserStats) => {
  // TODO: Implement writeback when Firebase wiring is ready.
};

