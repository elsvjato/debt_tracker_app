import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../config/supabaseClient';
import { useTheme } from '../../theme/useTheme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { access_token, refresh_token } = useLocalSearchParams<{ access_token?: string, refresh_token?: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (!access_token || !refresh_token) {
      Alert.alert('Error', 'Invalid or missing token. Please use the link from your email.');
      return;
    }
    setLoading(true);
    // Set the session using the tokens from the link
    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
    if (sessionError) {
      setLoading(false);
      Alert.alert('Error', sessionError.message);
      return;
    }
    // Now update the password
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated! You can now log in.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.textPrimary }]}>Set a new password</Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.inputBackground }]}
        placeholder="New password"
        placeholderTextColor={colors.textTertiary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? 'Saving...' : 'Save Password'} onPress={handleReset} disabled={loading} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', fontSize: 16, borderRadius: 12, padding: 16, marginBottom: 24 },
}); 