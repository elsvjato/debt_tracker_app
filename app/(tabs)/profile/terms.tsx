import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TERMS } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

export default function Terms() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const terms = [
    {
      title: t(TERMS.ACCEPTANCE),
      content: t(TERMS.ACCEPTANCE_TEXT)
    },
    {
      title: t(TERMS.USE_LICENSE),
      content: t(TERMS.USE_LICENSE_TEXT)
    },
    {
      title: t(TERMS.DISCLAIMER),
      content: t(TERMS.DISCLAIMER_TEXT)
    },
    {
      title: t(TERMS.LIMITATIONS),
      content: t(TERMS.LIMITATIONS_TEXT)
    },
    {
      title: t(TERMS.PRIVACY),
      content: t(TERMS.PRIVACY_TEXT)
    },
    {
      title: t(TERMS.CHANGES),
      content: t(TERMS.CHANGES_TEXT)
    },
    {
      title: t(TERMS.CONTACT),
      content: t(TERMS.CONTACT_TEXT)
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t(TERMS.TITLE)}</Text>
      <Text style={[styles.lastUpdated, { color: theme.colors.textSecondary }]}>{t(TERMS.LAST_UPDATED)}</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {terms.map((item, idx) => (
          <View key={idx} style={[styles.termItem, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.termTitle, { color: theme.colors.primary }]}>{item.title}</Text>
            <Text style={[styles.termContent, { color: theme.colors.textPrimary }]}>{item.content}</Text>
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
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  termItem: {
    marginBottom: 28,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  termTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
  },
  termContent: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
}); 