import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import RootNavigator from './src/navigation/RootNavigator';
import { GameProvider } from './src/state/GameContext';
import { ActivityIndicator, View } from 'react-native';

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
      <GameProvider>
        <RootNavigator />
      </GameProvider>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
