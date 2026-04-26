import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as StoreReview from 'expo-store-review';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useSoundContext } from '../state/SoundContext';
import { useGame } from '../state/GameContext';
import ScreenHeader from '../components/ScreenHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ACCENT = '#1EAFE2';

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { soundEnabled, setSoundEnabled } = useSoundContext();
  const { game } = useGame();

  const onRateUs = async () => {
    if (await StoreReview.isAvailableAsync()) {
      StoreReview.requestReview();
    } else {
      Alert.alert('Rate Us', 'Store review is not available on this device.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <SafeAreaView style={styles.body} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.row} accessibilityLabel="Sound Effects">
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Sound Effects</Text>
            </View>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>

          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Timer')}
            accessibilityLabel="Timer"
            accessibilityRole="button"
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Timer</Text>
              <Text style={styles.rowSubtitle}>
                Currently {game.timerPreset} seconds
              </Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={onRateUs}
            accessibilityLabel="Rate Us"
            accessibilityRole="button"
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Rate Us</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Tutorial')}
            accessibilityLabel="View Tutorial"
            accessibilityRole="button"
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>View Tutorial</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('Rules')}
            accessibilityLabel="Rules"
            accessibilityRole="button"
          >
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Rules</Text>
            </View>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCENT,
  },
  body: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  row: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 17,
    color: '#0f172a',
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: ACCENT,
    fontWeight: '600',
  },
});

export default SettingsScreen;
