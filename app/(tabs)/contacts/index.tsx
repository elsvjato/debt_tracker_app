import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { Contact, useSupabaseData } from '../../../contexts/SupabaseDataContext';
import { CONTACTS } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';



const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ContactsScreen() {
  // All hooks must be called unconditionally at the top
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  // Call context hooks unconditionally
  const { contacts, updateContact, loading, refreshData } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'favorites'>('all');
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({});

  // Refresh data when screen focuses
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Safe data validation - handle context errors after hooks are called
  const contactsList = contacts || [];

  // Filter out the current user from the contacts list
  const filteredOutSelfContacts = useMemo(() => {
    if (!user) return contactsList;
    return contactsList.filter(c => c.email !== user.email);
  }, [contactsList, user]);

  // Використовуємо аватарки напряму (як в івентах)
  useEffect(() => {
    const urls: { [key: string]: string } = {};
    for (const contact of filteredOutSelfContacts) {
      if (contact.avatar) {
        // Використовуємо аватарку напряму, як в івентах
        urls[contact.id] = contact.avatar;
      }
    }
    setAvatarUrls(urls);
  }, [filteredOutSelfContacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    let list = filteredOutSelfContacts;
    if (tab === 'favorites') list = list.filter(c => c.favorite);
    if (searchQuery.trim()) {
      list = list.filter(
        c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  }, [filteredOutSelfContacts, searchQuery, tab]);

  // Group by alphabet
  const sections = useMemo(() => {
    const grouped: { [key: string]: Contact[] } = {};
    filteredContacts.forEach(c => {
      const letter = (c.name[0] || '').toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(c);
    });
    return alphabet
      .map(letter => ({ title: letter, data: grouped[letter] || [] }))
      .filter(section => section.data.length > 0);
  }, [filteredContacts]);

  // Scroll to section by alphabet
  const sectionListRef = React.useRef<SectionList<Contact>>(null);
  const scrollToLetter = (letter: string) => {
    const idx = sections.findIndex(s => s.title === letter);
    if (idx !== -1 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true });
    }
  };

  // Toggle favorite
  const toggleFavorite = (contact: Contact) => {
    updateContact(contact.id, { favorite: !contact.favorite });
  };

  const [editingContact, setEditingContact] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t(CONTACTS.TITLE)}</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={20} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder={t(CONTACTS.SEARCH_PLACEHOLDER)}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: colors.inputBackground }]}>
        <Pressable
          style={[styles.tabBtn, tab === 'all' && { backgroundColor: colors.primary }]}
          onPress={() => setTab('all')}
        >
          <Text style={[styles.tabText, { color: colors.textPrimary }, tab === 'all' && { color: colors.background }]}>
            {t(CONTACTS.ALL_CONTACTS)}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === 'favorites' && { backgroundColor: colors.primary }]}
          onPress={() => setTab('favorites')}
        >
          <Text style={[styles.tabText, { color: colors.textPrimary }, tab === 'favorites' && { color: colors.background }]}>
            {t(CONTACTS.FAVORITES)}
          </Text>
        </Pressable>
      </View>

      {/* Contacts List */}
      <View style={{ flex: 1 }}>
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={() => null}
          renderItem={({ item, index }) => {
            return (
            <Animated.View
              entering={FadeInDown.duration(350).delay(index * 30)}
            >
              <TouchableOpacity
                style={[styles.contactItem, { backgroundColor: colors.cardBackground }]}
                onPress={() => router.push(`/contact/${item.id}`)}
                activeOpacity={0.85}
              >
                  {item.avatar && avatarUrls[item.id] ? (
                  <Image
                      source={{ uri: avatarUrls[item.id] }}
                    style={styles.avatar}
                      onLoad={() => {
                        setTimeout(() => {
                          console.log('🎉 IMAGE LOADED:', item.name);
                        }, 1000);
                      }}
                      onError={() => {
                        setTimeout(() => {
                          console.log('💥 IMAGE LOAD ERROR:', item.name);
                          console.log('💥 Failed URL:', avatarUrls[item.id]);
                        }, 1000);
                      }}
                      onLoadStart={() => {
                        setTimeout(() => {
                          console.log('🚀 IMAGE LOADING:', item.name);
                          console.log('🚀 Loading URL:', avatarUrls[item.id]);
                        }, 500);
                      }}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person" size={28} color={colors.textTertiary} />
                  </View>
                )}
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: colors.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.contactEmail, { color: colors.textTertiary }]}>{item.email}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.starBtn} hitSlop={10}>
                  <Ionicons
                    name={item.favorite ? 'star' : 'star-outline'}
                    size={22}
                    color={item.favorite ? colors.primary : colors.textTertiary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
            );
          }}
          contentContainerStyle={styles.listContainer}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t(CONTACTS.NO_CONTACTS_FOUND)}</Text>
            </View>
          }
        />
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/contacts/add-contact')}
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
    paddingTop: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 26,
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
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 14,
  },
  starBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontSize: 16,
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
}); 