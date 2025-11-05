import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useSupabaseAuth } from './SupabaseAuthContext';

// Types for data
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  currency: string;
  category: string;
  emoji?: string;
  image?: string;
  image_uri?: string;
  created_at: string;
  updated_at: string;
  participants?: Contact[];
}

export interface Expense {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  notes?: string;
  image_uri?: string;
  created_at: string;
  updated_at: string;
  paid_by?: { contact_id?: string; user_id?: string; amount: number; contact?: Contact }[];
  split_between?: { contact_id?: string; user_id?: string; amount: number; contact?: Contact }[];
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme_mode: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SupabaseDataContextType {
  // Contacts
  contacts: Contact[];
  loading: boolean;
  addContact: (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { participants: Contact[] }) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event> & { participants?: Contact[] }) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
    paid_by: { contact_id?: string; user_id?: string; amount: number }[];
    split_between: { contact_id?: string; user_id?: string; amount: number }[];
  }) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense> & {
    paid_by?: { contact_id?: string; user_id?: string; amount: number }[];
    split_between?: { contact_id?: string; user_id?: string; amount: number }[];
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByEvent: (eventId: string) => Expense[];
  
  // Settings
  settings: UserSettings | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  
  // Utils
  refreshData: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export const SupabaseDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSupabaseAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Data loading
  const loadData = async () => {
    if (!user) {
      setContacts([]);
      setEvents([]);
      setExpenses([]);
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Loading contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);

      // Loading events with participants
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          event_participants(
            contact_id,
            contacts(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      
      // Processing events with participants
      const processedEvents = (eventsData || []).map(event => {
        const eventParticipants = event.event_participants?.map((ep: any) => ep.contacts) || [];
        
        // Always add user profile first if user exists
        const participants = user ? [
          {
            id: user.id,
            user_id: user.id,
            name: user.user_metadata?.name || user.name || '',
            email: user.email || '',
            avatar: user.user_metadata?.avatar || user.avatar,
            favorite: true,
            isSelf: true,
          },
          ...eventParticipants
        ] : eventParticipants;
        
        return {
        ...event,
          participants
        };
      });
      setEvents(processedEvents);

      // Loading expenses with details
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          expense_paid_by(
            contact_id,
            user_id,
            amount,
            contacts(*)
          ),
          expense_split_between(
            contact_id,
            user_id,
            amount,
            contacts(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;
      
      // Processing expenses with details
      const processedExpenses = (expensesData || []).map(expense => ({
        ...expense,
        paid_by: expense.expense_paid_by?.map((pb: any) => ({
          contact_id: pb.contact_id,
          user_id: pb.user_id,
          amount: pb.amount,
          contact: pb.contacts
        })) || [],
        split_between: expense.expense_split_between?.map((sb: any) => ({
          contact_id: sb.contact_id,
          user_id: sb.user_id,
          amount: sb.amount,
          contact: sb.contacts
        })) || []
      }));
      setExpenses(processedExpenses);

      // Loading settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      setSettings(settingsData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Functions for working with contacts
  const addContact = async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contacts')
      .insert([{ ...contact, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    
    // Update local state immediately (like in EventContext)
    setContacts(prev => [...prev, data]);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    if (!user) return;

    console.log('🔥🔥🔥 SupabaseDataContext updateContact: starting optimistic update for contact', id);
    console.log('🔥🔥🔥 Updates:', updates);

    // Optimistic update - update UI immediately
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c));
    console.log('🔥🔥🔥 Contact updated in UI immediately');

    // Update database in background
    const updateInDatabase = async () => {
      try {
        console.log('🔥🔥🔥 Starting background update in database...');
        
        const { data, error } = await supabase
          .from('contacts')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('🔥🔥🔥 Error updating contact in database:', error);
          // If update fails, we could revert the UI change here
          // But for now, we'll just log the error
          return;
        }
        
        console.log('🔥🔥🔥 Background update completed successfully:', data);
        
        // Update local state with the actual data from database
        setContacts(prev => prev.map(c => c.id === id ? data : c));
        console.log('🔥🔥🔥 Local state updated with database data');
      } catch (error) {
        console.error('🔥🔥🔥 Exception in background update:', error);
        // If update fails, we could revert the UI change here
        // But for now, we'll just log the error
      }
    };
    
    // Start background update without waiting
    updateInDatabase();
  };

  const deleteContact = async (id: string) => {
    if (!user) return;

    console.log('🔥🔥🔥 SupabaseDataContext deleteContact: starting optimistic delete for contact', id);
    
    // Optimistic update - remove from UI immediately
    setContacts(prev => prev.filter(c => c.id !== id));
    console.log('🔥🔥🔥 Contact removed from UI immediately');
    
    // Delete from database in background
    const deleteFromDatabase = async () => {
      try {
        console.log('🔥🔥🔥 Starting background deletion from database...');
        
        // Try to delete contact directly - let CASCADE handle related records
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('🔥🔥🔥 Error deleting contact:', error);
          
          // If CASCADE failed, try manual deletion as fallback
          console.log('🔥🔥🔥 CASCADE failed, trying manual deletion...');
          
          // Delete from event_participants
          const { error: epError } = await supabase
            .from('event_participants')
            .delete()
            .eq('contact_id', id);
          
          if (epError) {
            console.error('🔥🔥🔥 Error deleting event participants:', epError);
          }
          
          // Delete from expense_paid_by
          const { error: epbError } = await supabase
            .from('expense_paid_by')
            .delete()
            .eq('contact_id', id);
          
          if (epbError) {
            console.error('🔥🔥🔥 Error deleting expense paid by:', epbError);
          }
          
          // Delete from expense_split_between
          const { error: esbError } = await supabase
            .from('expense_split_between')
            .delete()
            .eq('contact_id', id);
          
          if (esbError) {
            console.error('🔥🔥🔥 Error deleting expense split between:', esbError);
          }
          
          // Try to delete contact again
          const { error: retryError } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (retryError) {
            console.error('🔥🔥🔥 Error deleting contact after manual cleanup:', retryError);
            // If deletion fails, we could restore the contact to the UI here
            // But for now, we'll just log the error
            return;
          }
        }
        
        console.log('🔥🔥🔥 Background deletion completed successfully');
      } catch (error) {
        console.error('🔥🔥🔥 Exception in background deletion:', error);
        // If deletion fails, we could restore the contact to the UI here
        // But for now, we'll just log the error
      }
    };
    
    // Start background deletion without waiting
    deleteFromDatabase();
  };

  // Functions for working with events
  const addEvent = async (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { participants: Contact[] }) => {
    if (!user) return;

    const { participants, ...eventData } = event;

    // Adding event
    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .insert([{ ...eventData, user_id: user.id }])
      .select()
      .single();

    if (eventError) throw eventError;

    // Adding participants - filter out user profile (isSelf or user.id)
    const dbParticipants = participants.filter(p => p.id !== user.id);
    
    if (dbParticipants.length > 0) {
      const participantData = dbParticipants.map(contact => ({
        event_id: eventResult.id,
        contact_id: contact.id
      }));

      await supabase
        .from('event_participants')
        .insert(participantData);
    }

    // Update local state
    await loadData();
  };

  const updateEvent = async (id: string, updates: Partial<Event> & { participants?: Contact[] }) => {
    const { participants, ...eventUpdates } = updates;

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({ ...eventUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update participants if needed
    if (participants !== undefined) {
      // Get current participants from database
      const { data: currentParticipants } = await supabase
        .from('event_participants')
        .select('contact_id')
        .eq('event_id', id);
      const currentIds = (currentParticipants || []).map((p: any) => p.contact_id);
      
      // Filter out user profile from participants to get actual contacts
      const eventContacts = participants.filter(p => p.id !== user?.id);
      const eventContactIds = eventContacts.map(p => p.id);
      
      // Find participants to remove (in database but not in participants)
      const participantsToRemove = currentIds.filter(id => !eventContactIds.includes(id));
      
      // Find participants to add (in participants but not in database)
      const participantsToAdd = eventContactIds.filter(id => !currentIds.includes(id));
      
      // Remove participants
      if (participantsToRemove.length > 0) {
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', id)
          .in('contact_id', participantsToRemove);
      }

      // Add new participants
      if (participantsToAdd.length > 0) {
        const participantData = participantsToAdd.map(contactId => ({
          event_id: id,
          contact_id: contactId
        }));

        await supabase
          .from('event_participants')
          .insert(participantData);
      }
    }

    // Update local state
    await loadData();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Update local state
    await loadData();
  };

  // Functions for working with expenses
  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
    paid_by: { contact_id?: string; user_id?: string; amount: number }[];
    split_between: { contact_id?: string; user_id?: string; amount: number }[];
  }) => {
    if (!user) return;

    const { paid_by, split_between, ...expenseData } = expense;

    // Adding expense
    const { data: expenseResult, error: expenseError } = await supabase
      .from('expenses')
      .insert([{ ...expenseData, user_id: user.id }])
      .select()
      .single();

    if (expenseError) throw expenseError;

    // Adding those who paid
    if (paid_by.length > 0) {
      const paidByData = paid_by.map(pb => ({
        expense_id: expenseResult.id,
        contact_id: pb.contact_id || null,
        user_id: pb.user_id || null,
        amount: pb.amount
      }));
      await supabase
        .from('expense_paid_by')
        .insert(paidByData);
    }

    // Adding distribution
    if (split_between.length > 0) {
      const splitData = split_between.map(sb => ({
        expense_id: expenseResult.id,
        contact_id: sb.contact_id || null,
        user_id: sb.user_id || null,
        amount: sb.amount
      }));
      await supabase
        .from('expense_split_between')
        .insert(splitData);
    }

    // Update local state
    await loadData();
  };

  const updateExpense = async (id: string, updates: Partial<Expense> & {
    paid_by?: { contact_id?: string; user_id?: string; amount: number }[];
    split_between?: { contact_id?: string; user_id?: string; amount: number }[];
  }) => {
    const { paid_by, split_between, ...expenseUpdates } = updates;

    // Update expense
    const { error } = await supabase
      .from('expenses')
      .update({ ...expenseUpdates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    // Update those who paid
    if (paid_by !== undefined) {
      await supabase
        .from('expense_paid_by')
        .delete()
        .eq('expense_id', id);

      if (paid_by.length > 0) {
        const paidByData = paid_by.map(pb => ({
          expense_id: id,
          contact_id: pb.contact_id || null,
          user_id: pb.user_id || null,
          amount: pb.amount
        }));

        await supabase
          .from('expense_paid_by')
          .insert(paidByData);
      }
    }

    // Update distribution
    if (split_between !== undefined) {
      await supabase
        .from('expense_split_between')
        .delete()
        .eq('expense_id', id);

      if (split_between.length > 0) {
        const splitData = split_between.map(sb => ({
          expense_id: id,
          contact_id: sb.contact_id || null,
          user_id: sb.user_id || null,
          amount: sb.amount
        }));

        await supabase
          .from('expense_split_between')
          .insert(splitData);
      }
    }

    // Update local state
    await loadData();
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Update local state
    await loadData();
  };

  const getExpensesByEvent = (eventId: string) => {
    return expenses.filter(e => e.event_id === eventId);
  };

  // Functions for working with settings
  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setSettings(data);
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <SupabaseDataContext.Provider value={{
      contacts,
      events,
      expenses,
      settings,
      loading,
      addContact,
      updateContact,
      deleteContact,
      addEvent,
      updateEvent,
      deleteEvent,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByEvent,
      updateSettings,
      refreshData
    }}>
      {children}
    </SupabaseDataContext.Provider>
  );
};

export const useSupabaseData = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseData must be used within SupabaseDataProvider');
  }
  return context;
}; 