import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Welcome to Splitter',
    desc: 'Easily split expenses with friends and family. Track, manage, and settle up in seconds.',
  },
  {
    key: '2',
    title: 'Stay Connected',
    desc: "Add, remove, and stay in the loop with who you're splitting with. All your contacts in one place.",
  },
  {
    key: '3',
    title: 'Smart Settling',
    desc: 'We calculate the optimal way to settle debts. No more confusion, just simple math.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { setOnboardingComplete } = useSupabaseAuth();
  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleGetStarted = async () => {
    try {
      await setOnboardingComplete(true);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.replace('/auth/login');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>LOGO</Text>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.desc}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={ev => {
          setIndex(Math.round(ev.nativeEvent.contentOffset.x / width));
        }}
        style={{ flexGrow: 0 }}
      />
      <View style={styles.dotsRow}>
        {slides.map((_, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, index === i && styles.dotActive]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 32,
    backgroundColor: '#23232a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoText: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 22,
  },
  slideTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#23232a',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFC107',
  },
  button: {
    backgroundColor: '#FFC107',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    width: width - 64,
    marginTop: 8,
  },
  buttonText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 