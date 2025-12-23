import React, { useEffect, useRef } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  title: string;
  baseColor: string;
  onPress: () => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
  breathing?: boolean;
};

type RGB = { r: number; g: number; b: number };

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v));

const hexToRgb = (hex: string): RGB => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized;
  const int = parseInt(value, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
};

const rgbToHex = ({ r, g, b }: RGB) => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = ({ r, g, b }: RGB) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return { h, s, l };
};

const hslToRgb = ({ h, s, l }: { h: number; s: number; l: number }): RGB => {
  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const shiftLightness = (hex: string, delta: number) => {
  const hsl = rgbToHsl(hexToRgb(hex));
  const next = { ...hsl, l: clamp(hsl.l + delta) };
  return rgbToHex(hslToRgb(next));
};

const Button: React.FC<Props> = ({ title, baseColor, onPress, width = 200, style, breathing = false }) => {
  const borderStart = shiftLightness(baseColor, 0.18);
  const borderEnd = shiftLightness(baseColor, -0.08);
  const faceTop = shiftLightness(baseColor, 0.12);
  const faceMid = baseColor;
  const faceLower = shiftLightness(baseColor, -0.08);
  const faceBottom = shiftLightness(baseColor, -0.16);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let breatheLoop: Animated.CompositeAnimation | undefined;

    if (breathing) {
      breatheLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.06,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      breatheLoop.start();
    } else {
      scale.stopAnimation(() => scale.setValue(1));
    }

    return () => {
      breatheLoop?.stop();
      scale.stopAnimation();
      scale.setValue(1);
    };
  }, [breathing, scale]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        { width },
        pressed && styles.wrapperPressed,
        style,
      ]}
    >
      <Animated.View style={[styles.scaleWrapper, { transform: [{ scale }] }]}>
        <LinearGradient colors={[borderStart, borderEnd]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.border}>
          <LinearGradient
            colors={[faceTop, faceMid, faceLower, faceBottom]}
            locations={[0, 0.25, 0.7, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.face}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 0.1, y: 1 }}
              style={styles.shine}
            />
            <View style={styles.sparkle} />
            <Text style={styles.text}>{title}</Text>
          </LinearGradient>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 60,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  wrapperPressed: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
  },
  scaleWrapper: {
    flex: 1,
  },
  base: {
    flex: 1,
    borderRadius: 28,
    padding: 5,
    justifyContent: 'flex-end',
  },
  border: {
    flex: 1,
    borderRadius: 28,
    padding: 2,
    overflow: 'hidden',
  },
  face: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: -4,
    left: 8,
    right: 8,
    height: '55%',
    borderRadius: 22,
    transform: [{ scaleX: 1.02 }],
  },
  sparkle: {
    position: 'absolute',
    width: 16,
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    top: 6,
    right: 12,
    transform: [{ rotate: '28deg' }],
  },
  text: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: 'Witless',
  },
});

export default Button;
