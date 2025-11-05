import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../config/supabaseClient';
import { strings } from '../../i18n/strings';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

export default function ForgotPassword() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError(t(strings.required));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'degreeproject://auth/reset-password'
      });
      if (error) {
        setError(error.message || t(strings.error));
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || t(strings.error));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} style={{marginBottom: 24}} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('resetLinkSent')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('checkEmailInstructions')}</Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary }]} 
            onPress={() => router.push('/auth/login')}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>{t('backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t(strings.forgotPassword)}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('enterEmailReset')}</Text>
        
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="mail-outline" size={20} color={colors.textPrimary} style={{marginRight: 8}} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }, error && styles.inputError]}
            placeholder={t(strings.email)}
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isLoading ? t(strings.loading) : t(strings.resetPassword)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 6,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: -40,
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23232a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#FFC107',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 