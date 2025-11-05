import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContacts } from '../../../../contexts/ContactContext';
import { useSupabaseAuth } from '../../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../../contexts/SupabaseDataContext';
import { ADD_CONTACT } from '../../../../i18n/strings';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useTheme } from '../../../../theme/useTheme';



const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function getMimeType(uri: string) {
  if (uri.endsWith('.png')) return 'image/png';
  if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

export default function AddContact() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { addContact } = useSupabaseData();
  const { refreshContacts } = useContacts();
  const { user } = useSupabaseAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('AddContact ((tabs)/contacts/add-contact/index.tsx) component rendered', { name, email, avatar, user });

  const validate = () => {
    if (!name.trim() || !email.trim()) {
      setError(t(ADD_CONTACT.FILL_ALL_FIELDS));
      return false;
    }
    if (!email.includes('@')) {
      setError(t(ADD_CONTACT.VALID_EMAIL));
      return false;
    }
    setError('');
    return true;
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(ADD_CONTACT.PERMISSION_REQUIRED), t(ADD_CONTACT.PERMISSION_MESSAGE));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    console.log('ImagePicker result:', result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log('Selected image URI:', result.assets[0].uri);
      setAvatar(result.assets[0].uri);
    }
  };

  const handleAdd = async () => {
    console.log('handleAdd: start', { name, email, avatar, user });
    console.log('handleAdd: validate result', validate());
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    try {
      // Як в івентах - передаємо avatar напряму без обробки
      const result = await addContact({
        name: name.trim(),
        email: email.trim(),
        avatar: avatar, // Передаємо напряму, як в івентах
        favorite: false,
      });
      console.log('handleAdd: addContact result:', result);
      
      // Refresh contacts list to ensure all screens get updated data
      await refreshContacts();
      
      router.back();
    } catch (e) {
      console.error('handleAdd: error:', e);
      setError('Помилка додавання контакту: ' + (e as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('addContact.title')}</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.form}>
        <TouchableOpacity style={styles.avatarPicker} onPress={handlePickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person-circle" size={72} color="#aaa" />
          )}
          <View style={styles.avatarEditIcon}>
            <Ionicons name="camera" size={20} color="#18181b" />
          </View>
        </TouchableOpacity>
        <Text style={styles.label}>{t('addContact.accountHolderName')}</Text>
        <TextInput
          style={[styles.input, error && !name.trim() && styles.inputError]}
          placeholder={t('addContact.namePlaceholder')}
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>{t('addContact.email')}</Text>
        <View style={styles.inputIconRow}>
          <Ionicons name="mail-outline" size={20} color="#aaa" style={{ marginLeft: 8, marginRight: 8 }} />
          <TextInput
            style={[styles.input, { flex: 1, borderWidth: 0 }, error && (!email.trim() || !email.includes('@')) && styles.inputError]}
            placeholder={t('addContact.emailPlaceholder')}
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>{t('addContact.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtn, (!name.trim() || !email.trim() || loading) && { opacity: 0.5 }]}
          onPress={handleAdd}
          disabled={!name.trim() || !email.trim() || loading}
        >
          <Text style={styles.addBtnText}>{loading ? t('addContact.adding') : t('addContact.addContact')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
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
  form: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#23232a',
  },
  avatarEditIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFC107',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#18181b',
  },
  label: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#23232a',
    color: '#fff',
    fontSize: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 4,
    borderWidth: 0,
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23232a',
    borderRadius: 12,
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    marginTop: 8,
    marginBottom: 4,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#FFC107',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#FFC107',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 12,
  },
  addBtnText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 