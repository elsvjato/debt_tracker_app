import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useSupabaseAuth } from './SupabaseAuthContext';

// Hook to get SupabaseDataContext if available
const useSupabaseDataIfAvailable = () => {
  try {
    const { useSupabaseData } = require('./SupabaseDataContext');
    return useSupabaseData();
  } catch {
    return null;
  }
};

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ContactContextProps {
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshContacts: () => Promise<void>;
}

const ContactContext = createContext<ContactContextProps | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  
  // Try to get SupabaseDataContext for synchronization
  const supabaseData = useSupabaseDataIfAvailable();

  // Loading user contacts from Supabase
  const fetchContacts = async () => {
    if (!user?.id) {
      setContacts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
      setContacts([]);
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, [user?.id]);

  // Synchronize with SupabaseDataContext if available
  useEffect(() => {
    if (supabaseData?.contacts) {
      setContacts(supabaseData.contacts);
      setLoading(supabaseData.loading);
    }
  }, [supabaseData?.contacts, supabaseData?.loading]);

  // Adding contact
  const addContact = async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return;
    
    // Use SupabaseDataContext if available
    if (supabaseData?.addContact) {
      await supabaseData.addContact(contact);
      return;
    }
    
    // Fallback to direct database access
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contact, user_id: user.id }])
      .select();
    if (error) {
      setError(error.message);
    } else if (data && data.length > 0) {
      setContacts(prev => [data[0], ...prev]);
    }
    setLoading(false);
  };

  // Updating contact
  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user?.id) return;
    
    // Use SupabaseDataContext if available
    if (supabaseData?.updateContact) {
      await supabaseData.updateContact(id, updates);
      return;
    }
    
    // Fallback to direct database access
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error) {
      setError(error.message);
    } else if (data && data.length > 0) {
      setContacts(prev => prev.map(c => c.id === id ? data[0] : c));
    }
    setLoading(false);
  };

  // Deleting contact
  const deleteContact = async (id: string) => {
    if (!user?.id) return;
    
    // Use SupabaseDataContext if available
    if (supabaseData?.deleteContact) {
      await supabaseData.deleteContact(id);
      return;
    }
    
    // Fallback to direct database access
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      setError(error.message);
    } else {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
    setLoading(false);
  };

  // Toggle favorite
  const toggleFavorite = async (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;
    await updateContact(id, { favorite: !contact.favorite });
  };

  const refreshContacts = fetchContacts;

  // Protection against errors if user becomes null
  if (!user && !loading) {
    return (
      <ContactContext.Provider value={{ 
        contacts: [], 
        addContact: async () => {}, 
        updateContact: async () => {}, 
        deleteContact: async () => {},
        toggleFavorite: async () => {},
        loading: false,
        error: null,
        refreshContacts: async () => {},
      }}>
        {children}
      </ContactContext.Provider>
    );
  }

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      addContact, 
      updateContact, 
      deleteContact, 
      toggleFavorite,
      loading,
      error,
      refreshContacts
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within ContactProvider');
  }
  return context;
}; 