import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GameOver'>;

const GameOverScreen: React.FC<Props> = ({ navigation }) => {
  const { game } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time&apos;s up!</Text>
      <Text style={styles.score}>Score: {game.score}</Text>
      <Text style={styles.meta}>Cards seen: {game.drawnCards.length}</Text>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to home</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 12,
  },
  score: {
    fontSize: 22,
    fontWeight: '700',
    color: '#38bdf8',
  },
  meta: {
    marginTop: 6,
    color: '#cbd5e1',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default GameOverScreen;

