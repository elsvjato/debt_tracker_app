import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContacts } from '../../../../contexts/ContactContext';
import { useSupabaseAuth } from '../../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../../contexts/SupabaseDataContext';
import { EXPENSE_CATEGORIES } from '../../../../i18n/strings';
import { useTranslation } from '../../../../i18n/useTranslation';
import { useTheme } from '../../../../theme/useTheme';
import { formatAmount, getCurrencySign } from '../../../../utils/currency';
import { uploadPhoto } from '../../../../utils/uploadPhoto';

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

export default function EditExpenseScreen() {
  const { expenseId, eventId } = useLocalSearchParams<{ expenseId: string; eventId: string }>();
  const { expenses, updateExpense, events } = useSupabaseData();
  const { contacts } = useContacts();
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const expense = expenses.find(e => e.id === expenseId);
  const event = events.find(e => e.id === eventId);
  const participants = (() => {
    const eventParticipants = (event?.participants || []).filter(p => p && typeof p === 'object' && p.id);
    
    // Add current user if not already in participants
    const userProfile = {
      id: user?.id || '',
      name: user?.user_metadata?.name || user?.name || 'You',
      email: user?.email || '',
      avatar: user?.user_metadata?.avatar || user?.avatar,
      favorite: true,
      isSelf: true,
    };
    
    // Check if user is already in participants
    const userExists = eventParticipants.some(p => p.email === user?.email);
    
    if (!userExists && user?.id) {
      return [userProfile, ...eventParticipants];
    }
    
    return eventParticipants;
  })();

  // Safe check
  if (!expense || !event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>Expense not found</Text>
      </View>
    );
  }

  // State management
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [notes, setNotes] = useState(expense.notes || '');
  const [category, setCategory] = useState(CATEGORIES_LIST.find(c => c.key === expense.category) || CATEGORIES_LIST[0]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [paidBy, setPaidBy] = useState<{ memberId: string; amount: string }[]>(
    expense.paid_by?.map(p => ({ 
      memberId: p.user_id || p.contact_id || '', 
      amount: p.amount.toString() 
    })).filter(p => p.memberId) || []
  );
  const [paidByError, setPaidByError] = useState('');
  const [splitByModalVisible, setSplitByModalVisible] = useState(false);
  const [splitMode, setSplitMode] = useState<'equally' | 'unequally'>('equally');
  const [splitBetween, setSplitBetween] = useState<{ memberId: string; amount: string }[]>(
    expense.split_between?.map(s => ({ 
      memberId: s.user_id || s.contact_id || '', 
      amount: s.amount.toString() 
    })).filter(s => s.memberId) || []
  );
  const [splitError, setSplitError] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(expense.image_uri);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageActionModalVisible, setImageActionModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignAction, setAssignAction] = useState<'add' | 'subtract'>();
  const [assignDiff, setAssignDiff] = useState(0);
  const [assignPending, setAssignPending] = useState(false);
  const [assignWasCancelled, setAssignWasCancelled] = useState(false);
  const [paidByErrorModalVisible, setPaidByErrorModalVisible] = useState(false);

  // Adding unknown participants to paidBy/splitBetween lists
  const paidByIds = paidBy.map(p => p.memberId);
  const splitIds = splitBetween.map(s => s.memberId);
  const unknownPaidBy = paidByIds.filter(id => !participants.some(p => p.id === id));
  const unknownSplit = splitIds.filter(id => !participants.some(p => p.id === id));
  const paidByList = [
    ...participants,
    ...unknownPaidBy.map(id => ({ id, name: 'Unknown Member', _unknown: true })),
  ];
  const splitList = [
    ...participants,
    ...unknownSplit.map(id => ({ id, name: 'Unknown Member', _unknown: true })),
  ];

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(CATEGORIES_LIST.find(c => c.key === expense.category) || CATEGORIES_LIST[0]);
      setNotes(expense.notes || '');
      setImageUri(expense.image_uri);
      setPaidBy(expense.paid_by?.map(p => ({ 
        memberId: p.user_id || p.contact_id || '', 
        amount: p.amount.toString() 
      })).filter(p => p.memberId) || []);
      setSplitBetween(expense.split_between?.map(s => ({ 
        memberId: s.user_id || s.contact_id || '', 
        amount: s.amount.toString() 
      })).filter(s => s.memberId) || []);
    }
  }, [expense]);

  // Split by logic
  const totalSplit = splitBetween.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);
  const splitValid = Math.abs(totalSplit - parseFloat(amount || '0')) < 0.01;
  const splitDiff = parseFloat(amount || '0') - totalSplit;

  // Adding auto-calculation of splitBetween for equally
  useEffect(() => {
    if (splitMode === 'equally' && splitBetween.length > 0 && amount) {
      const total = parseFloat(amount);
      const n = splitBetween.length;
      if (n === 0) return;
      const perPerson = Math.floor((total / n) * 100) / 100;
      let amounts = Array(n).fill(perPerson);
      let sum = perPerson * n;
      let diff = Math.round((total - sum) * 100) / 100;
      setSplitBetween(splitBetween.map((s, i) => ({ ...s, amount: amounts[i].toFixed(2) })));
      if (diff !== 0 && !assignPending && !assignWasCancelled) {
        setAssignAction(diff > 0 ? 'add' : 'subtract');
        setAssignDiff(Math.abs(diff));
        setAssignModalVisible(true);
        setAssignPending(true);
      }
      if (diff === 0) {
        setAssignPending(false);
        setAssignWasCancelled(false);
      }
    }
  }, [splitMode, splitBetween.length, amount, assignPending, assignWasCancelled]);

  const totalPaid = paidBy.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const paidByValid = Math.abs(totalPaid - parseFloat(amount || '0')) < 0.01;

  const handlePickImage = async () => {
    setImageActionModalVisible(false);
    setImageModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your media library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!expense || !title || !amount || paidBy.length === 0 || splitBetween.length === 0 || !splitValid) return;
    if (!paidByValid) {
      setPaidByErrorModalVisible(true);
      return;
    }
    let uploadedImageUri = imageUri;
    try {
      if (imageUri && imageUri !== expense.image_uri) {
        const fileName = `expense_${expense.id}.jpg`;
        uploadedImageUri = await uploadPhoto(imageUri, user?.id || '', fileName, 'expenses');
      }
      await updateExpense(
        expense.id,
        {
          title,
          amount: parseFloat(amount),
          currency: event?.currency || 'USD',
          category: category.key,
          notes,
          image_uri: uploadedImageUri,
          paid_by: paidBy.map(p => {
            if (p.memberId === user?.id) {
              return { user_id: p.memberId, amount: parseFloat(p.amount) };
            } else {
              return { contact_id: p.memberId, amount: parseFloat(p.amount) };
            }
          }),
          split_between: splitBetween.map(s => {
            if (s.memberId === user?.id) {
              return { user_id: s.memberId, amount: parseFloat(s.amount) };
            } else {
              return { contact_id: s.memberId, amount: parseFloat(s.amount) };
            }
          })
        }
      );
    router.back();
    } catch (e) {
      setPaidByError('Помилка завантаження фото');
    }
  };

  // Helper function to get participant name
  const getParticipantName = (participantId: string) => {
    // Check participants (including user profile)
    const participant = participants.find(p => p.id === participantId);
    if (participant) {
      return participant.name;
    }
    
    // Fallback to contacts
    const contact = contacts.find(c => c.id === participantId);
    return contact?.name || 'Unknown';
  };

  // type guard for unknown
  function isUnknownParticipant(item: any): item is { id: string; name: string; _unknown: boolean } {
    return Boolean(item && item._unknown);
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Edit Expense</Text>
        </View>
        <View style={styles.headerBlock}>
          <View style={[styles.expenseIconWrap, { backgroundColor: category.color }] }>
            <MaterialCommunityIcons name={category.icon as any} size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{expense?.title}</Text>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{expense?.created_at ? new Date(expense.created_at).toLocaleString() : ''}</Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.textPrimary }]}>{formatAmount(parseFloat(amount || '0'), event?.currency || 'USD')}</Text>
        </View>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Title</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]} 
          value={title} 
          onChangeText={setTitle} 
          placeholder={'Enter expense title'} 
          placeholderTextColor={theme.colors.textSecondary} 
        />
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Amount ({event?.currency || 'USD'})</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary }]} 
          value={amount} 
          onChangeText={setAmount} 
          placeholder={`${getCurrencySign(event?.currency || 'USD')}0`} 
          keyboardType="numeric" 
          placeholderTextColor={theme.colors.textSecondary} 
        />
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Category</Text>
        <TouchableOpacity style={[styles.selectInput, { backgroundColor: theme.colors.surface }]} onPress={() => setCategoryModalVisible(true)}>
          <MaterialCommunityIcons name={category.icon as any} size={20} color={category.color} style={{ marginRight: 8 }} />
          <Text style={[styles.selectText, { color: category.key === 'general' ? theme.colors.textSecondary : theme.colors.textPrimary }]}>
            {t(EXPENSE_CATEGORIES[category.key.toUpperCase() as keyof typeof EXPENSE_CATEGORIES])}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Paid by</Text>
        <TouchableOpacity 
          style={[
            styles.selectInput, 
            { backgroundColor: theme.colors.surface },
            !paidByValid && !!amount && paidBy.length > 0 && { borderColor: theme.colors.error, borderWidth: 1 }
          ]} 
          onPress={() => setPaidByModalVisible(true)}
        >
          <Text style={[styles.selectText, { color: paidBy.length === 0 ? theme.colors.textSecondary : theme.colors.textPrimary }]}>
            {paidBy.length === 0 ? 'Paid by' : paidBy.length === 1 ? getParticipantName(paidBy[0].memberId) : `${paidBy.length} people`}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Split between</Text>
        <TouchableOpacity style={[styles.selectInput, { backgroundColor: theme.colors.surface }]} onPress={() => setSplitByModalVisible(true)}>
          <Text style={[styles.selectText, { color: splitBetween.length === 0 ? theme.colors.textSecondary : theme.colors.textPrimary }]}>
            {splitBetween.length === 0 ? 'Split between' : splitBetween.length === participants.length ? 'Equally between all' : `${splitBetween.length} selected`}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Notes</Text>
        <TextInput 
          style={[
            styles.input, 
            { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, minHeight: 70, textAlignVertical: 'top' }
          ]} 
          value={notes} 
          onChangeText={setNotes} 
          placeholder={'Add a note'} 
          placeholderTextColor={theme.colors.textSecondary} 
          multiline 
        />
        <TouchableOpacity style={[styles.imageInput, { backgroundColor: theme.colors.surface }]} onPress={() => imageUri ? setImageActionModalVisible(true) : setImageModalVisible(true)}>
          {imageUri ? (
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            </View>
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={32} color={theme.colors.textSecondary} />
              <Text style={[styles.imageInputText, { color: theme.colors.textSecondary }]}>Add image</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      <View style={[styles.footerRow, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
      {assignWasCancelled && !splitValid && (
        <Text style={[styles.splitError, { color: theme.colors.error }]}>Assign remainder</Text>
      )}
      <Modal visible={paidByModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Paid by</Text>
            <FlatList
              data={paidByList}
              keyExtractor={item => item?.id || ''}
              renderItem={({ item }) => {
                if (!item) return null;
                const checked = paidBy.some(p => p.memberId === item.id);
                return (
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => {
                      if (checked) setPaidBy(paidBy.filter(p => p.memberId !== item.id));
                      else setPaidBy([...paidBy, { memberId: item.id, amount: paidBy.length === 0 ? amount : '' }]);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {checked && <MaterialCommunityIcons name="check-circle" size={22} color="#FFD600" />}
                      {!checked && <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color="#555" />}
                    </View>
                    <View style={styles.avatarWrap}>
                      <Ionicons name="person" size={18} color={isUnknownParticipant(item) ? '#aaa' : '#888'} />
                    </View>
                    <Text style={[styles.selectText, { color: isUnknownParticipant(item) ? '#aaa' : '#fff', fontStyle: isUnknownParticipant(item) ? 'italic' : 'normal' }]}>{item.name || 'Unknown'}</Text>
                    {checked && paidBy.length > 1 && (
                      <TextInput
                        style={styles.amountInput}
                        value={paidBy.find(p => p.memberId === item.id)?.amount || ''}
                        onChangeText={v => setPaidBy(paidBy.map(p => p.memberId === item.id ? { ...p, amount: v } : p))}
                        placeholder={formatAmount(0, event?.currency || 'USD')}
                        keyboardType="numeric"
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <View style={{ padding: 12, backgroundColor: '#181A20', borderRadius: 10, marginTop: 8 }}>
              <Text style={{ color: '#888', fontSize: 13 }}>Total paid: {formatAmount(totalPaid, event?.currency || 'USD')}</Text>
              {!paidByValid && (
                <Text style={{ color: '#FF4444', fontSize: 13, marginTop: 4 }}>
                  {totalPaid - parseFloat(amount || '0') > 0 ? `+${formatAmount(totalPaid - parseFloat(amount || '0'), event?.currency || 'USD')}` : formatAmount(totalPaid - parseFloat(amount || '0'), event?.currency || 'USD')}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setPaidByModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1 }, !paidByValid && { opacity: 0.5 }]}
                onPress={() => setPaidByModalVisible(false)}
                disabled={!paidByValid}
              >
                <Text style={[styles.saveBtnText, { color: theme.colors.textPrimary }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={splitByModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}> 
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
              <TouchableOpacity
                style={[styles.splitTab, splitMode === 'equally' && styles.splitTabActive]}
                onPress={() => setSplitMode('equally')}
              >
                <Text style={[styles.splitTabText, splitMode === 'equally' && styles.splitTabTextActive]}>Equally</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.splitTab, splitMode === 'unequally' && styles.splitTabActive]}
                onPress={() => setSplitMode('unequally')}
              >
                <Text style={[styles.splitTabText, splitMode === 'unequally' && styles.splitTabTextActive]}>Unequally</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={splitList}
              keyExtractor={item => item?.id || ''}
              renderItem={({ item }) => {
                if (!item) return null;
                const checked = splitBetween.some(s => s.memberId === item.id);
                return (
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => {
                      if (checked) setSplitBetween(splitBetween.filter(s => s.memberId !== item.id));
                      else setSplitBetween([...splitBetween, { memberId: item.id, amount: splitMode === 'equally' ? (parseFloat(amount || '0') / (splitBetween.length + 1)).toFixed(2) : '' }]);
                    }}
                  >
                    <View style={styles.checkbox}>
                      {checked && <MaterialCommunityIcons name="check-circle" size={22} color="#FFD600" />}
                      {!checked && <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color="#555" />}
                    </View>
                    <View style={styles.avatarWrap}>
                      <Ionicons name="person" size={18} color={isUnknownParticipant(item) ? '#aaa' : '#888'} />
                    </View>
                    <Text style={[styles.selectText, { color: isUnknownParticipant(item) ? '#aaa' : '#fff', fontStyle: isUnknownParticipant(item) ? 'italic' : 'normal' }]}>{item.name || 'Unknown'}</Text>
                    {checked && splitMode === 'unequally' && (
                      <TextInput
                        style={styles.amountInput}
                        value={splitBetween.find(s => s.memberId === item.id)?.amount || ''}
                        onChangeText={v => setSplitBetween(splitBetween.map(s => s.memberId === item.id ? { ...s, amount: v } : s))}
                        placeholder={formatAmount(0, event?.currency || 'USD')}
                        keyboardType="numeric"
                      />
                    )}
                    {checked && splitMode === 'equally' && (
                      <Text style={[styles.selectText, { color: '#FFD600', marginLeft: 8 }]}>
                        {formatAmount(parseFloat(splitBetween.find(s => s.memberId === item.id)?.amount || '0'), event?.currency || 'USD')}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            {splitMode === 'unequally' && splitValid === false && (
              <View style={styles.splitSummary}>
                <Text style={{ color: '#888', fontSize: 13 }}>Total split: {formatAmount(totalSplit, event?.currency || 'USD')}</Text>
                <Text style={{ color: '#FF4444', fontSize: 13, marginTop: 4 }}>
                  {splitDiff > 0 ? `+${formatAmount(splitDiff, event?.currency || 'USD')}` : formatAmount(splitDiff, event?.currency || 'USD')}
                </Text>
                <TouchableOpacity
                  style={styles.assignBtn}
                  onPress={() => {
                    setAssignAction(splitDiff > 0 ? 'add' : 'subtract');
                    setAssignDiff(Math.abs(splitDiff));
                    setAssignModalVisible(true);
                  }}
                >
                  <Text style={[styles.assignBtnText, { color: theme.colors.textPrimary }]}>Assign</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={[styles.cancelBtn, { flex: 1 }]} onPress={() => setSplitByModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 1 }, !splitValid && { opacity: 0.5 }]}
                onPress={() => setSplitByModalVisible(false)}
                disabled={!splitValid}
              >
                <Text style={[styles.saveBtnText, { color: theme.colors.textPrimary }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={categoryModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Category</Text>
            <FlatList
              data={CATEGORIES_LIST}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryRow}
                  onPress={() => {
                    setCategory(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <View style={styles.checkbox}>
                    {category.key === item.key && <MaterialCommunityIcons name="check-circle" size={22} color="#FFD600" />}
                    {category.key !== item.key && <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color="#555" />}
                  </View>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} style={{ marginRight: 8 }} />
                  <Text style={[styles.selectText, { color: '#fff', flex: 1 }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={[styles.modalButton, { flex: 1 }]} onPress={() => setCategoryModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1 }]}
                onPress={() => setCategoryModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={imageModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add image</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handlePickImage}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={() => setImageModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={imageActionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Image</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handlePickImage}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Change image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 8 }]}
              onPress={() => {
                setImageUri(undefined);
                setImageActionModalVisible(false);
              }}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Remove image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { marginTop: 8 }]} onPress={() => setImageActionModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={paidByErrorModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Paid by error</Text>
            <Text style={[styles.modalText, { color: theme.colors.textPrimary }]}>
              Paid by error message
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setPaidByErrorModalVisible(false)}>
              <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={assignModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {assignAction === 'add' ? 'Add' : 'Remove'} {formatAmount(assignDiff, event?.currency || 'USD')}
            </Text>
            <FlatList
              data={splitBetween.filter(s => s.memberId !== '')}
              keyExtractor={item => item.memberId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryRow}
                  onPress={() => {
                    const newAmount = assignAction === 'add'
                      ? (parseFloat(item.amount || '0') + assignDiff).toFixed(2)
                      : (parseFloat(item.amount || '0') - assignDiff).toFixed(2);
                    setSplitBetween(splitBetween.map(s => s.memberId === item.memberId ? { ...s, amount: newAmount } : s));
                    setAssignModalVisible(false);
                    setAssignPending(false);
                    setAssignWasCancelled(false);
                  }}
                >
                  <View style={styles.avatarWrap}>
                    <Ionicons name="person" size={18} color="#888" />
                  </View>
                  <Text style={{ color: '#fff', flex: 1 }}>{participants.find(p => p?.id === item.memberId)?.name || 'Unknown'}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setAssignModalVisible(false);
              setAssignPending(false);
              setAssignWasCancelled(true);
            }}>
              <Text style={{ color: '#FFD600', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  headerBlock: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  expenseIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  date: { color: '#888', fontSize: 14 },
  amount: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  selectInput: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
  },
  selectText: { flex: 1 },
  imageInput: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 16,
    minHeight: 120,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageInputText: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC107',
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: '#FFC107',
    fontWeight: 'bold',
    fontSize: 17,
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    backgroundColor: '#FFC107',
  },
  saveBtnText: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 17,
  },
  splitError: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    color: '#FF4444',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#23232a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
  modalText: { fontSize: 16, marginBottom: 18, textAlign: 'center' },
  modalButton: { backgroundColor: '#23232a', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', marginBottom: 8 },
  modalButtonText: { fontWeight: 'bold' },
  splitTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 4 },
  splitTabActive: { backgroundColor: '#FFC107' },
  splitTabText: { color: '#888', fontWeight: 'bold' },
  splitTabTextActive: { color: '#18181b' },
  splitSummary: { backgroundColor: '#181A20', borderRadius: 10, padding: 12, marginTop: 8 },
  assignBtn: { backgroundColor: '#FFC107', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, marginTop: 8 },
  assignBtnText: { color: '#18181b', fontWeight: 'bold', textAlign: 'center' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: { width: 22, marginRight: 8 },
  avatarWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#181A20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  amountInput: { backgroundColor: '#181A20', borderRadius: 8, padding: 8, color: '#fff', width: 100, textAlign: 'right' },
}); 