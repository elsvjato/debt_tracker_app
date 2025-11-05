import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import { CONTACT_DETAILS } from '../../i18n/strings';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { formatAmount } from '../../utils/currency';

export default function ContactDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useSupabaseAuth();
  const { events, getExpensesByEvent, contacts, refreshData, deleteContact, updateContact } = useSupabaseData();

  const contact = contacts.find(c => String(c.id) === String(id));

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(contact?.name || '');
  const [editEmail, setEditEmail] = useState(contact?.email || '');
  const [editAvatar, setEditAvatar] = useState<string | undefined>(contact?.avatar);
  const [editError, setEditError] = useState('');
  const [hasNewImage, setHasNewImage] = useState(false);

  // Refresh data when screen focuses
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Update edit state when contact changes
  useEffect(() => {
    if (contact) {
      console.log('🔥🔥🔥 Contact changed, updating edit state');
      console.log('🔥🔥🔥 Contact avatar:', contact.avatar);
      setEditName(contact.name || '');
      setEditEmail(contact.email || '');
      // Only update editAvatar if no new image has been selected
      if (!hasNewImage) {
        setEditAvatar(contact.avatar);
        console.log('🔥🔥🔥 EditAvatar set to:', contact.avatar);
      } else {
        console.log('🔥🔥🔥 Skipping editAvatar update - new image selected');
      }
    }
  }, [contact, hasNewImage]);

  // Calculate event balances using optimal transactions between user and contact
  const eventBalances = useMemo(() => {
    if (!contact || !user) return [];

    const balances: { event: any; amount: number; currency: string; type: 'youOwe' | 'theyOwe' }[] = [];

    events.forEach(event => {
      // Find user participant - check both participants list and user ID
      let userParticipant = event.participants?.find(p => p.email === user.email);
      
      // If user is not in participants list, create a virtual participant
      if (!userParticipant && user?.id) {
        userParticipant = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.name || 'You'
        } as any;
      }
      
      const contactParticipant = event.participants?.find(p => p.id === contact.id);
      if (!userParticipant || !contactParticipant) return;

      const eventExpenses = getExpensesByEvent(event.id);

      // 1. Calculate balances for all participants
      const participantBalances: Record<string, number> = {};
      
      // Initialize all participants including the current user
      event.participants?.forEach(p => {
        if (p && p.id) participantBalances[p.id] = 0;
      });
      
      // Add current user if not already in participants
      if (user?.id && !participantBalances.hasOwnProperty(user.id)) {
        participantBalances[user.id] = 0;
      }
      
      eventExpenses.forEach(expense => {
        expense.paid_by?.forEach(pb => {
          const participantId = pb.user_id || pb.contact_id;
          if (participantId && typeof pb.amount === 'number') {
            participantBalances[participantId] = (participantBalances[participantId] || 0) + pb.amount;
          }
        });
        expense.split_between?.forEach(sb => {
          const participantId = sb.user_id || sb.contact_id;
          if (participantId && typeof sb.amount === 'number') {
            participantBalances[participantId] = (participantBalances[participantId] || 0) - sb.amount;
          }
        });
      });

      // 2. Build optimal transactions for this event
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

      // 3. Find transaction between user and contact
      const txToUser = transactions.find(tx => tx.from === contactParticipant.id && tx.to === userParticipant.id);
      const txFromUser = transactions.find(tx => tx.from === userParticipant.id && tx.to === contactParticipant.id);

      if (txToUser) {
        // Contact owes user (green)
        balances.push({
          event,
          amount: txToUser.amount,
          currency: event.currency,
          type: 'theyOwe'
        });
      } else if (txFromUser) {
        // User owes contact (red)
        balances.push({
          event,
          amount: txFromUser.amount,
          currency: event.currency,
          type: 'youOwe'
        });
      }
    });

    return balances;
  }, [events, getExpensesByEvent, user, contact]);

  if (!contact) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>{t(CONTACT_DETAILS.CONTACT_NOT_FOUND)}</Text>
      </SafeAreaView>
    );
  }

  const handleDelete = async () => {
    console.log('🔥🔥🔥 DELETE CONTACT STARTED 🔥🔥🔥', contact.id);
    setModalVisible(false);
    
    // Start deletion (it's now optimistic, so we don't need to wait)
    console.log('🔥 Calling deleteContact function...');
    deleteContact(contact.id);
    console.log('🔥🔥🔥 CONTACT DELETION STARTED (optimistic) 🔥🔥🔥');
    
    // Navigate back immediately
    router.back();
  };

  const handlePickImage = async () => {
    console.log('🔥🔥🔥 PICKING IMAGE STARTED 🔥🔥🔥');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t(CONTACT_DETAILS.PERMISSION_REQUIRED), t(CONTACT_DETAILS.PERMISSION_MESSAGE));
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    console.log('🔥🔥🔥 Image picker result:', result);
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      console.log('🔥🔥🔥 Selected image URI:', selectedImage.uri);
      
      // Show the selected image immediately
      setEditAvatar(selectedImage.uri);
      setHasNewImage(true);
      console.log('🔥🔥🔥 EditAvatar state set to:', selectedImage.uri);
      console.log('🔥🔥🔥 hasNewImage set to true');
      
      // Upload the image immediately in background
      if (user && contact) {
        console.log('🔥🔥🔥 Starting immediate image upload...');
        const fileName = `contact_${Date.now()}.jpg`;
        
        try {
          // Import uploadPhoto function
          const { uploadPhoto } = await import('../../utils/uploadPhoto');
          const storagePath = await uploadPhoto(selectedImage.uri, user.id, fileName, 'image/jpeg');
          
          // Update the avatar with the storage path
          setEditAvatar(storagePath);
          console.log('🔥🔥🔥 Image uploaded successfully:', storagePath);
        } catch (error) {
          console.error('🔥🔥🔥 Error uploading image:', error);
          // Keep the local URI if upload fails
        }
      }
    } else {
      console.log('🔥🔥🔥 Image selection canceled or failed');
    }
  };

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert(t(CONTACT_DETAILS.FILL_ALL_FIELDS), t(CONTACT_DETAILS.FILL_ALL_FIELDS));
      return;
    }
    if (!editEmail.includes('@')) {
      Alert.alert(t(CONTACT_DETAILS.VALID_EMAIL), t(CONTACT_DETAILS.VALID_EMAIL));
      return;
    }
    
    if (contact) {
      console.log('🔥🔥🔥 SAVING CONTACT CHANGES 🔥🔥🔥');
      console.log('🔥 Name:', editName);
      console.log('🔥 Email:', editEmail);
      console.log('🔥 Avatar:', editAvatar);
      
      // Photo is already uploaded, so save is instant
      updateContact(contact.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        avatar: editAvatar
      });
      
      console.log('🔥🔥🔥 CONTACT UPDATE STARTED (instant - photo already uploaded) 🔥🔥🔥');
      
      // Exit edit mode immediately
      setEditMode(false);
      setHasNewImage(false);
    }
  };

  const handleCancel = () => {
    setEditName(contact?.name || '');
    setEditEmail(contact?.email || '');
    setEditAvatar(contact?.avatar);
    setHasNewImage(false);
    setEditMode(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {editMode ? (
        // Edit Mode - looks like personal-info page
        <>
          <TouchableOpacity style={styles.backBtn} onPress={() => setEditMode(false)}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
          <Text style={[styles.editTitle, { color: colors.textPrimary }]}>{t(CONTACT_DETAILS.EDIT)}</Text>
          <View style={styles.avatarSection}>
            <View>
              <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
                {editAvatar ? (
                  <Image source={{ uri: editAvatar }} style={styles.avatar} />
                ) : contact?.avatar ? (
                  <Image source={{ uri: contact.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}> 
                    <Ionicons name="person" size={48} color={colors.textSecondary} />
          </View>
        )}
      </TouchableOpacity>
              <View style={styles.editAvatarBtn}>
                <Ionicons name="pencil" size={18} color="#18181b" />
              </View>
            </View>
          </View>
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t(CONTACT_DETAILS.NAME_PLACEHOLDER)}</Text>
          <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]} 
              value={editName} 
              onChangeText={setEditName} 
              placeholder={t(CONTACT_DETAILS.NAME_PLACEHOLDER)} 
              placeholderTextColor={colors.textSecondary} 
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t(CONTACT_DETAILS.EMAIL_PLACEHOLDER)}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary }]} 
              value={editEmail} 
              onChangeText={setEditEmail} 
              placeholder={t(CONTACT_DETAILS.EMAIL_PLACEHOLDER)}
              placeholderTextColor={colors.textSecondary} 
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{t(CONTACT_DETAILS.SAVE)}</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Normal Mode - contact details
        <>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{position: 'absolute', left: 16}}>
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{t(CONTACT_DETAILS.TITLE)}</Text>
            <TouchableOpacity 
              onPress={() => {
                if (contact) {
                }
              }} 
              style={{position: 'absolute', right: 16}}
            >
              <Ionicons 
                name={contact?.favorite ? 'star' : 'star-outline'} 
                size={26} 
                color={contact?.favorite ? '#FFC107' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileSection}>
            {contact?.avatar ? (
              <Image source={{ uri: contact.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{fontSize: 48, color: '#fff'}}>{(contact?.name[0] || '').toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.name}>{contact?.name}</Text>
            <Text style={styles.email}>{contact?.email}</Text>
          </View>

          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Shared Events</Text>
            {eventBalances.length === 0 ? (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No debts with this contact 🎉</Text>
              </View>
            ) : (
              eventBalances.map(({ event, amount, currency, type }) => {
                const contactOwesUser = type === 'theyOwe'; // Зелений - контакт має вам скинути
                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventTile}
                    activeOpacity={0.8}
                    onPress={() => {
                      // Navigate with longer delay to allow data loading
                      router.back();
                      setTimeout(() => {
                        router.push(`/(tabs)/events/${event.id}`);
                      }, 300);
                    }}
                  >
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.balanceContainer}>
                      <Text style={[styles.balanceAmount, contactOwesUser ? styles.balanceOwed : styles.balanceOwe]}>
                        {formatAmount(amount, currency)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
              <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.deleteButtonText}>Delete Contact</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {modalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Delete Contact</Text>
            <Text style={styles.modalText}>Delete "{contact?.name}" from your contacts?</Text>
            <View style={styles.modalActionsNew}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleDelete}>
                <Text style={styles.modalBtnTextPrimary}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 36,
    paddingBottom: 16,
    position: 'relative',
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 22,
    letterSpacing: 0.2,
  },
  editTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 24,
    alignSelf: 'center',
    marginBottom: 12,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#23232a',
  },
  avatarEditIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFC107',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: '#18181b',
  },
  editInput: {
    backgroundColor: '#23232a',
    color: '#fff',
    fontSize: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 0,
    width: 200,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 2,
  },
  email: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 8,
  },
  eventsSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noEventsContainer: {
    backgroundColor: '#23232a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  noEventsText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  eventTile: {
    backgroundColor: '#23232a',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  eventTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    flex: 1,
  },
  balanceContainer: {
    marginLeft: 8,
  },
  balanceAmount: {
    fontWeight: 'bold',
    fontSize: 20,
    minWidth: 80,
    textAlign: 'right',
  },
  balanceOwe: {
    color: '#FF4444',
  },
  balanceOwed: {
    color: '#2ECC71',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginHorizontal: 24,
    marginBottom: 32,
  },
  editButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: '#FFC107',
    borderWidth: 1,
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  editButtonText: {
    color: '#FFC107',
    fontSize: 17,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.08)',
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF4444',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FFC107',
    borderRadius: 32,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#18181b',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
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
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 50,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#FFC107',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#18181b',
  },

  inputSection: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#23232a',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500',
  },
  saveBtn: {
    backgroundColor: '#FFC107',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 16,
    marginTop: 16,
  },
});
