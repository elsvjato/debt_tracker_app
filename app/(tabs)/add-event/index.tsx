import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContacts } from '../../../contexts/ContactContext';
import { useEvents } from '../../../contexts/EventContext';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { ADD_EVENT, GROUP_CATEGORIES, GROUP_CATEGORY_EMOJIS } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';

const currencies = [
  { key: 'USD', label: 'USD ($)' },
  { key: 'EUR', label: 'EUR (€)' },
  { key: 'PLN', label: 'PLN (zł)' },
  { key: 'UAH', label: 'UAH (₴)' },
  { key: 'other', label: 'Other' },
];

// Categories for iteration
const GROUP_CATEGORIES_LIST = [
  { key: 'trip', label: 'Trip', emoji: '✈️' },
  { key: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { key: 'couple', label: 'Couple', emoji: '💑' },
  { key: 'event', label: 'Event', emoji: '🎬' },
  { key: 'project', label: 'Project', emoji: '💼' },
  { key: 'other', label: 'Other', emoji: '☘️' },
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AddEventScreen() {
  // All hooks must be called unconditionally at the top
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  // Call context hooks unconditionally
  const { contacts } = useContacts();
  const { addEvent } = useEvents();
  const { user } = useSupabaseAuth();
  
  // Safe data validation - handle context errors after hooks are called
  const userContacts = contacts || [];

  // Step 1: Event data
  const [image_uri, setImage_uri] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customCurrency, setCustomCurrency] = useState('');
  const [category, setCategory] = useState('trip');
  const [step, setStep] = useState(1);

  // Step 2: Participants
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [selected, setSelected] = useState<string[]>([]);

  // Add current user to the beginning of the list if not already present
  const userContact = useMemo(() => ({
    id: userContacts[0]?.id || '',
    user_id: userContacts[0]?.id || '',
    name: userContacts[0]?.name || '',
    email: userContacts[0]?.email || '',
    avatar: userContacts[0]?.avatar,
    favorite: true,
  }), [userContacts]);

  // Формуємо масив контактів без user (тільки по email)
  const contactsWithoutUser = userContacts.filter(c => c.email !== user?.email);
  const sortedContacts = [...contactsWithoutUser].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  // Вставляємо user першим
  const participantsList = [
    {
      id: user?.id,
      user_id: user?.id,
      name: user?.user_metadata?.name || user?.name || '',
      email: user?.email || '',
      avatar: user?.user_metadata?.avatar || user?.avatar,
      favorite: true,
      isSelf: true,
    },
    ...sortedContacts
  ];

  const filteredContacts = useMemo(() => {
    const filtered = participantsList.filter(c => {
      if (tab === 'favorites' && !c.favorite) return false;
      if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    // Sort contacts: current user first, then others alphabetically
    return filtered.sort((a, b) => {
      // Current user always comes first
      if (a.id === user?.id) return -1;
      if (b.id === user?.id) return 1;
      
      // Other contacts sorted alphabetically by name
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [participantsList, tab, search, user?.id]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(ADD_EVENT.PERMISSION_REQUIRED), t(ADD_EVENT.PERMISSION_MESSAGE));
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

  const handleContinue = () => {
    if (!title.trim()) {
      Alert.alert('Error', t(ADD_EVENT.ERROR_TITLE_REQUIRED));
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', t(ADD_EVENT.ERROR_DESCRIPTION_REQUIRED));
      return;
    }
    if (currency === 'other' && !customCurrency.trim()) {
      Alert.alert('Error', t(ADD_EVENT.ERROR_CURRENCY_REQUIRED));
      return;
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      Alert.alert('Error', t(ADD_EVENT.ERROR_PARTICIPANTS_REQUIRED));
      return;
    }
    
    // Get selected participants as Contact objects
    const selectedParticipants = participantsList.filter(c => selected.includes(c.id));
    
    await addEvent({
      title: title.trim(),
      description: description.trim(),
      currency: currency === 'other' ? customCurrency.trim() : currency,
      category,
      emoji: GROUP_CATEGORY_EMOJIS[category.toUpperCase() as keyof typeof GROUP_CATEGORY_EMOJIS] || GROUP_CATEGORY_EMOJIS.OTHER,
      image_uri,
    }, selectedParticipants);
    
    // Reset all states after creating group
    setImage_uri(undefined);
    setTitle('');
    setDescription('');
    setCurrency('USD');
    setCustomCurrency('');
    setCategory('trip');
    setStep(1);
    setSearch('');
    setTab('all');
    setSelected([]);
    
    // Add a small delay to ensure state is updated before navigation
    setTimeout(() => {
    router.replace('/events');
    }, 100);
  };

  // Step 1: Event data
  if (step === 1) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(ADD_EVENT.TITLE)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.imageUpload, { backgroundColor: colors.surface, borderColor: colors.surface }]} 
            onPress={handlePickImage} 
            activeOpacity={0.8}
          >
            {image_uri ? (
              <Image source={{ uri: image_uri }} style={styles.coverImage} />
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={32} color={colors.textSecondary} />
                <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>{t(ADD_EVENT.UPLOAD_COVER_IMAGE)}</Text>
              </>
            )}
            {image_uri && (
              <TouchableOpacity style={[styles.editImageBtn, { backgroundColor: colors.primary, borderColor: colors.background }]} onPress={handlePickImage}>
                <Ionicons name="pencil" size={18} color="#18181B" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.textTertiary }]}>{t(ADD_EVENT.TITLE_LABEL)}</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} 
              value={title} 
              onChangeText={setTitle} 
              placeholder={t(ADD_EVENT.TITLE_PLACEHOLDER)} 
              placeholderTextColor={colors.textTertiary} 
            />
            <Text style={[styles.label, { color: colors.textTertiary }]}>{t(ADD_EVENT.DESCRIPTION_LABEL)}</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} 
              value={description} 
              onChangeText={setDescription} 
              placeholder={t(ADD_EVENT.DESCRIPTION_PLACEHOLDER)} 
              placeholderTextColor={colors.textTertiary} 
            />
            <Text style={[styles.label, { color: colors.textTertiary }]}>{t(ADD_EVENT.CURRENCY_LABEL)}</Text>
            <View style={styles.dropdownWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currencies.map(cur => (
                  <TouchableOpacity
                    key={cur.key}
                    style={[
                      styles.currencyBtn, 
                      { backgroundColor: colors.inputBackground },
                      currency === cur.key && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setCurrency(cur.key)}
                  >
                    <Text style={[
                      styles.currencyText, 
                      { color: colors.textTertiary },
                      currency === cur.key && { color: colors.background, fontWeight: 'bold' }
                    ]}>
                      {cur.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            {currency === 'other' && (
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} 
                value={customCurrency} 
                onChangeText={setCustomCurrency} 
                placeholder={t(ADD_EVENT.CURRENCY_PLACEHOLDER)} 
                placeholderTextColor={colors.textTertiary} 
              />
            )}
            <Text style={[styles.label, { color: colors.textTertiary }]}>{t(ADD_EVENT.CATEGORY_LABEL)}</Text>
            <View style={styles.categoryRow}>
              {GROUP_CATEGORIES_LIST.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryBtn, 
                    { backgroundColor: colors.inputBackground },
                    category === cat.key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setCategory(cat.key)}
                >
                  <Text style={[
                    styles.categoryText, 
                    { color: colors.textTertiary },
                    category === cat.key && { color: colors.background, fontWeight: 'bold' }
                  ]}>
                    {t(GROUP_CATEGORIES[cat.key.toUpperCase() as keyof typeof GROUP_CATEGORIES] || GROUP_CATEGORIES.OTHER)} {GROUP_CATEGORY_EMOJIS[cat.key.toUpperCase() as keyof typeof GROUP_CATEGORY_EMOJIS]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={[styles.bottomRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: colors.surface }]} 
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t(ADD_EVENT.CANCEL)}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.continueBtn, { backgroundColor: colors.primary }]} 
            onPress={handleContinue}
          >
            <Text style={[styles.continueBtnText, { color: colors.background }]}>{t(ADD_EVENT.CONTINUE)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Select participants
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(ADD_EVENT.SELECT_PARTICIPANTS)}</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Selected avatars (compact, above tabs) */}
        {selected.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, minHeight: 56 }}>
            {selected.map((id, idx) => {
              const c = participantsList.find(c => c.id === id);
              if (!c) return null;
              return (
                <TouchableOpacity key={id || idx} onPress={() => setSelected(sel => sel.filter(x => x !== id))}>
                  {c.avatar ? (
                    <Image source={{ uri: c.avatar }} style={styles.selectedAvatarRow} />
                  ) : (
                    <View style={[styles.selectedAvatarRow, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}>
                      {c.name && c.name.length > 0 ? (
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: 'bold' }}>{c.name[0].toUpperCase()}</Text>
                      ) : (
                        <Ionicons name="person" size={22} color={colors.textTertiary} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        {/* Tabs */}
        <View style={[styles.tabsRow, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'all' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab('all')}
          >
            <Text style={[styles.tabText, { color: colors.textTertiary }, tab === 'all' && { color: colors.primary, fontWeight: 'bold' }]}>
              {t(ADD_EVENT.ALL_CONTACTS)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'favorites' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab('favorites')}
          >
            <Text style={[styles.tabText, { color: colors.textTertiary }, tab === 'favorites' && { color: colors.primary, fontWeight: 'bold' }]}>
              {t(ADD_EVENT.FAVORITES)}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Search */}
        <View style={[styles.searchRowEnhanced, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={colors.textTertiary} style={{ marginLeft: 8, marginRight: 4 }} />
          <TextInput
            style={[styles.searchInputEnhanced, { color: colors.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder={t(ADD_EVENT.SEARCH_CONTACT)}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        {/* Contact list */}
        {filteredContacts.map((c, idx) => (
          <TouchableOpacity
            key={c.id || idx}
            style={[styles.contactRow, { borderBottomColor: colors.border }]}
            onPress={() => setSelected(sel => (sel.includes(c.id) ? sel.filter(x => x !== c.id) : [...sel, c.id]))}
            activeOpacity={0.85}
          >
            {c.avatar ? (
              <Image source={{ uri: c.avatar }} style={styles.contactAvatar} />
            ) : (
              <View style={[styles.contactAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}>
                {c.name && c.name.length > 0 ? (
                  <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }}>{c.name[0].toUpperCase()}</Text>
                ) : (
                  <Ionicons name="person" size={22} color={colors.textTertiary} />
                )}
              </View>
            )}
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.contactName, { color: colors.textPrimary }]}>{c.name}</Text>
                {c.id === user?.id && <Text style={[styles.youTag, { color: colors.primary }]}>{t(ADD_EVENT.YOU_TAG)}</Text>}
              </View>
              <Text style={[styles.contactEmail, { color: colors.textTertiary }]}>{c.email}</Text>
            </View>
            {selected.includes(c.id) && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
          </TouchableOpacity>
        ))}
        {filteredContacts.length === 0 && (
          <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 32 }}>{t(ADD_EVENT.NO_CONTACTS_FOUND)}</Text>
        )}
      </ScrollView>
      {/* Bottom buttons */}
      <View style={[styles.bottomRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.cancelBtn, { backgroundColor: colors.surface }]} 
          onPress={() => setStep(1)}
        >
          <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t(ADD_EVENT.CANCEL)}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.continueBtn, { backgroundColor: colors.primary }]} 
          onPress={handleSave}
        >
          <Text style={[styles.continueBtnText, { color: colors.background }]}>{t(ADD_EVENT.SAVE)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  imageUpload: {
    backgroundColor: '#23232a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 18,
    height: 120,
    borderWidth: 1.5,
    borderColor: '#23232a',
    borderStyle: 'dashed',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  imageUploadText: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  editImageBtn: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    backgroundColor: '#FFC107',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#18181b',
    zIndex: 2,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  dropdownWrap: {
    marginBottom: 24,
  },
  currencyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  currencyText: {
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 6,
  },
  categoryText: {
    fontSize: 16,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedAvatarRow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
  },
  searchRowEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  searchInputEnhanced: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contactName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  contactEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  youTag: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
}); 