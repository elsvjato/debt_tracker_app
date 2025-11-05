import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { useTheme } from '../theme/useTheme';
import { checkForLocalData, migrateDataToSupabase } from '../utils/migrateToSupabase';

interface MigrationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MigrationModal: React.FC<MigrationModalProps> = ({ visible, onClose }) => {
  const { user } = useSupabaseAuth();
  const { refreshData } = useSupabaseData();
  const { colors } = useTheme();
  const [isMigrating, setIsMigrating] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  React.useEffect(() => {
    if (visible) {
      checkForLocalData().then(setHasLocalData);
    }
  }, [visible]);

  const handleMigration = async () => {
    if (!user) return;

    setIsMigrating(true);
    try {
      const result = await migrateDataToSupabase(user.id);
      if (result.success) {
        await refreshData();
        onClose();
      }
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  if (!hasLocalData) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            Migrate Local Data
          </Text>
          <Text style={[styles.modalText, { color: colors.textSecondary }]}>
            We found local data on your device. Would you like to migrate it to your cloud account? This will make your data available across all your devices.
          </Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalBtnSecondary, { borderColor: colors.primary }]} 
              onPress={onClose}
              disabled={isMigrating}
            >
              <Text style={[styles.modalBtnTextSecondary, { color: colors.primary }]}>
                Skip
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]} 
              onPress={handleMigration}
              disabled={isMigrating}
            >
              {isMigrating ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.modalBtnTextPrimary, { color: colors.background }]}>
                  Migrate
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    borderRadius: 18,
    padding: 28,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnSecondary: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  modalBtnTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnPrimary: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 