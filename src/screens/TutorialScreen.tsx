import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

const TutorialScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../assets/tutorial/map_bg.png')}
      resizeMode="cover"
      style={styles.container}
      imageStyle={styles.mapImage}
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Want More{'\n'}Control?</Text>
          <Text style={styles.copy}>You can add or remove decks by visiting the settings page!</Text>

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.primaryText}>Open Settings</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.secondaryText}>Back to Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1323',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  mapImage: {
    opacity: 0.32,
    transform: [{ scale: 1.05 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 16, 31, 0.6)',
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 38,
    fontFamily: 'Witless',
  },
  copy: {
    color: '#e2e8f0',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 320,
    fontFamily: 'NanumBrush',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryText: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default TutorialScreen;
