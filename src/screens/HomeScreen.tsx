import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useGame } from '../state/GameContext';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { startNewRound } = useGame();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const logoMarginTop = isLandscape ? 10 : height * 0.1;
  const screenWidth = width;
  const largeCloudWidth = 180;
  const smallCloudWidth = 120;
  const largeCloudStart = -(screenWidth + largeCloudWidth);
  const smallCloudStart = -(screenWidth + smallCloudWidth);
  const largeCloudEnd = screenWidth + largeCloudWidth;
  const smallCloudEnd = screenWidth + smallCloudWidth;
  const bigCloudX = useRef(new Animated.Value(largeCloudStart)).current;
  const smallCloudX = useRef(new Animated.Value(smallCloudStart)).current;
  const logoDropAnim = useRef(new Animated.Value(-500)).current;

  Animated.spring(logoDropAnim, {
    toValue: 0,
    delay: 500,
    tension: 50,
    friction: 7,
    useNativeDriver: true,
  }).start();

  const onStart = () => {
    startNewRound();
    navigation.navigate('Play');
  };

  useEffect(() => {
    // Reset positions on rotation so clouds restart offscreen
    bigCloudX.setValue(largeCloudStart);
    smallCloudX.setValue(smallCloudStart);
  }, [largeCloudStart, smallCloudStart, bigCloudX, smallCloudX]);

  useEffect(() => {
    const bigCloudLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bigCloudX, {
          toValue: largeCloudEnd,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bigCloudX, {
          toValue: largeCloudStart,
          duration: 0,
          delay: 2000,
          useNativeDriver: true,
        }),
      ]),
    );

    const smallCloudLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(smallCloudX, {
          toValue: largeCloudEnd,
          duration: 9500,
          easing: Easing.linear,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(smallCloudX, {
          toValue: smallCloudStart,
          duration: 0,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    bigCloudLoop.start();
    smallCloudLoop.start();

    return () => {
      bigCloudLoop.stop();
      smallCloudLoop.stop();
      bigCloudX.stopAnimation();
      smallCloudX.stopAnimation();
    };
  }, [bigCloudX, smallCloudX, largeCloudStart, smallCloudStart, largeCloudEnd, smallCloudEnd, screenWidth]);

  return (
    <ImageBackground source={require('../../assets/images/scenery.png')} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView
        style={[styles.safeArea, { paddingHorizontal: isLandscape ? 28 : 20 }]}
        edges={['top', 'bottom']}
      >
        <Animated.Image
          source={require('../../assets/images/cloud.png')}
          resizeMode="contain"
          style={[
            styles.cloudLarge,
            isLandscape && styles.cloudLargeLandscape,
            { transform: [{ translateX: bigCloudX }] , marginTop: logoMarginTop},
          ]}
        />
        <Animated.Image
          source={require('../../assets/images/cloud.png')}
          resizeMode="contain"
          style={[
            styles.cloudSmall,  
            isLandscape && styles.cloudSmallLandscape,
            { transform: [{ translateX: smallCloudX}], marginTop: logoMarginTop + 35},
          ]}
        />

        <View
          style={[
            styles.logoContainer,
            isLandscape && styles.logoContainerLandscape,
            !isLandscape && { marginTop: logoMarginTop },
          ]}
        >
          <Animated.Image
            source={
              isLandscape
                ? require('../../assets/images/name_logo.png')
                : require('../../assets/images/name_logo_stacked.png')
            }
            style={[
              styles.logo,
              isLandscape ? styles.logoLandscape : styles.logoPortrait,
              { transform: [{ translateY: logoDropAnim }] },
            ]}
            resizeMode="contain"
          />
        </View>

        {!isLandscape && <View style={styles.spacer} />}

        <View style={[styles.buttonStack, isLandscape && styles.buttonStackLandscape]}>
          <View style={styles.primaryButtonWrapper}>
            <Button
              title="Quick Play"
              baseColor="#e94b24"
              onPress={onStart}
              width={200}
              breathing
              style={styles.shadow}
            />
          </View>

          <Button
            title="How to Play"
            baseColor="#e94b24"
            onPress={() => navigation.navigate('Rules')}
            width={200}
            style={styles.shadow}
          />
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cloudLarge: {
    position: 'absolute',
    top: 60,
    width: 180,
    height: 130,
  },
  cloudSmall: {
    position: 'absolute',
    top: 120,
    width: 120,
    height: 90,
  },
  cloudLargeLandscape: {
    top: '5%',
  },
  cloudSmallLandscape: {
    top: '15%',
  },
  car: {
    position: 'absolute',
    bottom: '22%',
    left: 0,
    zIndex: 5,
  },
  logoContainer: {
    width: '80%',
  },
  logoContainerLandscape: {
    flex: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    tintColor: undefined,
  },
  logoPortrait: {
    height: 220,
  },
  logoLandscape: {
    marginTop: '4%',
    height: '90%',
  },
  spacer: {
    flex: 1,
  },
  buttonStack: {
    width: '90%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom: 40,
  },
  buttonStackLandscape: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 0,
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  primaryButtonWrapper: {
    width: 200,
  },
});

export default HomeScreen;
