import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HELP } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

export default function Help() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(HELP.TITLE)}</Text>
      </View>
      <View style={[styles.optionsSection, { backgroundColor: colors.cardBackground }]}>
        <HelpOption icon="help-circle-outline" text={t(HELP.FAQ)} onPress={() => router.push('/(tabs)/profile/faq')} />
        <HelpOption icon="document-text-outline" text={t(HELP.TERMS_OF_SERVICE)} onPress={() => router.push('/(tabs)/profile/terms')} />
      </View>
      <View style={[styles.supportSection, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.supportText, { color: colors.textPrimary }]}>{t(HELP.SUPPORT_TEXT)}</Text>
        <Text style={[styles.supportEmail, { color: colors.primary }]}>{t(HELP.SUPPORT_EMAIL)}</Text>
      </View>
    </SafeAreaView>
  );
}

function HelpOption({ icon, text, onPress }: { icon: any; text: string; onPress: () => void }) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity style={[styles.optionItem, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={24} color={colors.primary} style={{ marginRight: 18 }} />
      <Text style={[styles.optionText, { color: colors.textPrimary }]}>{text}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  optionsSection: {
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  supportSection: {
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  supportText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  supportEmail: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 