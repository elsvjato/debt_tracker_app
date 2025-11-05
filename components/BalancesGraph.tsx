import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { formatAmount } from '../utils/currency';

interface Participant {
  id: string;
  name: string;
}

interface BalancesGraphProps {
  balances: Record<string, number>;
  participants: Participant[];
  userId?: string;
  currency?: string;
}

const CARD_HEIGHT = 44;
const CARD_MARGIN = 14;
const BAR_MAX_WIDTH = 160;
const BAR_MIN_WIDTH = 48;

export const BalancesGraph: React.FC<BalancesGraphProps> = ({ balances, participants, userId, currency = 'USD' }) => {
  const anims = useRef(participants.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(80, anims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 })
    )).start();
  }, [participants.length]);

  const maxAbs = Math.max(...participants.map(p => Math.abs(balances[p.id] || 0)), 1);

  return (
    <View style={styles.graphBox}>
      {Array.isArray(participants) ? participants.filter(p => p && typeof p === 'object' && p.id && typeof p.name === 'string').map((p, idx) => {
        const val = +balances[p.id]?.toFixed(2) || 0;
        const isPositive = val > 0.01;
        const isNegative = val < -0.01;
        const isZero = !isPositive && !isNegative;
        const animIdx = idx;
        const percent = Math.abs(val) / maxAbs;
        const sumText = `${isNegative ? '-' : isPositive ? '+' : ''}${formatAmount(Math.abs(val), currency, true)}`;
        const minTextWidth = sumText.length * 13 + 24;
        const propWidth = percent * BAR_MAX_WIDTH;
        const barWidth = isZero
          ? minTextWidth
          : Math.max(minTextWidth, propWidth);
        if (isZero) {
          return (
            <Animated.View
              key={p.id || idx}
              style={{
                opacity: anims[animIdx],
                transform: [{ scale: anims[animIdx] }],
                marginBottom: CARD_MARGIN,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: CARD_HEIGHT,
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1 }} />
              <View style={[styles.bar, styles.barGray, { minWidth: BAR_MIN_WIDTH * 1.2, paddingHorizontal: 18, shadowColor: '#888', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: CARD_HEIGHT }, userId === p.id && styles.cardUser ]}>
                <Text style={[styles.amount, { textAlign: 'center', marginRight: 8 }]}>0{formatAmount(0, currency, true)}</Text>
                <Text style={[styles.name, { color: '#fff', textAlign: 'center' }]} numberOfLines={1}>
                  {p.name}
                  {userId === p.id ? <Text style={{ color: '#FFD600' }}> (You)</Text> : null}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
            </Animated.View>
          );
        }
        return (
          <Animated.View
            key={p.id || idx}
            style={{
              opacity: anims[animIdx],
              transform: [{ scale: anims[animIdx] }],
              marginBottom: CARD_MARGIN,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: CARD_HEIGHT,
              height: CARD_HEIGHT,
              width: '100%',
            }}
          >
            {/* Left half */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', height: CARD_HEIGHT }}>
              {isPositive && (
                <Text
                  style={[styles.name, styles.nameRight, { marginRight: 0 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {p.name}
                  {userId === p.id ? <Text style={{ color: '#FFD600' }}> (You)</Text> : null}
                </Text>
              )}
              {isNegative && (
                <View style={[styles.bar, styles.barRed, { width: barWidth, shadowColor: '#FF4444', height: CARD_HEIGHT }, userId === p.id && styles.cardUser ]}>
                  <Text style={[styles.amount, { textAlign: 'right' }]}>-{formatAmount(Math.abs(val), currency, true)}</Text>
                </View>
              )}
            </View>
            {/* Axis */}
            <View style={styles.centerAxis} />
            {/* Right half */}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', height: CARD_HEIGHT }}>
              {isPositive && (
                <View style={[styles.bar, styles.barGreen, { width: barWidth, shadowColor: '#2ECC71', height: CARD_HEIGHT }, userId === p.id && styles.cardUser ]}>
                  <Text style={[styles.amount, { textAlign: 'left' }]}>+{formatAmount(val, currency, true)}</Text>
                </View>
              )}
              {isNegative && (
                <Text
                  style={[styles.name, styles.nameLeft, { marginLeft: 0 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {p.name}
                  {userId === p.id ? <Text style={{ color: '#FFD600' }}> (You)</Text> : null}
                </Text>
              )}
            </View>
          </Animated.View>
        );
      }) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  graphBox: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  centerAxis: {
    width: 16,
    height: CARD_HEIGHT,
  },
  bar: {
    minHeight: CARD_HEIGHT,
    height: CARD_HEIGHT,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  barGreen: {
    backgroundColor: '#2ECC71',
    paddingLeft: 18,
    paddingRight: 8,
  },
  barRed: {
    backgroundColor: '#FF4444',
    paddingRight: 18,
    paddingLeft: 8,
  },
  barGray: {
    backgroundColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardUser: {
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  amount: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    minWidth: 60,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    maxWidth: 120,
  },
  nameLeft: {
    marginLeft: 8,
    textAlign: 'left',
  },
  nameRight: {
    marginRight: 8,
    textAlign: 'right',
  },
});

export default BalancesGraph; 