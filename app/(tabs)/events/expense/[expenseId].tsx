import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContacts } from '../../../../contexts/ContactContext';
import { useEvents } from '../../../../contexts/EventContext';
import { useSupabaseAuth } from '../../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../../contexts/SupabaseDataContext';
import { EXPENSE_DETAILS } from '../../../../i18n/strings';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useTheme } from '../../../../theme/useTheme';
import { formatAmount } from '../../../../utils/currency';

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

export default function ExpenseDetails() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { expenses, deleteExpense } = useSupabaseData();
  const { events } = useEvents();
  const { contacts } = useContacts();
  const { user } = useSupabaseAuth();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const [imageViewVisible, setImageViewVisible] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!events || !expenses) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerBlock}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Expense Details</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      </View>
    );
  }
  
  const expense = expenses.find(e => String(e.id) === String(expenseId));
  const event = events.find(e => String(e.id) === String(expense?.event_id));
  const cat = CATEGORIES_LIST.find(c => c.key === expense?.category) || CATEGORIES_LIST[0];

  if (!expense || !event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.notFoundHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.notFoundTitleText, { color: colors.textPrimary }]}>{t(EXPENSE_DETAILS.ERROR)}</Text>
        </View>
        <View style={styles.notFoundContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#FFC107" />
          <Text style={[styles.notFoundTitle, { color: colors.textPrimary }]}>{t(EXPENSE_DETAILS.EXPENSE_NOT_FOUND)}</Text>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
            {t(EXPENSE_DETAILS.EXPENSE_NOT_FOUND_MESSAGE)}
          </Text>
          <TouchableOpacity style={styles.notFoundButton} onPress={() => router.back()}>
            <Text style={styles.notFoundButtonText}>{t(EXPENSE_DETAILS.RETURN_TO_EVENT)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Helper function to get member info (check both contacts and user)
  const getMemberInfo = (participantData: any) => {
    // If it's the current user (user_id is set)
    if (participantData.user_id === user?.id) {
      return {
        name: user.user_metadata?.name || user.name || 'You',
        avatar: user.user_metadata?.avatar || user.avatar
      };
    }
    
    // If it's a contact (contact_id is set)
    if (participantData.contact_id) {
      const member = contacts.find((c: any) => c.id === participantData.contact_id);
      return {
        name: member?.name || t(EXPENSE_DETAILS.UNKNOWN_MEMBER),
        avatar: member?.avatar
      };
    }
    
    return {
      name: t(EXPENSE_DETAILS.UNKNOWN_MEMBER),
      avatar: undefined
    };
  };

  // Note: SupabaseDataContext uses different field names
  const paidByList = (expense.paid_by || [])
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any) => {
      const memberInfo = getMemberInfo(p);
      return { ...p, name: memberInfo.name, avatar: memberInfo.avatar };
    });
  const splitList = (expense.split_between || [])
    .filter((s: any) => s && typeof s === 'object')
    .map((s: any) => {
      const memberInfo = getMemberInfo(s);
      return { ...s, name: memberInfo.name, avatar: memberInfo.avatar };
    });

  const handleDelete = async () => {
    await deleteExpense(expense.id);
    router.replace(`/events/${event.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ minHeight: 32 }} />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.expenseAvatarBlock}>
          <TouchableOpacity activeOpacity={0.8} style={styles.expenseAvatarShadow}>
            <View style={[styles.expenseAvatar, { backgroundColor: cat.color }] }>
              <MaterialCommunityIcons name={cat.icon as any} size={48} color="#fff" />
            </View>
          </TouchableOpacity>
          </View>
        <View style={styles.expenseHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.expenseTitle, { color: colors.textPrimary }]} numberOfLines={2}>{expense.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>{new Date(expense.created_at).toLocaleString()}</Text>
            </View>
          </View>
          <Text style={[styles.expenseAmount, { color: colors.primary }]}>{formatAmount(expense.amount, event.currency)}</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="account-balance-wallet" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t(EXPENSE_DETAILS.PAID_BY)}</Text>
          </View>
          {paidByList.map(p => (
            <TouchableOpacity key={p.user_id || p.contact_id} style={styles.memberCard} activeOpacity={0.85}>
              <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
                {p.avatar ? (
                  <Image source={{ uri: p.avatar }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={18} color={colors.textSecondary} />
                )}
              </View>
              <Text style={[styles.memberName, { color: colors.textPrimary, fontWeight: 'bold' }]}>{p.name}</Text>
              <Text style={[styles.memberAmount, { color: colors.primary }]}>{formatAmount(p.amount, event.currency)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MaterialIcons name="group" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t(EXPENSE_DETAILS.SPLIT_BETWEEN)}</Text>
          </View>
          {splitList.map(s => (
            <TouchableOpacity key={s.user_id || s.contact_id} style={styles.memberCard} activeOpacity={0.85}>
              <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
                {s.avatar ? (
                  <Image source={{ uri: s.avatar }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={18} color={colors.textSecondary} />
                )}
              </View>
              <Text style={[styles.memberName, { color: colors.textPrimary, fontWeight: 'bold' }]}>{s.name}</Text>
              <Text style={[styles.memberAmount, { color: colors.primary }]}>{formatAmount(s.amount, event.currency)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {expense.image_uri ? (
          <>
            <TouchableOpacity style={styles.expenseImageBlock} onPress={() => setImageViewVisible(true)} activeOpacity={0.9}>
              <Image source={{ uri: expense.image_uri }} style={styles.expenseImage} />
            </TouchableOpacity>
            <Modal
              visible={imageViewVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setImageViewVisible(false)}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity style={{ position: 'absolute', top: 40, right: 30, zIndex: 2 }} onPress={() => setImageViewVisible(false)}>
                  <Ionicons name="close" size={36} color="#fff" />
                </TouchableOpacity>
                <Image source={{ uri: expense.image_uri }} style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 16 }} />
              </View>
            </Modal>
          </>
        ) : (
          <View style={styles.expenseImagePlaceholder}>
            <MaterialIcons name="image" size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No image</Text>
          </View>
        )}
        {expense.notes ? (
          <View style={styles.notesBlock}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <MaterialIcons name="sticky-note-2" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t(EXPENSE_DETAILS.NOTES)}</Text>
            </View>
            <Text style={[styles.notes, { color: colors.textPrimary, backgroundColor: colors.surface }]}>{expense.notes}</Text>
          </View>
        ) : null}
      </ScrollView>
      <View style={[styles.footerRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.editBtn} onPress={() => router.push(`/events/edit-expense/${expense.id}?eventId=${event.id}`)}>
          <Ionicons name="create-outline" size={20} color="#18181b" style={{ marginRight: 8 }} />
          <Text style={styles.editBtnText}>{t(EXPENSE_DETAILS.EDIT)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
          <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteBtnText}>{t(EXPENSE_DETAILS.DELETE)}</Text>
        </TouchableOpacity>
      </View>
      {showDeleteModal && (
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(EXPENSE_DETAILS.DELETE_CONFIRMATION)}</Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              {t(EXPENSE_DETAILS.DELETE_MESSAGE)}
            </Text>
            <View style={styles.modalActionsNew}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalBtnTextSecondary}>{t(EXPENSE_DETAILS.CANCEL)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleDelete}>
                <Text style={styles.modalBtnTextPrimary}>{t(EXPENSE_DETAILS.YES_DELETE)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20' },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 36,
    paddingBottom: 16,
  },
  expenseIconWrap: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  title: {
    color: '#fff', fontWeight: '600', fontSize: 22, textAlign: 'center', letterSpacing: 0.2, marginBottom: 2
  },
  date: { color: '#888', fontSize: 13 },
  amount: { color: '#FFD600', fontWeight: 'bold', fontSize: 22, marginLeft: 8 },
  imageBlock: { alignItems: 'center', marginBottom: 18 },
  image: { width: 260, height: 140, borderRadius: 16, resizeMode: 'cover' },
  section: { marginBottom: 18, paddingHorizontal: 18 },
  sectionTitle: { color: '#FFD600', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatarWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#23232a', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarImg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#444' },
  memberName: { color: '#fff', fontSize: 15, flex: 1 },
  memberAmount: { color: '#FFD600', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  notes: { color: '#fff', fontSize: 15, backgroundColor: '#23232a', borderRadius: 10, padding: 10, marginTop: 4 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, backgroundColor: '#181A20', borderTopWidth: 1, borderTopColor: '#23252C', position: 'absolute', left: 0, right: 0, bottom: 0 },
  editBtn: { flex: 1, backgroundColor: '#FFD600', borderRadius: 32, paddingVertical: 14, alignItems: 'center', marginRight: 12, flexDirection: 'row', justifyContent: 'center' },
  editBtnText: { color: '#18181b', fontWeight: 'bold', fontSize: 17 },
  deleteBtn: { flex: 1, backgroundColor: '#FF4444', borderRadius: 32, paddingVertical: 14, alignItems: 'center', marginLeft: 12, flexDirection: 'row', justifyContent: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  // Modal Styles
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalView: {
    backgroundColor: '#23232a',
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
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
  // Styles for Not Found screen
  notFoundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 48, 
    paddingBottom: 12,
  },
  backButton: {
    position: 'absolute',
    left: 18,
    top: 48,
    zIndex: 1,
  },
  notFoundTitleText: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  notFoundTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  notFoundText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  notFoundButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  notFoundButtonText: {
    color: '#18181b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  topBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  categoryIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTitle: {
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8,
  },
  expenseDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  expenseImageBlock: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#23232a',
  },
  expenseImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  expenseAvatarBlock: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  expenseAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  expenseAvatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23232a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseImagePlaceholder: {
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#23232a',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  notesBlock: {
    marginTop: 18,
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#23232a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtn: {
    marginTop: 24,
    marginLeft: 16,
    marginBottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
}); 