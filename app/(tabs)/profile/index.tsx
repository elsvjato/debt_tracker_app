import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabaseAuth } from '../../../contexts/SupabaseAuthContext';
import { useTheme } from '../../../theme/useTheme';

function DebugRenderLogger({ label }: { label: string }) {
  useEffect(() => {
    console.log(`[DebugRenderLogger] Mounted: ${label}`);
    return () => {
      console.log(`[DebugRenderLogger] Unmounted: ${label}`);
    };
  }, []);
  console.log(`[DebugRenderLogger] Render: ${label}`);
  return null;
}

export default function Profile() {
  console.log('[Profile] Starting render');
  const { user, logout } = useSupabaseAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  console.log('[Profile] User found, continuing render');

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Account</Text>
      </View>
      <View style={styles.profileSection}>
        {user?.user_metadata?.avatar || user?.avatar ? (
          <Image source={{ uri: user.user_metadata?.avatar || user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }]}> 
            <Ionicons name="person" size={48} color={colors.textTertiary} />
          </View>
        )}
        <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.user_metadata?.name || user?.name || ''}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || ''}</Text>
      </View>
      <View style={[styles.optionsSection, { backgroundColor: colors.cardBackground }]}> 
        <ProfileOption icon="person-outline" text="Personal Info" onPress={() => router.push('/(tabs)/profile/personal-info')} />
        <ProfileOption icon="color-palette-outline" text="App Appearance" onPress={() => router.push('/(tabs)/profile/appearance')} />
        <ProfileOption icon="help-circle-outline" text="Help" onPress={() => router.push('/(tabs)/profile/help')} />
        <ProfileOption icon="information-circle-outline" text="About Us" onPress={() => router.push('/(tabs)/profile/about')} />
      </View>
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: 'rgba(255,68,68,0.08)' }]} 
        onPress={() => setShowLogoutModal(true)} 
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={22} color="#FF4444" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      {showLogoutModal && (
        <Modal visible={showLogoutModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalView, { backgroundColor: colors.cardBackground }]}> 
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Logout</Text>
              <Text style={[styles.modalText, { color: colors.textSecondary }]}>Are you sure you want to logout?</Text>
              <View style={styles.modalActionsNew}>
                <TouchableOpacity 
                  style={[styles.modalBtnSecondary, { borderColor: colors.primary }]} 
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.modalBtnTextSecondary, { color: colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtnPrimary, { backgroundColor: colors.primary }]} 
                  onPress={handleLogout}
                >
                  <Text style={[styles.modalBtnTextPrimary, { color: colors.background }]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function ProfileOption({ icon, text, onPress }: { icon: any; text: string; onPress: () => void }) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.optionItem, { borderBottomColor: colors.border }]} 
      onPress={onPress} 
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={24} color={colors.primary} style={{ marginRight: 18 }} />
      <Text style={[styles.optionText, { color: colors.textPrimary }]}>{text}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 2,
  },
  email: {
    fontSize: 15,
    marginBottom: 8,
  },
  optionsSection: {
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 32,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 17,
    fontWeight: 'bold',
  },
  // Modal Styles
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
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBtnSecondary: {
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalBtnTextPrimary: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnTextSecondary: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 