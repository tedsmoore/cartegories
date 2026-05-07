import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  onBack: () => void;
};

const ACCENT = '#1EAFE2';

const ScreenHeader: React.FC<Props> = ({ title, onBack }) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left + 12,
          paddingRight: insets.right + 12,
        },
      ]}
    >
      <Pressable
        onPress={onBack}
        hitSlop={16}
        accessibilityRole="button"
        accessibilityLabel="Back"
        testID="screen-header-back"
        style={styles.side}
      >
        <Text style={styles.backText}>{'< Back'}</Text>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: ACCENT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  side: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    minWidth: 70,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
});

export default ScreenHeader;
