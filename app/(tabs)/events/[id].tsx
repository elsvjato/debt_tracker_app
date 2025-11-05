import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useContacts } from '../../../contexts/ContactContext';
import { useEvents } from '../../../contexts/EventContext';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../contexts/SupabaseDataContext';
import { EVENT_DETAILS, EXPENSE_CATEGORIES } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';
import { formatAmount } from '../../../utils/currency';
import { BalancesGraph } from './BalancesGraph';

function RedirectToEvents() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isMounted) {
    router.replace('/events');
    }
  }, [router, isMounted]);
  
  return <View style={{ flex: 1, backgroundColor: '#18181b' }} />;
}

export default function EventDetailsWrapper() {
  const { id } = useLocalSearchParams();
  const { events } = useEvents();
  
  // Safe data check
  const safeEvents = events && Array.isArray(events) ? events : [];
  const event = safeEvents.find(e => e && e.id === id);
  
  if (!event || typeof event !== 'object') {
    return <RedirectToEvents />;
  }
  return <EventDetails event={event} />;
}

function EventDetails({ event }: { event: import('../../../contexts/EventContext').Event }) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const safeRouterPush = (url: any) => {
    if (router && typeof router.push === 'function') {
      router.push(url);
    }
  };
  const safeRouterReplace = (url: any) => {
    if (router && typeof router.replace === 'function') {
      router.replace(url);
    }
  };
  const { deleteEvent, updateEvent, addUserToEvent, removeUserFromEvent, isUserInEvent } = useEvents();
  const { contacts } = useContacts();
  const { getExpensesByEvent, refreshData } = useSupabaseData();
  const { user } = useSupabaseAuth();
  const [tab, setTab] = useState('expenses');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [showDeleteParticipant, setShowDeleteParticipant] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null);

  // Safe data checks
  const safeContacts = contacts && Array.isArray(contacts) ? contacts : [];
  const eventExpenses = getExpensesByEvent(event.id);
  const safeEventExpenses = eventExpenses && Array.isArray(eventExpenses) ? eventExpenses : [];
  // Add reliable filtering to avoid null/undefined participants
  const safeParticipants = event.participants && Array.isArray(event.participants) 
    ? event.participants.filter(p => p && p.id) 
    : [];

  const isUserParticipant = isUserInEvent(event.id);

  // Refresh data when screen focuses
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Calculate balances
  const balances = (() => {
    const balanceMap: Record<string, number> = {};
    
    // Initialize all participants with 0 balance
    safeParticipants.forEach(p => {
      if (p && p.id) {
        balanceMap[p.id] = 0;
      }
    });
    
    // Add current user if not already in participants
    if (user?.id && !balanceMap.hasOwnProperty(user.id)) {
      balanceMap[user.id] = 0;
    }
    
    // Calculate balances from expenses
    safeEventExpenses.forEach(expense => {
      // Add what each person paid
      expense.paid_by?.forEach(pb => {
        const participantId = pb.user_id || pb.contact_id;
        if (participantId && balanceMap.hasOwnProperty(participantId)) {
          balanceMap[participantId] += pb.amount;
        }
      });
      
      // Subtract what each person owes
      expense.split_between?.forEach(sb => {
        const participantId = sb.user_id || sb.contact_id;
        if (participantId && balanceMap.hasOwnProperty(participantId)) {
          balanceMap[participantId] -= sb.amount;
        }
      });
    });
    
    return balanceMap;
  })();

  // OPTIMAL TRANSACTIONS
  const optimalTransactions = (() => {
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];
    for (const id in balances) {
      const value = balances[id];
      if (value > 0.01) {
        creditors.push({ id, amount: value });
      } else if (value < -0.01) {
        debtors.push({ id, amount: -value });
    }
    }
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);
    const transactions: { from: string; to: string; amount: number }[] = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);
      if (amount > 0) {
        transactions.push({ from: debtor.id, to: creditor.id, amount });
        debtor.amount -= amount;
        creditor.amount -= amount;
      }
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return transactions;
  })();

  // Calculate total spent by each user
  const totalSpentByUser = (() => {
    const spentMap: Record<string, { id: string; name: string; amount: number; avatar?: string }> = {};
    
    // Initialize all participants including the current user
    safeParticipants.forEach(p => {
      if (p && p.id) {
        spentMap[p.id] = {
          id: p.id,
          name: p.name || 'Unknown',
          amount: 0,
          avatar: p.avatar
        };
      }
    });
    
    // Add current user if not already in participants
    if (user?.id && !spentMap[user.id]) {
      spentMap[user.id] = {
        id: user.id,
        name: user.user_metadata?.name || user.name || 'You',
        amount: 0,
        avatar: user.user_metadata?.avatar || user.avatar
      };
    }
    
    // Calculate total spent from expenses
    safeEventExpenses.forEach(expense => {
      expense.paid_by?.forEach(pb => {
        const participantId = pb.user_id || pb.contact_id;
        if (participantId && spentMap[participantId]) {
          spentMap[participantId].amount += pb.amount;
        }
      });
    });
    
    // Convert to array and sort by amount
    const spent = Object.values(spentMap).filter(s => s.amount > 0);
    return spent.sort((a, b) => b.amount - a.amount);
  })();

  // Helper function to get participant name from expense data
  const getExpenseParticipantName = (participantData: any) => {
    // If it's the current user (user_id is set)
    if (participantData.user_id === user?.id) {
      return user.user_metadata?.name || user.name || 'You';
    }
    
    // If it's a contact (contact_id is set)
    if (participantData.contact_id) {
      const participant = safeParticipants.find(p => p.id === participantData.contact_id);
      if (participant) {
        return participant.name;
      }
    }
    
    return 'Unknown';
  };

  // Actions
  const handleDeleteGroup = async () => {
    setShowDeleteGroup(false);
    if (event && event.id) {
      await deleteEvent(event.id);
    }
    safeRouterReplace('/events');
  };

  const handleDeleteParticipant = () => {
    if (participantToRemove) {
      const filteredParticipants = safeParticipants.filter(p => p && p.id !== participantToRemove);
      updateEvent({
        ...event,
        participants: filteredParticipants,
      });
    }
    setShowDeleteParticipant(false);
    setRemoveId(null);
    setParticipantToRemove(null);
    closeRemoveMenu();
  };

  // Navigation to contact page
  const handleContactPress = (participant: any) => {
    if (participant.id === user?.id) {
      // If it's the user, go to profile
      safeRouterPush('/profile');
    } else {
      // If it's a contact, go to contact page
      safeRouterPush({ pathname: '/contact/[id]', params: { id: participant.id } });
    }
  };

  // Close Remove menu
  const closeRemoveMenu = () => {
    setRemoveId(null);
  };

  // Avatars
  const MemberAvatar = ({ participant }: { participant: any }) => {
    if (participant.avatar && typeof participant.avatar === 'string' && participant.avatar.trim() !== '') {
      return <Image source={{ uri: participant.avatar }} style={styles.memberAvatar} />;
    }
    
    return (
      <View style={[styles.memberAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#888' }]}>
        <Ionicons name="person" size={22} color="#fff" />
      </View>
    );
  };

  // Додаю список категорій (можна винести у спільний файл)
  const CATEGORIES_LIST = [
    { key: 'general', label: 'General', icon: 'file-document-outline', color: '#7B8FA1' },
    { key: 'games', label: 'Games', icon: 'gamepad-variant', color: '#FF7043' },
    { key: 'movies', label: 'Movies', icon: 'movie-open', color: '#FF7043' },
    { key: 'music', label: 'Music', icon: 'music', color: '#FF7043' },
    { key: 'sports', label: 'Sports', icon: 'basketball', color: '#FF7043' },
    { key: 'groceries', label: 'Groceries', icon: 'cart', color: '#4CAF50' },
    { key: 'dining', label: 'Dining Out', icon: 'silverware-fork-knife', color: '#4CAF50' },
    { key: 'liquor', label: 'Liquor', icon: 'glass-cocktail', color: '#4CAF50' },
    { key: 'shopping', label: 'Shopping', icon: 'shopping', color: '#AB47BC' },
  ];

  // TABS
  const TABS = [
    { key: 'expenses', label: t(EVENT_DETAILS.EXPENSES) },
    { key: 'balances', label: t(EVENT_DETAILS.BALANCES) },
    { key: 'totals', label: t(EVENT_DETAILS.TOTALS) },
    { key: 'info', label: t(EVENT_DETAILS.GROUP_INFO) },
  ];

  // UI
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerRow, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => safeRouterPush('/')} style={styles.headerBackBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.background} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.background }]} numberOfLines={1}>{event.title || 'Untitled'} {event.emoji ? <Text>{event.emoji}</Text> : ''}</Text>
        <TouchableOpacity onPress={() => setMenuOpen(v => !v)} style={styles.headerMenuBtn}>
          <MaterialIcons name="more-vert" size={26} color={colors.background} />
        </TouchableOpacity>
        {menuOpen && (
          <View style={[styles.headerMenuDropdown, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity style={styles.headerMenuItem} onPress={() => { setMenuOpen(false); if (event && event.id) { safeRouterPush(`/events/edit/${event.id}` as any); } }}>
              <MaterialIcons name="edit" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
              <Text style={[styles.headerMenuText, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.EDIT_EVENT)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerMenuItem} onPress={() => { setMenuOpen(false); setShowDeleteGroup(true); }}>
              <MaterialIcons name="delete" size={20} color="#FF4444" style={{ marginRight: 8 }} />
              <Text style={[styles.headerMenuText, { color: '#FF4444' }]}>{t(EVENT_DETAILS.DELETE_EVENT)}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Cover Image */}
      {event.image_uri && 
       typeof event.image_uri === 'string' && 
       event.image_uri.trim() !== '' && 
       event.image_uri !== 'null' && 
       event.image_uri !== 'undefined' && 
       event.image_uri !== 'undefined' && 
       event.image_uri.length > 0 && 
       event.image_uri !== 'data:,' ? (
        <Image source={{ uri: event.image_uri }} style={styles.coverImage} />
      ) : (
        <View style={[styles.coverImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}>
          <MaterialIcons name="image" size={40} color={colors.textTertiary} />
        </View>
      )}
      {/* Tabs */}
      <View style={[styles.tabsRowAdaptive, { backgroundColor: colors.cardBackground }]}>
        {TABS.filter(t => t && typeof t === 'object' && t.key && t.label).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtnAdaptive, tab === t.key && { backgroundColor: colors.primary }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabTextAdaptive, { color: colors.textPrimary }, tab === t.key && { color: colors.background }]} numberOfLines={1} ellipsizeMode="tail">{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {tab === 'expenses' && (
          <View style={styles.tabContent}>
            {(safeEventExpenses).length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.NO_EXPENSES)}</Text>
            ) : (
              <FlatList
                data={safeEventExpenses.filter(e => e && typeof e === 'object').sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))}
                keyExtractor={item => (item && item.id ? String(item.id) : Math.random().toString())}
                renderItem={({ item }) => {
                  if (!item || !item.id) return <View />;

                  const paidByParticipant = safeParticipants.find(p => item.paid_by?.some(pb => pb.contact_id === p.id));
                  const cat = CATEGORIES_LIST.find(c => c.key === item.category) || CATEGORIES_LIST[0];
                  const categoryKey = item.category?.toUpperCase() as keyof typeof EXPENSE_CATEGORIES;
                  const categoryLabel = categoryKey ? t(EXPENSE_CATEGORIES[categoryKey]) : item.category;

                  return (
                    <TouchableOpacity
                      style={[styles.expenseCard, { backgroundColor: colors.cardBackground }]}
                      onPress={() => safeRouterPush(`/events/expense/${item.id}?eventId=${event.id}`)}
                    >
                      <View style={styles.expenseIconWrap}>
                        <MaterialCommunityIcons name={cat.icon as any} size={24} color="#fff" />
                        </View>
                        <View style={{ flex: 1 }}>
                        <Text style={[styles.expenseTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.expenseSubtitle, { color: colors.textTertiary }]}>
                          {t(EVENT_DETAILS.PAID_BY)} {item.paid_by && item.paid_by.length > 0 ? getExpenseParticipantName(item.paid_by[0]) : 'Unknown'}
                        </Text>
                        </View>
                      <Text style={[styles.expenseAmount, { color: colors.textPrimary }]}>{formatAmount(item.amount, event.currency)}</Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
              />
            )}
            {/* FAB for adding expenses */}
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => safeRouterPush(`/events/add-expense?id=${event.id}`)} activeOpacity={0.85}>
              <Ionicons name="add" size={32} color={colors.background} />
            </TouchableOpacity>
          </View>
        )}
        {tab === 'balances' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Balances graph */}
            <BalancesGraph
              balances={balances}
              participants={(() => {
                // Include current user in participants list for balances, but avoid duplicates
                const userProfile = {
                  id: user?.id || '',
                  name: user?.user_metadata?.name || user?.name || 'You'
                };
                
                // Check if user is already in participants
                const userExists = safeParticipants.some(p => p && p.email === user?.email);
                
                if (!userExists && user?.id) {
                  return [userProfile, ...safeParticipants.filter(p => p && typeof p === 'object')];
                }
                
                return safeParticipants.filter(p => p && typeof p === 'object');
              })()}
              userId={user?.id}
              currency={event.currency || 'USD'}
            />
            {/* Transactions title */}
            <View style={{ marginTop: 12, marginBottom: 4, alignItems: 'center' }}>
              <Text style={{
                color: colors.textTertiary,
                fontSize: 15,
                fontWeight: '600',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}>
                {t(EVENT_DETAILS.OPTIMAL_TRANSACTIONS)}
              </Text>
            </View>
            {/* Optimal transactions */}
            <View style={{ marginTop: 12 }}>
              {(optimalTransactions && Array.isArray(optimalTransactions) ? optimalTransactions : []).length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary, textAlign: 'center', fontSize: 16 }]}>{t(EVENT_DETAILS.SETTLED)} 🎉</Text>
              ) : (
                (optimalTransactions && Array.isArray(optimalTransactions) ? optimalTransactions : []).filter(tx => tx && typeof tx === 'object' && tx.from && tx.to && typeof tx.amount === 'number').map((tx, idx) => {
                  const from = safeParticipants.filter(p => p && typeof p === 'object').find(p => p.id === tx.from);
                  const to = safeParticipants.filter(p => p && typeof p === 'object').find(p => p.id === tx.to);
                  return (
                    <View key={idx} style={styles.txRow}>
                      <Text style={[styles.txName, { color: colors.textPrimary }]}>{from && from.name ? from.name : 'Someone'}</Text>
                      <Text style={[styles.txOwes, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.PAYS)}</Text>
                      <Text style={[styles.txName, { color: colors.textPrimary }]}>{to && to.name ? to.name : 'Someone'}</Text>
                      <Text style={[styles.txAmount, { color: colors.textPrimary }]}>{formatAmount(tx.amount || 0, event.currency || 'USD')}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}
        {tab === 'totals' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Two tiles with total debts */}
            {(() => {
              const userId = user?.id;
              let youOwe = 0;
              let owedToYou = 0;
              if (userId) {
                Object.entries(balances).forEach(([id, bal]) => {
                  if (id === userId) {
                    if (bal < -0.01) youOwe = -bal;
                    if (bal > 0.01) owedToYou = bal;
                  }
                });
              }
              return (
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32, marginTop: 8 }}>
                  <View style={[styles.totalTile, { marginRight: 12, backgroundColor: colors.cardBackground }]}> 
                    <Text style={[styles.totalTileLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.OWES)}</Text>
                    <Text style={[styles.totalTileOwe, { color: colors.error }]}>{formatAmount(youOwe, event.currency || 'USD')}</Text>
                  </View>
                  <View style={[styles.totalTile, { backgroundColor: colors.cardBackground }]}> 
                    <Text style={[styles.totalTileLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.OWED)}</Text>
                    <Text style={[styles.totalTileOwed, { color: colors.success }]}>{formatAmount(owedToYou, event.currency || 'USD')}</Text>
                  </View>
                </View>
              );
            })()}
            {/* Expenses list title */}
            <View style={{ marginTop: 0, marginBottom: 4, alignItems: 'center' }}>
              <Text style={{
                color: colors.textTertiary,
                fontSize: 15,
                fontWeight: '600',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}>
                {t(EVENT_DETAILS.TOTAL_SPENT)}
              </Text>
            </View>
            <View style={styles.totalsContainer}>
              {(totalSpentByUser && Array.isArray(totalSpentByUser) ? totalSpentByUser : []).filter(spent => spent && typeof spent === 'object' && spent.id && spent.name && typeof spent.amount === 'number').map((spent, idx) => (
                <View key={idx} style={styles.totalRow}>
                  <View style={styles.totalUser}>
                    {spent.avatar && typeof spent.avatar === 'string' && spent.avatar.trim() !== '' ? (
                      <Image source={{ uri: spent.avatar }} style={styles.totalAvatar} />
                    ) : (
                      <View style={[styles.totalAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}> 
                        <Ionicons name="person" size={20} color={colors.background} />
                      </View>
                    )}
                    <Text style={[styles.totalName, { color: colors.textPrimary }]}>{spent.name || 'Unknown'}</Text>
                  </View>
                  <Text style={[styles.totalAmount, { color: colors.textPrimary }]}>{formatAmount(spent.amount || 0, event.currency || 'USD')}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
        {tab === 'info' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 32 }}>
            <TouchableWithoutFeedback onPress={closeRemoveMenu}>
            <View style={styles.infoContainer}>
              {/* Group Info Block */}
              <View style={[styles.groupInfoBlock, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.GROUP_TITLE)}</Text>
                  <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                    {event.title || 'Untitled'} {event.emoji ? <Text>{event.emoji}</Text> : ''}
                  </Text>
                {event.description ? (
                  <>
                    <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.DESCRIPTION)}</Text>
                    <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{event.description || 'No description'}</Text>
                  </>
                ) : null}
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.CURRENCY)}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{event.currency || 'USD'}</Text>
                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{t(EVENT_DETAILS.CATEGORY)}</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{event.category || 'General'}</Text>
              </View>
              {/* Group Members Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeaderRow}>
                  <Text style={[styles.infoTitle, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.GROUP_MEMBERS)}</Text>
                    <TouchableOpacity style={styles.addBtnCircle} onPress={() => safeRouterPush({ pathname: '/events/add-participant', params: { eventId: event.id }})}>
                    <Ionicons name="add" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {/* Participants list */}
                <View style={{ marginTop: 8 }}>
                  {(() => {
                    // Формуємо масив учасників: user (auth) перший, далі всі інші по алфавіту
                    const others = safeParticipants.filter(p => p && p.email !== user?.email).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                    
                    // Check if user is already in participants
                    const userExists = safeParticipants.some(p => p && p.email === user?.email);
                    
                    const sorted = userExists ? safeParticipants : [
                      {
                        id: user?.id,
                        user_id: user?.id,
                        name: user?.user_metadata?.name || user?.name || '',
                        email: user?.email || '',
                        avatar: user?.user_metadata?.avatar || user?.avatar,
                        favorite: true,
                        isSelf: true,
                      },
                      ...others
                    ];
                    return sorted.filter(p => p && typeof p === 'object' && p.id && p.name).map((p, idx) => {
                      if (!p || !p.id) return <View key={idx} />;
                      return (
                        <View key={p.id} style={[styles.memberCardNew, { backgroundColor: colors.cardBackground }]}>
                            <TouchableOpacity 
                              style={styles.memberInfo} 
                              onPress={() => handleContactPress(p)}
                              activeOpacity={0.7}
                              onLongPress={() => {
                                if (p.email !== user?.email) {
                                  setRemoveId(p.id);
                                }
                              }}
                            >
                              {removeId === p.id && (
                                <TouchableOpacity 
                                  style={styles.removeBtn} 
                                  onPress={() => {
                                    setShowDeleteParticipant(true);
                                    setParticipantToRemove(p.id);
                                  }}
                                >
                                  <MaterialIcons name="remove-circle-outline" size={20} color={colors.error} />
                                </TouchableOpacity>
                              )}
                              <MemberAvatar participant={p} />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.memberName, { color: colors.textPrimary }]}>
                                    {p.name || 'Unknown'}{p.email === user?.email ? <Text style={{ color: colors.primary }}> (You)</Text> : null}
                                </Text>
                                <Text style={[styles.memberEmail, { color: colors.textTertiary }]}>{p.email || 'No email'}</Text>
                              </View>
                            </TouchableOpacity>
                        </View>
                      );
                    });
                  })()}
                </View>
              </View>
            </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        )}
      </View>

      {/* Modals */}
      <Modal visible={showDeleteGroup} transparent animationType="fade" onRequestClose={() => setShowDeleteGroup(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.DELETE_EVENT)}</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>{t(EVENT_DETAILS.DELETE_MESSAGE)}</Text>
            <View style={styles.modalActionsNew}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowDeleteGroup(false)}>
                <Text style={[styles.modalBtnTextSecondary, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.CANCEL)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: colors.error }]} onPress={handleDeleteGroup}>
                <Text style={[styles.modalBtnTextPrimary, { color: colors.background }]}>{t(EVENT_DETAILS.DELETE_EVENT)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDeleteParticipant} transparent animationType="fade" onRequestClose={() => { setShowDeleteParticipant(false); setParticipantToRemove(null); }}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.REMOVE_PARTICIPANT)}</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {t(EVENT_DETAILS.REMOVE_MESSAGE)}
            </Text>
            <View style={styles.modalActionsNew}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => { setShowDeleteParticipant(false); setParticipantToRemove(null); }}>
                <Text style={[styles.modalBtnTextSecondary, { color: colors.textPrimary }]}>{t(EVENT_DETAILS.CANCEL)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnPrimary, { backgroundColor: colors.error }]} onPress={handleDeleteParticipant}>
                <Text style={[styles.modalBtnTextPrimary, { color: colors.background }]}>{t(EVENT_DETAILS.REMOVE_PARTICIPANT)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerBackBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  headerMenuBtn: {
    padding: 8,
  },
  headerMenuDropdown: {
    position: 'absolute',
    top: 48,
    right: 8,
    minWidth: 160,
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 2000,
  },
  headerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  headerMenuText: {
    fontSize: 17,
    fontWeight: '500',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  tabsRowAdaptive: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tabBtnAdaptive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  tabTextAdaptive: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#23232a',
  },
  expenseIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  expenseAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#23232a',
  },
  txName: {
    color: '#fff',
    fontSize: 16,
  },
  txOwes: {
    color: '#888',
    fontSize: 16,
    marginHorizontal: 8,
  },
  txAmount: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  totalsContainer: {
    padding: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#23232a',
  },
  totalUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#23232a',
    marginRight: 12,
  },
  totalName: {
    color: '#fff',
    fontSize: 16,
  },
  totalAmount: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#23232a',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#23232a',
    marginRight: 12,
  },
  memberName: {
    color: '#fff',
    fontSize: 16,
  },
  memberEmail: {
    color: '#888',
    fontSize: 14,
  },
  memberMenuBtn: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnCircle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#23232a',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalView: {
    backgroundColor: '#23232a',
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 22,
    textAlign: 'center',
  },
  modalActionsNew: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  modalBtnPrimary: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    borderWidth: 2,
    borderColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnTextSecondary: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalTile: {
    flex: 1,
    backgroundColor: '#23232a',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minWidth: 110,
  },
  totalTileLabel: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  totalTileOwe: {
    color: '#FF4444',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 1,
  },
  totalTileOwed: {
    color: '#2ECC71',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    letterSpacing: 1,
  },
  groupInfoBlock: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  infoLabel: {
    color: '#888',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '400',
  },
  memberCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23232a',
    borderRadius: 16,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  memberMenuBtnNew: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMenuDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 120,
    backgroundColor: '#23232a',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 1000,
  },
  removeMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  removeMenuText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#FFC107',
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
  removeBtn: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


