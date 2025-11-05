import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function AddContact() {
  const router = useRouter();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
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

  const handleAdd = () => {
    Keyboard.dismiss();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Add New Contact</Text>
        <View style={{ width: 26 }} />
      </View>
      <View style={styles.form}>
        <TouchableOpacity style={styles.avatarPicker} onPress={handlePickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person-circle" size={72} color={colors.textTertiary} />
          )}
          <View style={[styles.avatarEditIcon, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Ionicons name="camera" size={20} color={colors.background} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.label, { color: colors.textTertiary }]}>Account Holder Name</Text>
        <TextInput
          style={[
            styles.input, 
            { backgroundColor: colors.inputBackground, color: colors.textPrimary },
            error && !name.trim() && { borderColor: '#ff4444', borderWidth: 1 }
          ]}
          placeholder="Name"
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
        />
        <Text style={[styles.label, { color: colors.textTertiary }]}>Email</Text>
        <View style={[styles.inputIconRow, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={{ marginLeft: 8, marginRight: 8 }} />
          <TextInput
            style={[
              styles.input, 
              { flex: 1, borderWidth: 0, backgroundColor: 'transparent', color: colors.textPrimary },
              error && (!email.trim() || !email.includes('@')) && { borderColor: '#ff4444', borderWidth: 1 }
            ]}
            placeholder="Email"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.cancelBtn, { borderColor: colors.primary }]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.addBtn, 
            { backgroundColor: colors.primary },
            (!name.trim() || !email.trim() || loading) && { opacity: 0.5 }
          ]}
          onPress={handleAdd}
          disabled={!name.trim() || !email.trim() || loading}
        >
          <Text style={[styles.addBtnText, { color: colors.background }]}>
            {loading ? 'Adding...' : 'Add Contact'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  avatarEditIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
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
    borderRadius: 12,
    marginBottom: 4,
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
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  addBtn: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 12,
  },
  addBtnText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
}); 