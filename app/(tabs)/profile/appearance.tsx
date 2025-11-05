import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { strings } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useSettings } from '../../../theme/SettingsContext';
import { useTheme } from '../../../theme/useTheme';

const themes = [
  { key: 'system', label: 'systemDefault' },
  { key: 'light', label: 'light' },
  { key: 'dark', label: 'dark' },
];
const languages = [
  { key: 'en', label: 'english' },
  { key: 'pl', label: 'polish' },
  { key: 'uk', label: 'ukrainian' },
];

export default function Appearance() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings, setThemeMode, setLanguage } = useSettings();

  const [themeModal, setThemeModal] = useState(false);
  const [langModal, setLangModal] = useState(false);

  // Safe check
  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Loading settings...</Text>
      </View>
    );
  }

  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t(strings.appAppearance)}</Text>
      </View>
      <View style={[styles.optionsSection, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: theme.colors.surfaceVariant }]} onPress={() => setThemeModal(true)}>
          <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>{t(strings.theme)}</Text>
          <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>{t(themes.find(theme => theme.key === settings.themeMode)?.label || '')}</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionItem, { borderBottomColor: theme.colors.surfaceVariant }]} onPress={() => setLangModal(true)}>
          <Text style={[styles.optionText, { color: theme.colors.textPrimary }]}>{t(strings.appLanguage)}</Text>
          <Text style={[styles.valueText, { color: theme.colors.textSecondary }]}>{t(languages.find(l => l.key === settings.language)?.label || '')}</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      {/* Theme Modal */}
      <Modal visible={themeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t(strings.theme)}</Text>
            {themes.map(themeOption => (
              <Pressable key={themeOption.key} style={styles.modalOption} onPress={() => { setThemeMode(themeOption.key as 'light' | 'dark' | 'system'); setThemeModal(false); }}>
                <Ionicons name={settings.themeMode === themeOption.key ? 'radio-button-on' : 'radio-button-off'} size={22} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <Text style={[styles.modalOptionText, { color: theme.colors.textPrimary }]}>{t(themeOption.label)}</Text>
              </Pressable>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancel, { borderColor: theme.colors.primary }]} onPress={() => setThemeModal(false)}>
                <Text style={[styles.modalCancelText, { color: theme.colors.primary }]}>{t(strings.cancel)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOk, { backgroundColor: theme.colors.primary }]} onPress={() => setThemeModal(false)}>
                <Text style={[styles.modalOkText, { color: "#18181B" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Language Modal */}
      <Modal visible={langModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t(strings.appLanguage)}</Text>
            {languages.map(l => (
              <Pressable key={l.key} style={styles.modalOption} onPress={() => { setLanguage(l.key as 'en' | 'pl' | 'uk'); setLangModal(false); }}>
                <Ionicons name={settings.language === l.key ? 'radio-button-on' : 'radio-button-off'} size={22} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <Text style={[styles.modalOptionText, { color: theme.colors.textPrimary }]}>{t(l.label)}</Text>
              </Pressable>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalCancel, { borderColor: theme.colors.primary }]} onPress={() => setLangModal(false)}>
                <Text style={[styles.modalCancelText, { color: theme.colors.primary }]}>{t(strings.cancel)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOk, { backgroundColor: theme.colors.primary }]} onPress={() => setLangModal(false)}>
                <Text style={[styles.modalOkText, { color: "#18181B" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  optionsSection: {
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 32,
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
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 18,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancel: {
    borderWidth: 2,
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalCancelText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  modalOk: {
    borderRadius: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalOkText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 