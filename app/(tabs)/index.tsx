import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { strings } from '../../i18n/strings';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { formatAmount } from '../../utils/currency';
import EventTile from '../../utils/EventTile';

export default function HomeScreen() {
  // All hooks must be called unconditionally at the top
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  // Call context hooks unconditionally
  const { events, expenses, loading, contacts, refreshData } = useSupabaseData();
  
  // Оновлювати дані при кожному фокусі екрану
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  // State for current currency of each tile
  const [youOweCurrency, setYouOweCurrency] = useState('USD');
  const [owedToYouCurrency, setOwedToYouCurrency] = useState('USD');

  // Safe data validation - handle context errors after hooks are called
  const safeEvents = events && Array.isArray(events) ? events : [];
  const safeExpenses = expenses && Array.isArray(expenses) ? expenses : [];

  const userEmail = user?.email;

  // Calculate debts by currency using optimal transactions (not just net balance)
  const optimalDebtsByCurrency = useMemo(() => {
    if (!user) return { youOweByCurrency: {}, owedToYouByCurrency: {} };

    const youOweByCurrency: { [currency: string]: number } = {};
    const owedToYouByCurrency: { [currency: string]: number } = {};

    safeEvents.forEach(event => {
      // Find user participant - check both participants list and user ID
      let userParticipant = event.participants?.find((p: any) => p.email === user.email);
      
      // If user is not in participants list, create a virtual participant
      if (!userParticipant && user?.id) {
        userParticipant = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.name || 'You'
        } as any;
      }
      
      if (!userParticipant) return;

      // Calculate balances for all participants
      const participantBalances: Record<string, number> = {};
      
      // Initialize all participants including the current user
      event.participants?.forEach((p: any) => {
        if (p && p.id) participantBalances[p.id] = 0;
      });
      
      // Add current user if not already in participants
      if (user?.id && !participantBalances.hasOwnProperty(user.id)) {
        participantBalances[user.id] = 0;
      }
      
      safeExpenses.filter(e => e.event_id === event.id).forEach(expense => {
        expense.paid_by?.forEach((pb: any) => {
          const participantId = pb.user_id || pb.contact_id;
          if (participantId && typeof pb.amount === 'number') {
            participantBalances[participantId] = (participantBalances[participantId] || 0) + pb.amount;
          }
        });
        expense.split_between?.forEach((sb: any) => {
          const participantId = sb.user_id || sb.contact_id;
          if (participantId && typeof sb.amount === 'number') {
            participantBalances[participantId] = (participantBalances[participantId] || 0) - sb.amount;
          }
        });
      });

      // Build optimal transactions
      const creditors: { id: string; amount: number }[] = [];
      const debtors: { id: string; amount: number }[] = [];
      for (const id in participantBalances) {
        const value = participantBalances[id];
        if (value > 0.01) creditors.push({ id, amount: value });
        else if (value < -0.01) debtors.push({ id, amount: -value });
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

      // Sum up for this event
      transactions.forEach(tx => {
        if (tx.from === userParticipant.id) {
          // You owe someone
          youOweByCurrency[event.currency] = (youOweByCurrency[event.currency] || 0) + tx.amount;
        } else if (tx.to === userParticipant.id) {
          // Someone owes you
          owedToYouByCurrency[event.currency] = (owedToYouByCurrency[event.currency] || 0) + tx.amount;
        }
      });
    });

    return { youOweByCurrency, owedToYouByCurrency };
  }, [safeEvents, safeExpenses, user]);

  // Get available currencies
  const youOweCurrencies = Object.keys(optimalDebtsByCurrency.youOweByCurrency);
  const owedToYouCurrencies = Object.keys(optimalDebtsByCurrency.owedToYouByCurrency);

  // Set initial currencies if they don't exist
  React.useEffect(() => {
    // If new currencies appeared and current is not in list, set first available
    if (youOweCurrencies.length > 0 && !youOweCurrencies.includes(youOweCurrency)) {
      setYouOweCurrency(youOweCurrencies[0]);
    } else if (youOweCurrencies.length === 0) {
      // If no debts, reset to default
      setYouOweCurrency('USD');
    }

    if (owedToYouCurrencies.length > 0 && !owedToYouCurrencies.includes(owedToYouCurrency)) {
      setOwedToYouCurrency(owedToYouCurrencies[0]);
    } else if (owedToYouCurrencies.length === 0) {
      setOwedToYouCurrency('USD');
    }
    // Add balancesByCurrency to dependencies so effect runs when debts change
  }, [optimalDebtsByCurrency]);

  // Functions for cycling currencies
  const cycleYouOweCurrency = () => {
    if (youOweCurrencies.length > 1) {
      const currentIndex = youOweCurrencies.indexOf(youOweCurrency);
      const nextIndex = (currentIndex + 1) % youOweCurrencies.length;
      setYouOweCurrency(youOweCurrencies[nextIndex]);
    }
  };

  const cycleOwedToYouCurrency = () => {
    if (owedToYouCurrencies.length > 1) {
      const currentIndex = owedToYouCurrencies.indexOf(owedToYouCurrency);
      const nextIndex = (currentIndex + 1) % owedToYouCurrencies.length;
      setOwedToYouCurrency(owedToYouCurrencies[nextIndex]);
    }
  };

  // Get current amounts
  const currentYouOwe = optimalDebtsByCurrency.youOweByCurrency[youOweCurrency] || 0;
  const currentOwedToYou = optimalDebtsByCurrency.owedToYouByCurrency[owedToYouCurrency] || 0;

  // Last 5 events
  const recentEvents = [...safeEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Splitter</Text>
        </View>

        {/* Available Balance */}
        <View style={styles.balanceContainer}>
          <TouchableOpacity 
            style={[styles.balanceCard, { backgroundColor: colors.cardBackground }]} 
            onPress={cycleYouOweCurrency} 
            activeOpacity={0.8}
            disabled={youOweCurrencies.length <= 1}
          >
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>{t('youOwe')}</Text>
            <Text style={[styles.balanceAmount, styles.negative]}>
              {formatAmount(currentYouOwe, youOweCurrency)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.balanceCard, { backgroundColor: colors.cardBackground }]} 
            onPress={cycleOwedToYouCurrency} 
            activeOpacity={0.8}
            disabled={owedToYouCurrencies.length <= 1}
          >
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>{t('owedToYou')}</Text>
            <Text style={[styles.balanceAmount, styles.positive]}>
              {formatAmount(currentOwedToYou, owedToYouCurrency)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Events */}
        <View style={styles.recentEventsList}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('recentEvents')}</Text>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>{t('seeAll')}</Text>
            </TouchableOpacity>
          </View>
          {recentEvents.length === 0 ? (
            <Text style={{ color: colors.textTertiary, textAlign: 'center', marginTop: 16 }}>{t(strings.noEvents)}</Text>
          ) : (
            recentEvents.filter(event => event && typeof event === 'object' && event.id && event.title && Array.isArray(event.participants)).map((event: any, idx: number) => (
              <EventTile key={event.id} event={event} onPress={() => router.push(`/events/${event.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.actionIconWrap, { backgroundColor: colors.primary }]}>
        <Ionicons name={icon} size={24} color={colors.background} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
  balanceContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  balanceCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  negative: {
    color: '#E53935',
  },
  positive: {
    color: '#43A047',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconWrap: {
    borderRadius: 999,
    padding: 12,
  },
  actionLabel: {
    fontSize: 13,
    marginTop: 6,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 15,
    marginRight: 2,
  },
  transactionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  transactionDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionSub: {
    fontSize: 13,
  },
  transactionAmountNegative: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionAmountPositive: {
    color: '#43A047',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
  },
  payButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 16,
  },
  eventCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventHeader: {
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    marginTop: 5,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 15,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventDetailText: {
    fontSize: 14,
  },
  eventCardModern: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  eventHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAvatarModern: {
    borderRadius: 999,
    padding: 12,
    marginRight: 10,
  },
  eventTitleModern: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDateModern: {
    fontSize: 14,
    marginTop: 5,
  },
  eventDetailsModern: {
    flexDirection: 'row',
    gap: 15,
  },
  eventDetailModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventDetailTextModern: {
    fontSize: 14,
  },
  recentEventsList: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 120,
  },
}); 