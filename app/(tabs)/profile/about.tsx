import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ABOUT } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

export default function AboutUs() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(ABOUT.TITLE)}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
          <Ionicons name="star" size={44} color={colors.background} />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>{t(ABOUT.APP_NAME)}</Text>
        <Text style={[styles.desc, { color: colors.textPrimary }]}>
          {t(ABOUT.DESCRIPTION)}
        </Text>
        
        <Text style={[styles.featuresTitle, { color: colors.textPrimary }]}>{t(ABOUT.FEATURES_TITLE)}</Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_1)}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_2)}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_3)}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_4)}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_5)}</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.featureIcon} />
            <Text style={[styles.featureText, { color: colors.textPrimary }]}>{t(ABOUT.FEATURE_6)}</Text>
          </View>
        </View>
        
        <Text style={[styles.mission, { color: colors.textPrimary }]}>
          {t(ABOUT.MISSION)}
        </Text>
        <Text style={[styles.version, { color: colors.textSecondary }]}>
          {t(ABOUT.VERSION)}
        </Text>
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
  content: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 16,
  },
  desc: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  mission: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 