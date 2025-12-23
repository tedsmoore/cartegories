import { NativeModulesProxy } from 'expo-modules-core';

export type DeckProduct = {
  id: string;
  title: string;
  price?: string;
};

const deckProductIds = [
  'deck_general',
  'deck_food_drink',
  'deck_science_nature',
  'deck_sports_leisure',
  'deck_history_geography',
  'deck_tv_movies',
  'deck_music',
  'deck_all',
];

export const getDeckProductIds = () => deckProductIds;

type ExpoIAP = typeof import('expo-in-app-purchases');

let cachedModule: ExpoIAP | null | undefined;

const loadModule = async (): Promise<ExpoIAP | null> => {
  if (cachedModule !== undefined) return cachedModule;

  // Expo Go does not ship the native module; bail early before requiring the JS wrapper.
  if (!NativeModulesProxy?.ExpoInAppPurchases) {
    console.log("Hitting this!")
    cachedModule = null;
    return null;
  }

  try {
    const mod = await import('expo-in-app-purchases');
    cachedModule = mod;
    return mod;
  } catch (err) {
    // If the native module is missing (Expo Go), remember and bail.
    cachedModule = null;
    return null;
  }
};

export const connectToStore = async () => {
  const mod = await loadModule();
  if (!mod) return false;

  try {
    // TODO: Fine-tune error handling and finish transaction consumption.
    const { responseCode } = await mod.connectAsync();
    return responseCode === mod.IAPResponseCode.OK;
  } catch {
    return false;
  }
};

export const getProducts = async (): Promise<DeckProduct[]> => {
  const mod = await loadModule();
  if (!mod) throw new Error('iap-unavailable');

  const ok = await connectToStore();
  if (!ok) throw new Error('iap-unavailable');

  const products = await mod.getProductsAsync(deckProductIds);
  return products.map((p) => ({ id: p.productId, title: p.title ?? p.productId, price: p.priceString }));
};

export const purchaseProduct = async (productId: string) => {
  const mod = await loadModule();
  if (!mod) throw new Error('iap-unavailable');

  await mod.purchaseItemAsync(productId);
};

export const endConnection = async () => {
  const mod = await loadModule();
  if (!mod) return;
  try {
    await mod.disconnectAsync();
  } catch {
    // ignore
  }
};
