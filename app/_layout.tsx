import { Stack } from 'expo-router';
import React from 'react';
import { SupabaseAuthProvider, useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { SupabaseDataProvider } from '../contexts/SupabaseDataContext';
import { SettingsProvider } from '../theme/SettingsContext';

function DebugRenderLogger({ label }: { label: string }) {
  React.useEffect(() => {
    console.log(`[DebugRenderLogger] Mounted: ${label}`);
    return () => {
      console.log(`[DebugRenderLogger] Unmounted: ${label}`);
    };
  }, []);
  console.log(`[DebugRenderLogger] Render: ${label}`);
  return null;
}

function RootLayoutInner() {
  const { user, loading } = useSupabaseAuth();

  if (loading) return null;

  if (!user) {
    return (
      <>
        <DebugRenderLogger label="RootLayoutInner" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
        </Stack>
      </>
    );
  }

  return (
    <>
      <DebugRenderLogger label="RootLayoutInner" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SupabaseAuthProvider>
        <SupabaseDataProvider>
          <RootLayoutInner />
        </SupabaseDataProvider>
      </SupabaseAuthProvider>
    </SettingsProvider>
  );
} 