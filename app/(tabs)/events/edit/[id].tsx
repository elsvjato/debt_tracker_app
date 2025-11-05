import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEvents } from '../../../../contexts/EventContext';
import { EDIT_EVENT, GROUP_CATEGORIES, GROUP_CATEGORY_EMOJIS } from '../../../../i18n/strings';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useTheme } from '../../../../theme/useTheme';
import { uploadPhoto } from '../../../../utils/uploadPhoto';

const categories = [
  { key: 'trip', label: 'Trip', emoji: '✈️' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { key: 'couple', label: 'Couple', emoji: '💑' },
  { key: 'event', label: 'Event', emoji: '🎬' },
  { key: 'project', label: 'Project', emoji: '💼' },
  { key: 'other', label: 'Other', emoji: '☘️' },
];
const currencies = [
  { key: 'USD', label: 'USD ($)' },
  { key: 'EUR', label: 'EUR (€)' },
  { key: 'PLN', label: 'PLN (zł)' },
  { key: 'UAH', label: 'UAH (₴)' },
  { key: 'other', label: 'Other' },
];

export default function EditEventScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { events, updateEvent } = useEvents();
  const { id } = useLocalSearchParams<{ id: string }>();

  const event = events.find(e => e.id === id);

  const [image_uri, setImage_uri] = useState<string | undefined>(event?.image_uri);
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [currency, setCurrency] = useState(event?.currency || 'USD');
  const [customCurrency, setCustomCurrency] = useState(event && !['USD','EUR','PLN','UAH'].includes(event.currency) ? event.currency : '');
  const [category, setCategory] = useState(event?.category || 'trip');
  const [saving, setSaving] = useState(false);

  if (!event) {
    return <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.errorText, { color: colors.textPrimary }]}>Group not found</Text>
    </View>;
  }

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(EDIT_EVENT.PERMISSION_REQUIRED), t(EDIT_EVENT.PERMISSION_MESSAGE));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage_uri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t(EDIT_EVENT.ERROR), t(EDIT_EVENT.TITLE_REQUIRED));
      return;
    }
    if (!description.trim()) {
      Alert.alert(t(EDIT_EVENT.ERROR), t(EDIT_EVENT.DESCRIPTION_REQUIRED));
      return;
    }
    if (currency === 'other' && !customCurrency.trim()) {
      Alert.alert(t(EDIT_EVENT.ERROR), t(EDIT_EVENT.CURRENCY_REQUIRED));
      return;
    }
    setSaving(true);
    let imageUrl = image_uri;
    try {
      if (image_uri && image_uri !== event.image_uri) {
        const fileName = `event_${event.id}.jpg`;
        imageUrl = await uploadPhoto(image_uri, event.user_id, fileName, 'image/jpeg');
      }
      
      // Create updated event object
      const updatedEvent = {
        ...event,
        title: title.trim(),
        description: description.trim(),
        currency: currency === 'other' ? customCurrency.trim() : currency,
        category,
        emoji: categories.find(c => c.key === category)?.emoji,
        image_uri: imageUrl,
      };
      
      await updateEvent(updatedEvent);
      setSaving(false);
      router.replace(`/events/${event.id}` as any);
    } catch (e) {
      setSaving(false);
      Alert.alert('Помилка завантаження фото');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(EDIT_EVENT.TITLE)}</Text>
        </View>
        <TouchableOpacity style={[styles.imageUpload, { backgroundColor: colors.surface, borderColor: colors.surface }]} onPress={handlePickImage} activeOpacity={0.8}>
          {image_uri ? (
            <Image source={{ uri: image_uri }} style={styles.coverImage} />
          ) : (
            <>
              <MaterialIcons name="cloud-upload" size={32} color={colors.textSecondary} />
              <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>{t(EDIT_EVENT.UPLOAD_IMAGE)}</Text>
            </>
          )}
          {image_uri && (
            <TouchableOpacity style={[styles.editImageBtn, { backgroundColor: colors.primary, borderColor: colors.background }]} onPress={handlePickImage}>
              <Ionicons name="pencil" size={18} color="#18181B" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <View style={styles.formSection}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t(EDIT_EVENT.TITLE_LABEL)}</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]} 
            value={title} 
            onChangeText={setTitle} 
            placeholder={t(EDIT_EVENT.TITLE_PLACEHOLDER)} 
            placeholderTextColor={colors.textSecondary} 
          />
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t(EDIT_EVENT.DESCRIPTION_LABEL)}</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]} 
            value={description} 
            onChangeText={setDescription} 
            placeholder={t(EDIT_EVENT.DESCRIPTION_PLACEHOLDER)} 
            placeholderTextColor={colors.textSecondary} 
          />
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t(EDIT_EVENT.CURRENCY_LABEL)}</Text>
          <View style={styles.dropdownWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currencies.map(cur => (
                <TouchableOpacity
                  key={cur.key}
                  style={[
                    styles.currencyBtn, 
                    { borderColor: colors.surface },
                    currency === cur.key && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setCurrency(cur.key)}
                >
                  <Text style={[
                    styles.currencyText, 
                    { color: colors.textPrimary },
                    currency === cur.key && { color: "#18181B" }
                  ]}>{cur.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {currency === 'other' && (
            <TextInput 
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]} 
              value={customCurrency} 
              onChangeText={setCustomCurrency} 
              placeholder={t(EDIT_EVENT.CURRENCY_PLACEHOLDER)} 
              placeholderTextColor={colors.textSecondary} 
            />
          )}
          <Text style={[styles.label, { color: colors.textPrimary }]}>{t(EDIT_EVENT.CATEGORY_LABEL)}</Text>
          <View style={styles.categoryRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryBtn, 
                  { borderColor: colors.surface },
                  category === cat.key && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[
                  styles.categoryText, 
                  { color: colors.textPrimary },
                  category === cat.key && { color: "#18181B" }
                ]}>{t(GROUP_CATEGORIES[cat.key.toUpperCase() as keyof typeof GROUP_CATEGORIES] || GROUP_CATEGORIES.OTHER)} {GROUP_CATEGORY_EMOJIS[cat.key.toUpperCase() as keyof typeof GROUP_CATEGORY_EMOJIS]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bottomRow}>
        <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.cancelBtnText, { color: colors.primary }]}>{t(EDIT_EVENT.CANCEL)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtnText, { color: "#18181B" }]}>
            {saving ? t(EDIT_EVENT.SAVING) : t(EDIT_EVENT.SAVE)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#18181b', paddingTop: 0 },
  backBtn: { marginTop: 24, marginLeft: 16, marginBottom: 8, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  imageUpload: { backgroundColor: '#23232a', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginBottom: 18, height: 120, borderWidth: 1.5, borderColor: '#23232a', borderStyle: 'dashed', position: 'relative' },
  imageUploadText: { color: '#888', fontSize: 16, marginTop: 8 },
  coverImage: { width: '100%', height: 120, borderRadius: 16, resizeMode: 'cover' },
  editImageBtn: { position: 'absolute', right: 16, bottom: 12, backgroundColor: '#FFC107', borderRadius: 16, padding: 6, borderWidth: 2, borderColor: '#18181b', zIndex: 2 },
  formSection: { marginHorizontal: 24, marginBottom: 12 },
  label: { color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#23232a', color: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 4, fontWeight: '500' },
  dropdownWrap: { flexDirection: 'row', marginBottom: 8 },
  currencyBtn: { backgroundColor: 'transparent', borderRadius: 20, borderWidth: 1.5, borderColor: '#23232a', paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  currencyBtnActive: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  currencyText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  currencyTextActive: { color: '#18181b' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, marginBottom: 8 },
  categoryBtn: { backgroundColor: 'transparent', borderRadius: 20, borderWidth: 1.5, borderColor: '#23232a', paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  categoryBtnActive: { backgroundColor: '#FFC107', borderColor: '#FFC107' },
  categoryText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  categoryTextActive: { color: '#18181b' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginBottom: 24, marginTop: 16 },
  cancelBtn: { borderWidth: 2, borderColor: '#FFC107', borderRadius: 32, paddingVertical: 14, paddingHorizontal: 32 },
  cancelBtnText: { color: '#FFC107', fontWeight: 'bold', fontSize: 17 },
  saveBtn: { backgroundColor: '#FFC107', borderRadius: 32, paddingVertical: 14, paddingHorizontal: 32 },
  saveBtnText: { color: '#18181b', fontWeight: 'bold', fontSize: 17 },
  errorText: { color: '#fff', textAlign: 'center', marginTop: 40 },
}); 