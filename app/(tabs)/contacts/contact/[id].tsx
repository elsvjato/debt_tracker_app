import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../../contexts/SupabaseDataContext';
import { CONTACT_DETAILS } from '../../../../i18n/strings';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useTheme } from '../../../../theme/useTheme';
import { deletePhoto } from '../../../../utils/uploadPhoto';



export default function ContactDetails() {
  console.log('🔥🔥🔥 CONTACT DETAILS COMPONENT RENDERED 🔥🔥🔥');
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { contacts, updateContact, deleteContact } = useSupabaseData();
  const { t } = useTranslation();
  const contact = contacts.find(c => String(c.id) === String(id));
  const { colors } = useTheme();
  const { user } = useSupabaseAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  // Log when showDelete changes
  useEffect(() => {
    console.log('🔥🔥🔥 SHOW DELETE MODAL CHANGED:', showDelete);
  }, [showDelete]);
  const [edit, setEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(contact?.name || '');
  const [email, setEmail] = useState(contact?.email || '');
  const [favorite, setFavorite] = useState(contact?.favorite || false);

  console.log('ContactDetails (app/(tabs)/contacts/contact/[id].tsx): id from router', id);
  console.log('ContactDetails (app/(tabs)/contacts/contact/[id].tsx): contacts', contacts);
  console.log('ContactDetails (app/(tabs)/contacts/contact/[id].tsx): found contact', contact);

  useEffect(() => {
    if (contact?.avatar) {
      setLoading(true);
      // Використовуємо аватарку напряму (як в івентах)
      setAvatarUrl(contact.avatar);
      setLoading(false);
      console.log('ContactDetails: using avatar directly', contact.avatar);
    } else {
      setAvatarUrl(undefined);
      setLoading(false);
    }
  }, [contact?.avatar]);

  if (!contact) {
    return (
      <View style={styles.container}><Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>{t(CONTACT_DETAILS.CONTACT_NOT_FOUND)}</Text></View>
    );
  }

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(CONTACT_DETAILS.PERMISSION_REQUIRED), t(CONTACT_DETAILS.PERMISSION_MESSAGE));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    if (!email.includes('@')) {
      setError('Invalid email');
      return;
    }
    try {
      // Як в івентах - передаємо avatarUrl напряму, тільки якщо змінилося
      const newAvatarUrl = avatarUrl !== contact.avatar ? avatarUrl : contact.avatar;
      updateContact(contact.id, { name: name.trim(), email: email.trim(), avatar: newAvatarUrl, favorite });
      setEdit(false);
      setError(null);
    } catch (e) {
      setError('Error saving contact');
    }
  };

  const handleDelete = async () => {
    console.log('🔥🔥🔥 DELETE CONTACT STARTED 🔥🔥🔥', contact.id);
    setShowDelete(false);
    
    if (contact.avatar && user?.id) {
      const fileName = `contact_${contact.id}.jpg`;
      try {
        await deletePhoto(user.id, fileName);
        console.log('🔥 Photo deleted successfully');
      } catch (e) {
        console.log('🔥 Photo delete error (ignoring):', e);
      }
    }
    
    try {
      console.log('🔥 Calling deleteContact function...');
      await deleteContact(contact.id);
      console.log('🔥🔥🔥 CONTACT DELETED SUCCESSFULLY 🔥🔥🔥');
      router.replace('/(tabs)/contacts');
    } catch (error) {
      console.error('🔥🔥🔥 DELETE CONTACT ERROR 🔥🔥🔥', error);
      Alert.alert('Error', 'Failed to delete contact. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t(CONTACT_DETAILS.TITLE)}</Text>
        <TouchableOpacity onPress={() => setFavorite(f => !f)}>
          <Ionicons name={favorite ? 'star' : 'star-outline'} size={26} color={favorite ? '#FFC107' : '#aaa'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.avatarPicker} onPress={edit ? handlePickImage : undefined} activeOpacity={edit ? 0.7 : 1}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person-circle" size={96} color="#aaa" />
        )}
        {edit && (
          <View style={styles.avatarEditIcon}>
            <Ionicons name="camera" size={22} color="#18181b" />
          </View>
        )}
      </TouchableOpacity>
      {edit ? (
        <>
          <TextInput
            style={[styles.input, error && !name.trim() && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder={t(CONTACT_DETAILS.NAME_PLACEHOLDER)}
            placeholderTextColor="#aaa"
          />
          <View style={styles.inputIconRow}>
            <Ionicons name="mail-outline" size={20} color="#aaa" style={{ marginLeft: 8, marginRight: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }, error && (!email.trim() || !email.includes('@')) && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              placeholder={t(CONTACT_DETAILS.EMAIL_PLACEHOLDER)}
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEdit(false)}>
              <Text style={styles.cancelBtnText}>{t(CONTACT_DETAILS.CANCEL)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleSave}>
              <Text style={styles.addBtnText}>{t(CONTACT_DETAILS.SAVE)}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactEmail}>{contact.email}</Text>
          <Text style={styles.contactLabel}>{t(CONTACT_DETAILS.SPLITTER_ACCOUNT)}</Text>
          <TouchableOpacity 
            style={styles.deleteBtn} 
            onPress={() => {
              console.log('🔥🔥🔥 DELETE BUTTON PRESSED 🔥🔥🔥');
              Alert.alert('Test', 'Delete button pressed!');
              setShowDelete(true);
            }}
          >
            <Text style={styles.deleteBtnText}>{t(CONTACT_DETAILS.DELETE_CONTACT)}</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEdit(true)}>
              <Text style={styles.cancelBtnText}>{t(CONTACT_DETAILS.EDIT)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {showDelete && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{t(CONTACT_DETAILS.DELETE_CONTACT_TITLE)}</Text>
            <Text style={styles.modalText}>{t(CONTACT_DETAILS.DELETE_CONTACT_MESSAGE).replace('{name}', contact.name)}</Text>
            <View style={styles.modalActionsNew}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowDelete(false)}>
                <Text style={styles.modalBtnTextSecondary}>{t(CONTACT_DETAILS.CANCEL)}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnPrimary} 
                onPress={() => {
                  console.log('🔥🔥🔥 CONFIRM DELETE BUTTON PRESSED 🔥🔥🔥');
                  handleDelete();
                }}
              >
                <Text style={styles.modalBtnTextPrimary}>{t(CONTACT_DETAILS.YES_DELETE)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#18181b', paddingHorizontal: 0, paddingTop: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 22,
    letterSpacing: 0.2,
  },
  avatarPicker: { alignSelf: 'center', marginBottom: 16, position: 'relative' },
  avatarImg: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#23232a' },
  avatarEditIcon: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#FFC107', borderRadius: 16, padding: 4, borderWidth: 2, borderColor: '#18181b' },
  input: { backgroundColor: '#23232a', color: '#fff', fontSize: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 4, borderWidth: 0, marginHorizontal: 24 },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23232a', borderRadius: 12, marginBottom: 4, marginHorizontal: 24 },
  inputError: { borderColor: '#ff4444', borderWidth: 1 },
  errorText: { color: '#ff4444', marginTop: 8, marginBottom: 4, marginLeft: 28 },
  contactName: { color: '#fff', fontWeight: 'bold', fontSize: 22, textAlign: 'center', marginTop: 8 },
  contactEmail: { color: '#aaa', fontSize: 16, textAlign: 'center', marginBottom: 4 },
  contactLabel: { color: '#aaa', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  cancelBtn: { flex: 1, borderColor: '#FFC107', borderWidth: 2, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginHorizontal: 12, backgroundColor: 'transparent' },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  addBtn: { flex: 1, backgroundColor: '#FFC107', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginHorizontal: 12 },
  addBtnText: { color: '#18181b', fontWeight: 'bold', fontSize: 17 },
  deleteBtn: { alignSelf: 'center', borderColor: '#ff4444', borderWidth: 2, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32, marginTop: 24, marginBottom: 8 },
  deleteBtnText: { color: '#ff4444', fontWeight: 'bold', fontSize: 17 },
  
  // Modal Styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalView: {
    backgroundColor: '#23232a',
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 22,
    textAlign: 'center',
  },
  modalActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  modalBtnPrimary: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    borderWidth: 2,
    borderColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnTextSecondary: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 