import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContacts } from '../../../contexts/ContactContext';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../../contexts/SupabaseDataContext';
import { ADD_EXPENSE, EXPENSE_CATEGORIES } from '../../../i18n/strings';
import { useTranslation } from '../../../i18n/useTranslation';
import { useTheme } from '../../../theme/useTheme';
import { formatAmount, getCurrencySign } from '../../../utils/currency';

// Categories with icons and colors 
const CATEGORIES_DATA = [
  { key: 'general', icon: 'file-document-outline', color: '#7B8FA1' },
  { key: 'games', icon: 'gamepad-variant', color: '#FF7043' },
  { key: 'movies', icon: 'movie-open', color: '#FF7043' },
  { key: 'music', icon: 'music', color: '#FF7043' },
  { key: 'sports', icon: 'basketball', color: '#FF7043' },
  { key: 'groceries', icon: 'cart', color: '#4CAF50' },
  { key: 'dining', icon: 'silverware-fork-knife', color: '#4CAF50' },
  { key: 'liquor', icon: 'glass-cocktail', color: '#4CAF50' },
  { key: 'shopping', icon: 'shopping', color: '#AB47BC' },
];

const AddExpenseScreen = () => {
  const { addExpense, refreshData } = useSupabaseData();
  const { events, contacts } = useSupabaseData();
  const { refreshContacts } = useContacts();
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const eventId = params.id || params.eventId;
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Refresh contacts when screen focuses
  useEffect(() => {
    refreshContacts();
  }, []);

  // State management
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState(CATEGORIES_DATA[0]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [paidByModalVisible, setPaidByModalVisible] = useState(false);
  const [paidBy, setPaidBy] = useState<{ memberId: string; amount: string }[]>([]);
  const [paidByError, setPaidByError] = useState('');
  const [splitByModalVisible, setSplitByModalVisible] = useState(false);
  const [splitMode, setSplitMode] = useState<'equally' | 'unequally'>('equally');
  const [splitBetween, setSplitBetween] = useState<{ memberId: string; amount: string }[]>([]);
  const [splitError, setSplitError] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignAction, setAssignAction] = useState<'add' | 'subtract'>();
  const [assignDiff, setAssignDiff] = useState(0);
  const [paidByErrorModalVisible, setPaidByErrorModalVisible] = useState(false);

  // Get event and participants
  const event = events.find(e => String(e.id) === String(eventId));
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

  // Image picker function
  const handlePickImage = async () => {
    setImageModalVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Validation
  const totalPaid = paidBy.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
  const paidByValid = Math.abs(totalPaid - parseFloat(amount || '0')) < 0.01;

  // Save expense function
  const handleSave = async () => {
    if (!title || !amount || paidBy.length === 0 || splitBetween.length === 0 || !splitValid) return;
    if (!paidByValid) {
      setPaidByErrorModalVisible(true);
      return;
    }
    
    // Convert to new structure: use user_id for user profile, contact_id for contacts
    const paid_by = paidBy.map(p => {
      if (p.memberId === user?.id) {
        return { user_id: p.memberId, amount: parseFloat(p.amount) };
      } else {
        return { contact_id: p.memberId, amount: parseFloat(p.amount) };
      }
    });
    
    const split_between = splitBetween.map(s => {
      if (s.memberId === user?.id) {
        return { user_id: s.memberId, amount: parseFloat(s.amount) };
      } else {
        return { contact_id: s.memberId, amount: parseFloat(s.amount) };
      }
    });
    
    await addExpense({
      event_id: String(eventId),
      title,
      amount: parseFloat(amount),
      currency: event?.currency || 'USD',
      category: category.key,
      notes,
      image_uri: imageUri,
      paid_by,
      split_between
    });
    await refreshData();
    router.back();
  };

  // Paid by logic
  const togglePaidBy = (memberId: string) => {
    if (paidBy.some(p => p.memberId === memberId)) {
      setPaidBy(paidBy.filter(p => p.memberId !== memberId));
    } else {
      setPaidBy([...paidBy, { memberId, amount: paidBy.length === 0 ? amount : '' }]);
    }
  };
  
  const setPaidByAmount = (memberId: string, value: string) => {
    setPaidBy(paidBy.map(p => p.memberId === memberId ? { ...p, amount: value } : p));
  };
  
  // Auto-fill amount if only one person is selected
  React.useEffect(() => {
    if (paidBy.length === 1) {
      setPaidBy([{ memberId: paidBy[0].memberId, amount: amount }]);
    }
  }, [amount, paidBy.length]);

  // Split by logic
  const toggleSplit = (memberId: string) => {
    if (splitBetween.some(s => s.memberId === memberId)) {
      setSplitBetween(splitBetween.filter(s => s.memberId !== memberId));
    } else {
      setSplitBetween([...splitBetween, { memberId, amount: '' }]);
    }
  };
  
  const setSplitAmount = (memberId: string, value: string) => {
    setSplitBetween(splitBetween.map(s => s.memberId === memberId ? { ...s, amount: value } : s));
  };
  
  // Auto-fill amounts in equally mode
  React.useEffect(() => {
    if (splitMode === 'equally' && splitBetween.length > 0 && amount) {
      const perPerson = (parseFloat(amount) / splitBetween.length).toFixed(2);
      setSplitBetween(splitBetween.map(s => ({ ...s, amount: perPerson })));
    }
  }, [splitMode, splitBetween.length, amount]);
  
  // Select all participants by default
  React.useEffect(() => {
    if (splitBetween.length === 0 && participants.length > 0) {
      setSplitBetween(participants.map(p => ({ memberId: p.id, amount: '' })));
    }
  }, [participants.length]);

  // Split validation
  const totalSplit = splitBetween.reduce((sum, s) => sum + parseFloat(s.amount || '0'), 0);
  const splitValid = Math.abs(totalSplit - parseFloat(amount || '0')) < 0.01;
  const splitDiff = parseFloat(amount || '0') - totalSplit;

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{t(ADD_EXPENSE.TITLE)}</Text>
          <View style={styles.headerBackBtn} />
        </View>
        
        {/* Title input */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.EXPENSE_NAME)}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} 
          value={title} 
          onChangeText={setTitle} 
          placeholder={t(ADD_EXPENSE.EXPENSE_NAME_PLACEHOLDER)} 
          placeholderTextColor={colors.textTertiary} 
        />
        
        {/* Amount input */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.AMOUNT)} ({event?.currency || 'USD'})</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]} 
          value={amount} 
          onChangeText={setAmount} 
          placeholder={`${getCurrencySign(event?.currency || 'USD')}0`} 
          keyboardType="numeric" 
          placeholderTextColor={colors.textTertiary} 
        />
        
        {/* Category selector */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.CATEGORY)}</Text>
        <TouchableOpacity style={[styles.selectInput, { backgroundColor: colors.inputBackground }]} onPress={() => setCategoryModalVisible(true)}>
          <MaterialCommunityIcons name={category.icon as any} size={20} color={category.color} style={{ marginRight: 8 }} />
          <Text style={{ color: category.key === 'general' ? colors.textTertiary : colors.textPrimary, flex: 1 }}>
            {t(EXPENSE_CATEGORIES[category.key.toUpperCase() as keyof typeof EXPENSE_CATEGORIES])}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
        
        {/* Paid by selector */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.PAID_BY)}</Text>
        <TouchableOpacity 
          style={[
            styles.selectInput, 
            { backgroundColor: colors.inputBackground },
            !paidByValid && !!amount && paidBy.length > 0 && { borderColor: colors.error, borderWidth: 1 }
          ]} 
          onPress={() => setPaidByModalVisible(true)}
        >
          <Text style={{ color: paidBy.length === 0 ? colors.textTertiary : colors.textPrimary, flex: 1 }}>
            {paidBy.length === 0 ? t(ADD_EXPENSE.SELECT_PAID_BY) : paidBy.length === 1 ? getParticipantName(paidBy[0].memberId) : `${paidBy.length} people`}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
        
        {/* Split by selector */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.SPLIT_BETWEEN)}</Text>
        <TouchableOpacity style={[styles.selectInput, { backgroundColor: colors.inputBackground }]} onPress={() => setSplitByModalVisible(true)}>
          <Text style={{ color: splitBetween.length === 0 ? colors.textTertiary : colors.textPrimary, flex: 1 }}>
            {splitBetween.length === 0 ? t(ADD_EXPENSE.SELECT_SPLIT_BETWEEN) : splitBetween.length === participants.length ? 'Equally between all' : `${splitBetween.length} selected`}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
        
        {/* Notes input */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t(ADD_EXPENSE.NOTES)}</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary, minHeight: 70, textAlignVertical: 'top' }]} 
          value={notes} 
          onChangeText={setNotes} 
          placeholder={t(ADD_EXPENSE.NOTES_PLACEHOLDER)} 
          placeholderTextColor={colors.textTertiary} 
          multiline 
        />
        
        {/* Image picker */}
        <TouchableOpacity style={[styles.imageInput, { backgroundColor: colors.inputBackground }]} onPress={() => setImageModalVisible(true)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <>
              <MaterialCommunityIcons name="image-plus" size={32} color={colors.textTertiary} />
              <Text style={{ color: colors.textTertiary, marginTop: 8 }}>{t(ADD_EXPENSE.ADD_RECEIPT)}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {/* Footer with buttons */}
      <View style={[styles.footerRow, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Text style={[styles.cancelBtnText, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.CANCEL)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveBtn, 
            { backgroundColor: colors.primary },
            (!title || !amount || paidBy.length === 0 || splitBetween.length === 0 || !splitValid || !paidByValid) && { opacity: 0.5 }
          ]}
          onPress={handleSave}
          disabled={!title || !amount || paidBy.length === 0 || splitBetween.length === 0 || !splitValid || !paidByValid}
        >
          <Text style={[styles.saveBtnText, { color: colors.background }]}>{t(ADD_EXPENSE.SAVE_EXPENSE)}</Text>
        </TouchableOpacity>
      </View>

      {/* Image picker modal */}
      <Modal visible={imageModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.ADD_RECEIPT)}</Text>
            <TouchableOpacity style={styles.imageOption} onPress={handlePickImage}>
              <MaterialCommunityIcons name="image" size={28} color={colors.info} />
              <Text style={{ color: colors.textPrimary, marginLeft: 12 }}>Select from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setImageModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t(ADD_EXPENSE.CANCEL)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category selection modal */}
      <Modal visible={categoryModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.CATEGORY)}</Text>
            <FlatList
              data={CATEGORIES_DATA}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryRow}
                  onPress={() => { setCategory(item); setCategoryModalVisible(false); }}
                >
                  <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} style={{ marginRight: 12 }} />
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>{t(EXPENSE_CATEGORIES[item.key.toUpperCase() as keyof typeof EXPENSE_CATEGORIES])}</Text>
                  {category.key === item.key && <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => setCategoryModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t(ADD_EXPENSE.CANCEL)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Paid by selection modal */}
      <Modal visible={paidByModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.PAID_BY)}</Text>
            <FlatList
              data={participants}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const checked = paidBy.some(p => p.memberId === item.id);
                return (
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => togglePaidBy(item.id)}
                  >
                    <View style={styles.checkbox}>
                      {checked && <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />}
                      {!checked && <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color={colors.textTertiary} />}
                    </View>
                    <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
                      <Ionicons name="person" size={18} color={colors.textTertiary} />
                    </View>
                    <Text style={{ color: colors.textPrimary, flex: 1 }}>
                      {item.name}
                    </Text>
                    {checked && paidBy.length > 1 && (
                      <TextInput
                        style={[styles.amountInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
                        value={paidBy.find(p => p.memberId === item.id)?.amount || ''}
                        onChangeText={v => setPaidByAmount(item.id, v)}
                        placeholder={formatAmount(0, event?.currency || 'USD')}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textTertiary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            <View style={[styles.totalRow, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                Total paid: {formatAmount(totalPaid, event?.currency || 'USD')}
              </Text>
              {!paidByValid && (
                <Text style={{ color: colors.error, fontSize: 13, marginTop: 4 }}>
                  {totalPaid - parseFloat(amount || '0') > 0 ? `+${formatAmount(totalPaid - parseFloat(amount || '0'), event?.currency || 'USD')}` : formatAmount(totalPaid - parseFloat(amount || '0'), event?.currency || 'USD')}
                </Text>
              )}
            </View>
            <TouchableOpacity style={[styles.modalButton, !paidByValid && { opacity: 0.5 }]} onPress={() => setPaidByModalVisible(false)} disabled={!paidByValid}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Split by selection modal */}
      <Modal visible={splitByModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.SPLIT_BETWEEN)}</Text>
            <View style={styles.splitModeRow}>
              <TouchableOpacity
                style={[styles.splitModeBtn, splitMode === 'equally' && { backgroundColor: colors.primary }]}
                onPress={() => setSplitMode('equally')}
              >
                <Text style={[styles.splitModeText, splitMode === 'equally' && { color: colors.background }]}>{t(ADD_EXPENSE.EQUALLY)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.splitModeBtn, splitMode === 'unequally' && { backgroundColor: colors.primary }]}
                onPress={() => setSplitMode('unequally')}
              >
                <Text style={[styles.splitModeText, splitMode === 'unequally' && { color: colors.background }]}>{t(ADD_EXPENSE.UNEQUALLY)}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={participants}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const checked = splitBetween.some(s => s.memberId === item.id);
                return (
                  <TouchableOpacity
                    style={styles.categoryRow}
                    onPress={() => toggleSplit(item.id)}
                  >
                    <View style={styles.checkbox}>
                      {checked && <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />}
                      {!checked && <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={22} color={colors.textTertiary} />}
                    </View>
                    <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
                      <Ionicons name="person" size={18} color={colors.textTertiary} />
                    </View>
                    <Text style={{ color: colors.textPrimary, flex: 1 }}>
                      {item.name}
                    </Text>
                    {checked && splitMode === 'unequally' && (
                      <TextInput
                        style={[styles.amountInput, { backgroundColor: colors.background, color: colors.textPrimary }]}
                        value={splitBetween.find(s => s.memberId === item.id)?.amount || ''}
                        onChangeText={v => setSplitAmount(item.id, v)}
                        placeholder={formatAmount(0, event?.currency || 'USD')}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textTertiary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
            {!splitValid && (
              <View style={[styles.errorRow, { backgroundColor: colors.error }]}>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>
                  {splitDiff > 0 ? `Add ${formatAmount(splitDiff, event?.currency || 'USD')}` : `Remove ${formatAmount(-splitDiff, event?.currency || 'USD')}`}
                </Text>
                <TouchableOpacity
                  style={[styles.assignBtn, { backgroundColor: colors.textPrimary }]}
                  onPress={() => {
                    setAssignAction(splitDiff > 0 ? 'add' : 'subtract');
                    setAssignDiff(Math.abs(splitDiff));
                    setAssignModalVisible(true);
                  }}
                >
                  <Text style={[styles.assignBtnText, { color: colors.error }]}>Assign</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={() => setSplitByModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Assign modal */}
      <Modal visible={assignModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
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
                    setSplitAmount(item.memberId, newAmount);
                    setAssignModalVisible(false);
                  }}
                >
                  <View style={[styles.avatarWrap, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person" size={18} color={colors.textTertiary} />
                  </View>
                  <Text style={{ color: colors.textPrimary, flex: 1 }}>
                    {getParticipantName(item.memberId)}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => setAssignModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t(ADD_EXPENSE.CANCEL)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Paid by error modal */}
      <Modal visible={paidByErrorModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t(ADD_EXPENSE.ERROR_AMOUNT_MISMATCH)}</Text>
            <Text style={{ color: colors.error, fontSize: 16, marginBottom: 18, textAlign: 'center' }}>
              {t(ADD_EXPENSE.ERROR_AMOUNT_MISMATCH)} ({formatAmount(parseFloat(amount || '0'), event?.currency || 'USD')}). Please adjust the values.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setPaidByErrorModalVisible(false)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Original styles with theme colors
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
    textAlign: 'center',
    letterSpacing: 0.2,
  },
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
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  amountInput: {
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: 'right',
  },
  splitModeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  splitModeBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  splitModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
  },
  assignBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  assignBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
});

export default AddExpenseScreen; 