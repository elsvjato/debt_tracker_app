import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Animated, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));
  const [error, setError] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    const ok = await user.login(email, password);
    if (ok) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccessModal(false);
      }, 2000);
      setError(false);
    } else {
      setIsLoading(false);
      setError(true);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 32, marginBottom: 16 }}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold', marginTop: 16 }}>Welcome back 👋</Text>
      <Text style={{ color: '#bbb', fontSize: 16, marginTop: 8, marginBottom: 32 }}>Please enter your email & password to sign in.</Text>

      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#232323', borderRadius: 12, padding: 12 }}>
          <Ionicons name="mail-outline" size={20} color="gray" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, color: 'white', fontSize: 16 }}
            placeholder="Email"
            placeholderTextColor="gray"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>

      <Animated.View style={{ marginBottom: 24, transform: [{ translateX: shakeAnim }] }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#232323', borderRadius: 12, padding: 12, borderWidth: error ? 2 : 0, borderColor: error ? '#E53935' : 'transparent' }}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, color: 'white', fontSize: 16 }}
            placeholder="Password"
            placeholderTextColor="gray"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: 8 }}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            status={rememberMe ? 'checked' : 'unchecked'}
            onPress={() => setRememberMe(!rememberMe)}
            color="#FFC107"
            uncheckedColor="gray"
          />
          <Text style={{ color: 'white', fontSize: 16, marginLeft: 4 }}>Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={{ color: '#FFC107', fontSize: 16 }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ backgroundColor: '#FFC107', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: 'black', fontSize: 18, fontWeight: 'bold' }}>Sign in</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={{ color: 'white', fontSize: 16 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={{ color: '#FFC107', fontSize: 16 }}>Sign up</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={{ backgroundColor: '#232323', borderRadius: 24, padding: 32, alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FFC107', borderRadius: 999, width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="person" size={48} color="black" />
            </View>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Sign in Successful!</Text>
            <Text style={{ color: '#bbb', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>Please wait...</Text>
            <Text style={{ color: '#bbb', fontSize: 16, textAlign: 'center', marginBottom: 16 }}>You will be directed to the homepage.</Text>
            <ActivityIndicator size="large" color="#FFC107" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}); 