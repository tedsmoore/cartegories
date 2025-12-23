import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { DeckProduct, getProducts, purchaseProduct, endConnection } from '../services/iap';

type Props = NativeStackScreenProps<RootStackParamList, 'Store'>;

const StoreScreen: React.FC<Props> = () => {
  const [products, setProducts] = useState<DeckProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getProducts();
        setProducts(result);
      } catch (err) {
        console.warn(err);
        setUnavailable(true);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      endConnection();
    };
  }, []);

  const buy = async (productId: string) => {
    try {
      await purchaseProduct(productId);
      Alert.alert('Purchased', 'Thanks! Unlocks will be wired once Firebase + IAP hooks land.');
    } catch (err) {
      Alert.alert('Error', 'Purchase failed. Try again later.');
      console.warn(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (unavailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Deck Store</Text>
        <Text style={styles.subtitle}>
          In-app purchases require a custom dev client or standalone build. Run `npx expo run:ios` / `npx expo run:android`
          (after installing `expo-dev-client`) to test purchases.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Deck Store</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.price ?? 'Price TBD'}</Text>
            </View>
            <Pressable style={styles.button} onPress={() => buy(item.id)}>
              <Text style={styles.buttonText}>Buy</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.subtitle}>No products available in sandbox.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  row: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});

export default StoreScreen;
