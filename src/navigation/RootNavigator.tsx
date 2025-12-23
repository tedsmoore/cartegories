import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import DecksScreen from '../screens/DecksScreen';
import PlayScreen from '../screens/PlayScreen';
import StoreScreen from '../screens/StoreScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TimerScreen from '../screens/TimerScreen';
import TutorialScreen from '../screens/TutorialScreen';
import RulesScreen from '../screens/RulesScreen';
import GameOverScreen from '../screens/GameOverScreen';

export type RootStackParamList = {
  Home: undefined;
  Decks: undefined;
  Play: undefined;
  Store: undefined;
  Settings: undefined;
  Timer: undefined;
  Tutorial: undefined;
  Rules: undefined;
  GameOver: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'Decks' }} />
        <Stack.Screen name="Play" component={PlayScreen} options={{ title: 'Play' }} />
        <Stack.Screen name="Store" component={StoreScreen} options={{ title: 'Store' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Timer" component={TimerScreen} options={{ title: 'Timer' }} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ title: 'Tutorial' }} />
        <Stack.Screen name="Rules" component={RulesScreen} options={{ title: 'Rules' }} />
        <Stack.Screen name="GameOver" component={GameOverScreen} options={{ title: 'Game Over' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
