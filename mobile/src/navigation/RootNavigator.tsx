import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CardSelectionScreen from '../screens/CardSelectionScreen';
import DecksScreen from '../screens/DecksScreen';
import PlayScreen from '../screens/PlayScreen';
import StoreScreen from '../screens/StoreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TimerScreen from '../screens/TimerScreen';
import TutorialScreen from '../screens/TutorialScreen';
import RulesScreen from '../screens/RulesScreen';
import GameOverScreen from '../screens/GameOverScreen';
import ReportCardScreen from '../screens/ReportCardScreen';

export type RootStackParamList = {
  Home: undefined;
  CardSelection: undefined;
  Decks: undefined;
  Play: undefined;
  Store: undefined;
  Settings: undefined;
  Timer: undefined;
  Tutorial: undefined;
  Rules: undefined;
  GameOver: undefined;
  ReportCard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['cartegories://'],
  config: {
    screens: {
      Home: 'home',
      CardSelection: 'card-selection',
      Decks: 'decks',
      Play: 'play',
      Store: 'store',
      Settings: 'settings',
      Timer: 'timer',
      Tutorial: 'tutorial',
      Rules: 'rules',
      GameOver: 'game-over',
      ReportCard: 'report-card',
    },
  },
};

const RootNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CardSelection" component={CardSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Decks"
          component={DecksScreen}
          options={{
            title: 'Decks',
            headerShown: true,
            headerBackTitle: 'Back',
            headerTintColor: '#1EAFE2',
          }}
        />
        <Stack.Screen name="Play" component={PlayScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Store" component={StoreScreen} options={{ title: 'Store' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Timer" component={TimerScreen} options={{ title: 'Timer' }} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ title: 'Tutorial' }} />
        <Stack.Screen name="Rules" component={RulesScreen} options={{ title: 'Rules' }} />
        <Stack.Screen name="GameOver" component={GameOverScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReportCard" component={ReportCardScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
