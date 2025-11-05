import { Stack } from 'expo-router';

export default function AddEventStackLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}

const styles = {
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
}; 