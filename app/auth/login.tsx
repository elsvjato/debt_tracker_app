import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { strings } from '../../i18n/strings';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.95)).current;
  const router = useRouter();
  const { login } = useSupabaseAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  };

  const showOverlay = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(overlayScale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }),
    ]).start();
  };
  const hideOverlay = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(overlayScale, { toValue: 0.95, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');
    setLoading(true);
    showOverlay();
    const { error } = await login(email, password);
    setTimeout(() => {
      setLoading(false);
      hideOverlay();
      if (!error) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 250);
      } else {
        setError(t('incorrectCredentials'));
        triggerShake();
      }
    }, 1200);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingModal, { backgroundColor: colors.cardBackground }]}> 
            <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>{t(strings.loading)}</Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>{t('signingIn')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('welcomeBack')} <Text style={{fontSize: 28}}>👋</Text></Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{t('enterCredentials')}</Text>
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}> 
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="mail-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }, error && { borderColor: '#ff4444', borderWidth: 1 }]}
              placeholder={t(strings.email)}
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }, error && { borderColor: '#ff4444', borderWidth: 1 }]}
              placeholder={t(strings.password)}
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.row}>
            <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>{t(strings.forgotPassword)}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>{t(strings.signIn)}</Text>
          </TouchableOpacity>
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>{t('dontHaveAccount')} </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>{t(strings.signUp)}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      <Animated.View pointerEvents={loading ? 'auto' : 'none'} style={[styles.loadingOverlay, { opacity: overlayOpacity }]}> 
        <Animated.View style={[styles.loadingModal, { backgroundColor: colors.cardBackground, transform: [{ scale: overlayScale }] }]}> 
          <Ionicons name="person-circle" size={64} color={colors.primary} style={{marginBottom: 12}} />
          <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>{t('signInSuccessful')}</Text>
          <Text style={[styles.loadingSubtitle, { color: colors.textTertiary }]}>{t('pleaseWaitRedirect')}</Text>
          <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 16}} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 16,
  },
  button: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingModal: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 