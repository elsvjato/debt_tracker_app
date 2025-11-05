import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

interface AuthContextProps {
  user: any;
  loading: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false); // Always false to show onboarding every time

  useEffect(() => {
    // Check current user and onboarding status on start
    const initializeApp = async () => {
      try {
        setOnboardingCompleteState(false);

        const { data, error } = await supabase.auth.getSession();
        console.log('Session check:', { data, error });
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Subscribe to session changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, session });
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const setOnboardingComplete = async (complete: boolean) => {
    try {
      setOnboardingCompleteState(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { error: error?.message || null };
  };

  const register = async (email: string, password: string, name?: string) => {
    setLoading(true);
    console.log('Attempting to register user:', { email, name });
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name || '',
          full_name: name || ''
        }
      }
    });
    
    console.log('Registration response:', { data, error });
    
    if (!error && data.user) {
      console.log('User registered successfully:', data.user);
      // No client-side profile upsert! Only DB trigger handles this.
      // Check if user email is confirmed
      if (data.user.email_confirmed_at) {
        console.log('User email is confirmed');
      } else {
        console.log('User email needs confirmation');
      }
    }
    
    setLoading(false);
    return { error: error?.message || null };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const getUserProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      onboardingComplete, 
      setOnboardingComplete,
      login, 
      register, 
      logout,
      getUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return ctx;
}; 