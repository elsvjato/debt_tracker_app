import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEvents } from '../../../contexts/EventContext';
import { EVENTS } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';
import EventTile from '../../../utils/EventTile';

export default function EventsScreen() {
  // All hooks must be called unconditionally at the top
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { events, loading } = useEvents();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Safe data validation - handle context errors after hooks are called
  const safeEvents = events && Array.isArray(events) ? events : [];
  
  console.log('EventsScreen: events count:', safeEvents.length, 'loading:', loading);

  // Filter events by search query
  const processedEvents = safeEvents.filter(event => {
    if (!event || typeof event !== 'object' || !event.title) return false;
    
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    return event.title.toLowerCase().includes(query);
  });

  const renderEvent = ({ item }: { item: import('../../../contexts/EventContext').Event }) => {
    return (
      <EventTile 
        event={item} 
        onPress={() => router.push(`/events/${item.id}`)} 
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(EVENTS.TITLE)}</Text>
      </View>
      
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t(EVENTS.SEARCH_PLACEHOLDER)}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={processedEvents.filter(e => e && typeof e === 'object' && e.title && Array.isArray(e.participants) && e.id)}
        renderItem={renderEvent}
        keyExtractor={item => (item && item.id ? String(item.id) : Math.random().toString())}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="event" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyStateText, { color: colors.textPrimary }]}>{t(EVENTS.NO_EVENTS)}</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>{t(EVENTS.NO_EVENTS_SUBTEXT)}</Text>
          </View>
        }
      />
      
      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]} 
        onPress={() => router.push('/add-event')} 
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    marginTop: 8,
  },
}); 