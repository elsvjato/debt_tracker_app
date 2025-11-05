import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAQ } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

const faqData = [
  { q: 'faq.question1', a: 'faq.answer1' },
  { q: 'faq.question2', a: 'faq.answer2' },
  { q: 'faq.question3', a: 'faq.answer3' },
  { q: 'faq.question4', a: 'faq.answer4' },
  { q: 'faq.question5', a: 'faq.answer5' },
  { q: 'faq.question6', a: 'faq.answer6' },
  { q: 'faq.question7', a: 'faq.answer7' },
];

export default function FAQScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t(FAQ.TITLE)}</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {faqData.map((item, idx) => (
          <View key={idx} style={[styles.faqItem, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.question, { color: colors.primary }]}>{t(item.q)}</Text>
            <Text style={[styles.answer, { color: colors.textPrimary }]}>{t(item.a)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  backBtn: {
    marginTop: 24,
    marginLeft: 16,
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    alignSelf: 'center',
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  faqItem: {
    marginBottom: 28,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  question: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
}); 