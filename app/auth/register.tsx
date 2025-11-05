import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { strings } from '../../i18n/strings';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

export default function Register() {
  const router = useRouter();
  const { register } = useSupabaseAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
  const shakeAnimRef = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.95)).current;

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError(t(strings.required));
      shakeForm();
      return;
    }

    if (password !== confirmPassword) {
      setError(t(strings.passwordsDoNotMatch));
      shakeForm();
      return;
    }

    if (password.length < 6) {
      setError(t(strings.passwordTooShort));
      shakeForm();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await register(email, password, name);
      console.log('Register result:', { error });
      if (error) {
        setError(error);
        shakeForm();
      } else {
        // Show email confirmation info screen
        setError(''); // Clear previous errors
        router.replace('/auth/email-confirmation');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || t(strings.error));
      shakeForm();
    } finally {
      setIsLoading(false);
    }
  };

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
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

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <StatusBar style="light" />
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingModal, { backgroundColor: colors.cardBackground }]}> 
            <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>{t(strings.loading)}</Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>{t('creatingAccount')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('createAccount')}</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{t('fillDetails')}</Text>
        <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}> 
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="person-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder={t(strings.firstName)}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="mail-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
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
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder={t(strings.password)}
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}> 
            <Ionicons name="lock-closed-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder={t(strings.confirmPassword)}
              placeholderTextColor={colors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>{t(strings.signUp)}</Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>{t('alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>{t(strings.signIn)}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
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
  errorContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
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