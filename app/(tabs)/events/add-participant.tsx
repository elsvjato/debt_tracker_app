import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useContacts } from '../../../contexts/ContactContext';
import { useEvents } from '../../../contexts/EventContext';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';

export default function AddParticipantScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { events, updateEvent } = useEvents();
  const { contacts, refreshContacts } = useContacts();
  const { user, loading: userLoading } = useSupabaseAuth();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  
  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);

  // Refresh contacts when screen focuses
  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  // Формуємо масив контактів без user (тільки по email)
  const contactsWithoutUser = useMemo(() => contacts.filter(c => c.email !== user?.email), [contacts, user?.email]);
  const sortedContacts = useMemo(() => [...contactsWithoutUser].sort((a, b) => (a.name || '').localeCompare(b.name || '')), [contactsWithoutUser]);
  
  // Вставляємо user першим
  const participantsList = useMemo(() => [
    {
      id: user?.id,
      user_id: user?.id,
      name: user?.user_metadata?.name || user?.name || '',
      email: user?.email || '',
      avatar: user?.user_metadata?.avatar || user?.avatar,
      favorite: true,
      isSelf: true,
    },
    ...sortedContacts
  ], [user, sortedContacts]);

  // Return filtering of existing participants
  const existingParticipantIds = useMemo(
    () => new Set(event?.participants?.map(p => p.id) || []),
    [event?.participants]
  );

  const existingParticipantEmails = useMemo(
    () => new Set(event?.participants?.map(p => p.email) || []),
    [event?.participants]
  );
  
  const availableContacts = useMemo(
    () => participantsList.filter(p => {
      // For user contact, check by email
      if (p.id === user?.id) {
        return !existingParticipantEmails.has(p.email);
      }
      // For other contacts, check by ID
      return !existingParticipantIds.has(p.id);
    }),
    [participantsList, existingParticipantIds, existingParticipantEmails, user?.id]
  );

  const filteredContacts = useMemo(() => {
    const filtered = availableContacts.filter(c => {
      if (tab === 'favorites' && !c.favorite) return false;
      if (
        search.trim() &&
        !c.name.toLowerCase().includes(search.toLowerCase()) &&
        !(c.email || '').toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
    return filtered;
  }, [availableContacts, tab, search]);

  const toggleSelection = (contactId: string) => {
    setSelected(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSave = () => {
    if (!event) return;
    
    const newParticipants = participantsList.filter(c => selected.includes(c.id));

    if (newParticipants.length > 0) {
      updateEvent({
        ...event,
        participants: [...event.participants, ...newParticipants],
      });
    }
    router.back();
  };

  if (userLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Event not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Participants</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {selected.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedAvatarsContainer}>
            {selected.map(id => {
              const c = participantsList.find(p => p.id === id);
              if (!c) return null;
              return (
                <TouchableOpacity key={id} onPress={() => toggleSelection(id)}>
                  {c.avatar ? (
                    <Image source={{ uri: c.avatar }} style={styles.selectedAvatar} />
                  ) : (
                    <View style={styles.selectedAvatarPlaceholder}>
                      <Text style={styles.selectedAvatarText}>{c.name ? c.name[0].toUpperCase() : '?'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        <View style={styles.controlsContainer}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'all' && styles.tabBtnActive]}
              onPress={() => setTab('all')}
            >
              <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>All Contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'favorites' && styles.tabBtnActive]}
              onPress={() => setTab('favorites')}
            >
              <Text style={[styles.tabText, tab === 'favorites' && styles.tabTextActive]}>Favorites</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search contact"
              placeholderTextColor="#888"
            />
          </View>
        </View>
        {filteredContacts.map(c => {
          if (!c || !c.id) return null;
          const isSelected = selected.includes(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.contactRow, isSelected && styles.contactRowSelected]}
              onPress={() => toggleSelection(c.id)}
              activeOpacity={0.8}
            >
              {c.avatar ? (
                <Image source={{ uri: c.avatar }} style={styles.contactAvatar} />
              ) : (
                <View style={styles.contactAvatarPlaceholder}>
                  <Text style={styles.contactAvatarText}>{c.name ? c.name[0].toUpperCase() : '?'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>
                  {c.name}{c.id === user?.id ? <Text style={{ color: '#FFC107' }}> (You)</Text> : null}
                </Text>
                <Text style={styles.contactEmail}>{c.email}</Text>
              </View>
              {isSelected && <Ionicons name="checkmark-circle" size={24} color="#FFC107" />}
            </TouchableOpacity>
          );
        })}
        {filteredContacts.length === 0 && (
          <Text style={styles.noContactsText}>No contacts to add</Text>
        )}
      </ScrollView>
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, selected.length === 0 && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={selected.length === 0}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 40,
  },
  backLink: {
    color: '#FFC107',
    textAlign: 'center',
    marginTop: 16,
  },
  selectedAvatarsContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  selectedAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 4,
  },
  selectedAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 4,
    backgroundColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    paddingHorizontal: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2f',
    marginBottom: 12,
  },
  tabBtn: {
    paddingBottom: 12,
    marginHorizontal: 24,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFC107',
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#FFC107',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232323',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  contactRowSelected: {
    backgroundColor: '#27272a',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactEmail: {
    color: '#888',
    fontSize: 14,
  },
  noContactsText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 40, 
    backgroundColor: '#18181b',
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#FFC107',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#444',
  },
  saveBtnText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});