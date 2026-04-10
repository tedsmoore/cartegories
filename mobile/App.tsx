import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import RootNavigator from './src/navigation/RootNavigator';
import { GameProvider } from './src/state/GameContext';
import { SoundProvider } from './src/state/SoundContext';
import { ActivityIndicator, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import { DB_NAME } from './src/db/db';
import { initDatabase } from './src/services/database';
import React from 'react';

export default function App() {
  const [fontsLoaded] = useFonts({
    Witless: require('./assets/fonts/witless_.ttf'),
    NanumBrush: require('./assets/fonts/NanumBrush.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <React.Suspense fallback={
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      }>
        <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase} useSuspense>
          <SoundProvider>
            <GameProvider>
              <RootNavigator />
            </GameProvider>
          </SoundProvider>
        </SQLiteProvider>
      </React.Suspense>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
