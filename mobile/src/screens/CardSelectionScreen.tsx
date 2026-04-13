import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Animated,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import { Card } from '../types';
import { getBlobImage } from '../constants/deckImages';
import { useShake } from '../hooks/useShake';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'CardSelection'>;

const CardSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { drawCard, game, decks } = useGame();
  const { width, height } = useWindowDimensions();
  const [card, setCard] = useState<Card | null>(game.currentCard);
  const [previousCard, setPreviousCard] = useState<Card | null>(null);
  const speechVisibleRef = useRef(false);
  const alertShowingRef = useRef(false);

  // Blob slide-in animation
  const blobTranslateX = useRef(new Animated.Value(-width * 0.4)).current;
  const speechOpacity = useRef(new Animated.Value(0)).current;

  // Run blob entrance on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(blobTranslateX, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const getDeckName = (deckId: string): string => {
    const deck = decks.find((d) => d.id === deckId);
    return deck?.name ?? 'General';
  };

  const onDrawCard = () => {
    if (card) {
      setPreviousCard(card);
    }
    const next = drawCard();
    setCard(next);
  };

  const onPlay = () => {
    if (card) {
      navigation.navigate('Play');
    }
  };

  const toggleSpeechBubble = () => {
    speechVisibleRef.current = !speechVisibleRef.current;
    Animated.timing(speechOpacity, {
      toValue: speechVisibleRef.current ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const onShake = useCallback(() => {
    if (!previousCard || alertShowingRef.current) return;
    alertShowingRef.current = true;
    Alert.alert(
      'Go back?',
      `Return to: ${previousCard.category}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => { alertShowingRef.current = false; },
        },
        {
          text: 'OK',
          onPress: () => {
            alertShowingRef.current = false;
            setCard(previousCard);
            setPreviousCard(null);
          },
        },
      ],
      { cancelable: false },
    );
  }, [previousCard]);

  useShake(onShake);

  const deckName = card ? getDeckName(card.deckId) : undefined;
  const blobSource = getBlobImage(deckName);
  const blobHeight = height * 0.504;

  return (
    <ImageBackground
      source={require('../../assets/images/mountain-scape.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Nav icons */}
        <View style={styles.navRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Image
              source={require('../../assets/images/white-home-icon.png')}
              style={styles.navIcon}
            />
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Decks')} hitSlop={12}>
            <Image
              source={require('../../assets/images/white-gear.png')}
              style={styles.navIcon}
            />
          </Pressable>
        </View>

        {/* Category text */}
        <View style={styles.categoryArea}>
          <Text style={styles.categoryText}>
            {card ? card.category : 'Select a card...'}
          </Text>
        </View>

        {/* Blob character */}
        <Animated.View
          style={[
            styles.blobContainer,
            {
              height: blobHeight,
              transform: [{ translateX: blobTranslateX }, { translateY: -blobHeight / 2 }, { rotate: '30deg' }],
            },
          ]}
        >
          <Pressable onPress={toggleSpeechBubble}>
            <Image
              source={blobSource}
              style={{ height: blobHeight, width: blobHeight * 0.75 }}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>

        {/* Speech bubble */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.speechContainer,
            { opacity: speechOpacity },
          ]}
        >
          <Image
            source={require('../../assets/images/speech-bubble.png')}
            style={styles.speechImage}
            resizeMode="contain"
          />
          <Text style={styles.speechText}>
            {deckName ?? 'General'}
          </Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonLeft}>
          <Button
            title="New Card"
            baseColor="#e94b24"
            onPress={onDrawCard}
            width={195}
            breathing={!card}
          />
        </View>

        <View style={[styles.buttonRight, !card && { opacity: 0.4 }]}>
          <Button
            title="PLAY!"
            baseColor="#e94b24"
            onPress={onPlay}
            width={195}
            breathing={!!card}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 44,
    paddingTop: 24,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  categoryArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '22%',
    right: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontFamily: 'NanumBrush',
    fontSize: 36,
    color: '#1e293b',
    textAlign: 'center',
  },
  blobContainer: {
    position: 'absolute',
    top: '50%',
    left: '2%',
  },
  speechContainer: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    width: 160,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speechImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  speechText: {
    fontFamily: 'NanumBrush',
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    paddingBottom: 8,
  },
  buttonLeft: {
    position: 'absolute',
    bottom: '6%',
    left: '7%',
  },
  buttonRight: {
    position: 'absolute',
    bottom: '6%',
    right: '7%',
  },
});

export default CardSelectionScreen;
