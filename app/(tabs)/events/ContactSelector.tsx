import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Contact, useContacts } from '../../../contexts/ContactContext';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';

interface ContactSelectorProps {
  selected: string[];
  onToggleSelection: (contactId: string) => void;
  existingParticipants?: Contact[];
}

export function ContactSelector({
  selected,
  onToggleSelection,
  existingParticipants = [],
}: ContactSelectorProps) {
  const { contacts } = useContacts();
  const { user } = useSupabaseAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites'>('all');

  // Create a set of existing participant IDs for quick checking
  const existingParticipantIds = useMemo(() => new Set(existingParticipants.map(p => p.id)), [existingParticipants]);

  const existingParticipantEmails = useMemo(() => new Set(existingParticipants.map(p => p.email)), [existingParticipants]);

  // Combine contacts and current user into one list
  const allPossibleParticipants = useMemo(() => {
    if (!user || !user.id) return [...contacts];
    const userAsContact: Contact = { 
      id: user.id, 
      user_id: user.id,
      name: user.name, 
      email: user.email, 
      avatar: user.avatar, 
      favorite: true 
    };
    // Exclude user duplicate from contacts list if they exist there
    const otherContacts = contacts.filter(c => c.email !== user.email);
    return [userAsContact, ...otherContacts];
  }, [user, contacts]);

  // Filter contacts to show only those who are not yet in the event
  const availableContacts = useMemo(() => 
    allPossibleParticipants.filter(p => {
      // For user contact, check by email since the ID might be different
      if (p.id === user?.id) {
        return !existingParticipantEmails.has(p.email);
      }
      // For other contacts, check by ID
      return !existingParticipantIds.has(p.id);
    }),
    [allPossibleParticipants, existingParticipantIds, existingParticipantEmails, user?.id]
  );
  
  const filteredContacts = useMemo(() => availableContacts.filter(c => {
    if (tab === 'favorites' && !c.favorite) return false;
    if (
      search.trim() &&
      !c.name.toLowerCase().includes(search.toLowerCase()) &&
      !(c.email || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  }), [availableContacts, tab, search]);
  
  const selectedContacts = useMemo(() => 
    allPossibleParticipants.filter(c => selected.includes(c.id)), 
    [selected, allPossibleParticipants]
  );

  return (
    <>
      {/* Selected avatars */}
      {selectedContacts.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedAvatarsContainer}>
          {selectedContacts.map(c => (
            <TouchableOpacity key={c.id} onPress={() => onToggleSelection(c.id)}>
              {c.avatar ? (
                <Image source={{ uri: c.avatar }} style={styles.selectedAvatar} />
              ) : (
                <View style={styles.selectedAvatarPlaceholder}>
                  <Text style={styles.selectedAvatarText}>{c.name ? c.name[0].toUpperCase() : '?'}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Tabs & Search */}
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
      
      {/* Contact list */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredContacts.map(c => {
          const isSelected = selected.includes(c.id);
          // Add (you) to the current user's name
          const displayName = user && (c.email === user.email || c.id === user.id)
            ? `${c.name} (you)`
            : c.name;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.contactRow, isSelected && styles.contactRowSelected]}
              onPress={() => onToggleSelection(c.id)}
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
                <Text style={styles.contactName}>{displayName}</Text>
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
    </>
  );
}

// Styles
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
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    contactAvatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      backgroundColor: '#232323',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactAvatarText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    contactName: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      flex: 1,
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
});

export default ContactSelector; 