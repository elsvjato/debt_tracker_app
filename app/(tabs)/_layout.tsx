import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactProvider } from '../../contexts/ContactContext';
import { EventProvider } from '../../contexts/EventContext';
import { ExpenseProvider } from '../../contexts/ExpenseContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useTheme } from '../../theme/useTheme';

export default function TabLayout() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, router]);
  
  // If no user, render a minimal layout to avoid hook count issues
  if (!user) {
    return null;
  }
  
  return (
    <ContactProvider>
      <EventProvider>
        <ExpenseProvider>
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
                tabBarStyle: {
                  backgroundColor: colors.surface,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingBottom: 8,
                  marginBottom: insets.bottom,
                  paddingTop: 8,
                  height: 60,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: -2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 8,
                },
                tabBarLabelStyle: {
                  fontSize: 11,
                  fontWeight: '600',
                  marginTop: 2,
                },
                tabBarIconStyle: {
                  marginBottom: 2,
                },
                headerShown: false,
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: 'Home',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="events"
                options={{
                  title: 'Groups',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="calendar" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="add-event"
                options={{
                  title: 'Add',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="add-circle" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="contacts"
                options={{
                  title: 'Contacts',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="people" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="profile"
                options={{
                  title: 'Profile',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" size={size} color={color} />
                  ),
                  href: '/profile',
                }}
              />
            </Tabs>
          </ExpenseProvider>
        </EventProvider>
      </ContactProvider>
  );
} 