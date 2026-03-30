import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Rules'>;

const RulesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>How to Play:</Text>

      <Text style={styles.step}>1) Select a category card.</Text>
      <Text style={styles.step}>2) Read the category out loud.</Text>
      <Text style={styles.step}>3) Press PLAY!</Text>

      <Text style={styles.copy}>
        Your teammates will try to name as many items in the category as they can before the timer
        runs out. Toggle the switch ON for each item they get correct.
      </Text>
      <Text style={styles.copy}>
        Score all 10 items for a perfect round! Your score is the number of switches turned ON when
        time expires.
      </Text>

      <Pressable style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Got it!</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: 24,
    fontFamily: 'Witless',
  },
  step: {
    fontSize: 20,
    color: '#e2e8f0',
    marginBottom: 12,
    fontFamily: 'NanumBrush',
  },
  copy: {
    color: '#cbd5e1',
    marginTop: 16,
    lineHeight: 22,
    fontSize: 15,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#e94b24',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'Witless',
  },
});

export default RulesScreen;
