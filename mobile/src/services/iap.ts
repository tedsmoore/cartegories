// IAP will be rebuilt with RevenueCat in Phase 6.
// Stubbed exports so existing screens compile.

export type DeckProduct = {
  id: string;
  title: string;
  price?: string;
};

export const getDeckProductIds = () => [] as string[];

export const connectToStore = async () => false;

export const getProducts = async (): Promise<DeckProduct[]> => {
  throw new Error('iap-unavailable');
};

export const purchaseProduct = async (_productId: string) => {
  throw new Error('iap-unavailable');
};

export const endConnection = async () => {};
