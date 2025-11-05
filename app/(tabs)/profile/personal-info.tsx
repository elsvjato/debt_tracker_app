import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../config/supabaseClient';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { PERSONAL_INFO } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

export default function PersonalInfo() {
  const router = useRouter();
  const { user: supabaseUser } = useSupabaseAuth();
  const theme = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState(supabaseUser?.user_metadata?.name || supabaseUser?.name || '');
  const [avatar, setAvatar] = useState<string | undefined>(supabaseUser?.user_metadata?.avatar || supabaseUser?.avatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabaseUser) {
      setTimeout(() => {
        router.replace('/auth/login');
      }, 0);
    }
    setName(supabaseUser?.user_metadata?.name || supabaseUser?.name || '');
    setAvatar(supabaseUser?.user_metadata?.avatar || supabaseUser?.avatar);
  }, [supabaseUser]);

  if (!supabaseUser) return null;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(PERSONAL_INFO.PERMISSION_REQUIRED), t(PERSONAL_INFO.PERMISSION_MESSAGE));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t(PERSONAL_INFO.ERROR), t(PERSONAL_INFO.ERROR));
      return;
    }
    setSaving(true);
    try {
      // Оновлюємо ім'я та аватар через Supabase Auth
      const updates: any = { data: { name: name.trim() } };
      if (avatar && avatar !== supabaseUser.avatar) {
        // Якщо аватар змінився, треба завантажити його у storage і зберегти url
        // (Тут можна додати uploadPhoto, якщо потрібно)
        updates.data.avatar = avatar;
      }
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      // Force refresh session to get updated user_metadata
      await supabase.auth.getSession();
      Alert.alert(t(PERSONAL_INFO.SAVE), t(PERSONAL_INFO.SAVE));
      router.back();
    } catch (e: any) {
      Alert.alert(t(PERSONAL_INFO.ERROR), e.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.colors.surface }]} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>{t(PERSONAL_INFO.TITLE)}</Text>
      </View>
      <View style={styles.avatarSection}>
        <View>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' }]}> 
                <Ionicons name="person" size={48} color={theme.colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
          <View style={[styles.editAvatarBtn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.background }]}> 
            <Ionicons name="pencil" size={18} color="#18181B" />
          </View>
        </View>
      </View>
      <View style={styles.inputSection}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{t(PERSONAL_INFO.NAME_LABEL)}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]} 
          value={name} 
          onChangeText={setName} 
          placeholder={t(PERSONAL_INFO.NAME_PLACEHOLDER)} 
          placeholderTextColor={theme.colors.textSecondary} 
        />
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{t(PERSONAL_INFO.EMAIL_LABEL)}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]} 
          value={supabaseUser.email} 
          editable={false}
          placeholder={t(PERSONAL_INFO.EMAIL_PLACEHOLDER)} 
          placeholderTextColor={theme.colors.textSecondary} 
        />
      </View>
      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]} onPress={handleSave} disabled={saving}>
        <Text style={[styles.saveBtnText, { color: "#18181B" }]}> 
          {saving ? t(PERSONAL_INFO.SAVING) : t(PERSONAL_INFO.SAVE)}
        </Text>
      </TouchableOpacity>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
  },
  inputSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  saveBtn: {
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    marginTop: 16,
  },
  saveBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 