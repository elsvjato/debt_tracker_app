import { useRouter } from 'expo-router';
import { StatusBar, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { globalStyles } from '../../theme/styles';
import { darkTheme } from '../../theme/theme';
import { useTheme } from '../../theme/useTheme';

export default function EmailConfirmationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme === darkTheme;
  const { colors } = theme;

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={{ width: '100%', maxWidth: 400, alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12, textAlign: 'center' }}>
          Check your email
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32, textAlign: 'center' }}>
          We have sent a confirmation link to your email address. Please follow the link in the email to activate your account.
        </Text>
        <Button
          title="Back to Login"
          onPress={() => router.replace('/auth/login')}
          fullWidth
        />
      </View>
    </View>
  );
} 