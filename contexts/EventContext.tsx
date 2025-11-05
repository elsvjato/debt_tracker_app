import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Contact, useContacts } from './ContactContext';
import { useSupabaseAuth } from './SupabaseAuthContext';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  currency: string;
  category: string;
  emoji?: string;
  image_uri?: string;
  participants: Contact[];
  created_at: string;
  updated_at?: string;
}

interface EventContextProps {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'participants'>, participants: Contact[]) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addUserToEvent: (eventId: string, contact: Contact) => Promise<void>;
  removeUserFromEvent: (eventId: string, contactId: string) => Promise<void>;
  isUserInEvent: (eventId: string) => boolean;
  loading: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

// Adding type for EventProvider with fetchEvents
interface EventProviderType extends React.FC<{ children: React.ReactNode }> {
  fetchEvents?: () => Promise<void>;
}

export const EventProvider: EventProviderType = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();
  const { contacts } = useContacts();

  // Loading user events from Supabase
  const fetchEvents = useCallback(async () => {
    if (!user?.id) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // 1. Get all user events
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (eventsError) {
      setError(eventsError.message);
      setEvents([]);
      setLoading(false);
      return;
    }
    // 2. Get all participants for events
    const eventIds = (eventsData || []).map(e => e.id);
    let participantsMap: Record<string, any[]> = {};
    if (eventIds.length > 0) {
      // Extract all event_participants for these events
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select('event_id, contact_id')
        .in('event_id', eventIds);
      if (!participantsError && participantsData) {
        // Extract ALL contacts for these contact_id (without user_id restriction)
        const allContactIds = [...new Set(participantsData.map((p: any) => p.contact_id))];
        let contactsMap: Record<string, any> = {};
        if (allContactIds.length > 0) {
          const { data: allContacts } = await supabase
            .from('contacts')
            .select('*')
            .in('id', allContactIds);
          if (allContacts) {
            contactsMap = allContacts.reduce((acc: any, c: any) => {
              acc[c.id] = c;
              return acc;
            }, {});
          }
        }
        participantsMap = eventIds.reduce((acc, eventId) => {
          acc[eventId] = participantsData
            .filter((p: any) => p.event_id === eventId)
            .map((p: any) => contactsMap[p.contact_id])
            .filter(Boolean);
          return acc;
        }, {} as Record<string, any[]>);
      }
    }
    // 3. Combine events with participants
    const eventsWithParticipants: Event[] = (eventsData || []).map(e => {
      const eventParticipants = participantsMap[e.id] || [];
      
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
      ...e,
        participants
      };
    });
    setEvents(eventsWithParticipants);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
    // Add fetchEvents to context so it can be called from updateEvent
    EventProvider.fetchEvents = fetchEvents;
  }, [fetchEvents]);

  // Adding event
  const addEvent = async (
    event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'participants'>,
    participants: Contact[]
  ) => {
    if (!user?.id) {
      return;
    }
    setLoading(true);
    setError(null);
    // Add event
    const { data, error } = await supabase
      .from('events')
      .insert([{ ...event, user_id: user.id }])
      .select();
    if (error || !data || data.length === 0) {
      setError(error?.message || 'Failed to add event');
      setLoading(false);
      return;
    }
    const newEvent = data[0];
    // Add participants
    if (participants.length > 0) {
      // Filter out user profile from database insert
      const dbParticipants = participants.filter(p => p.id !== user.id);
      
      if (dbParticipants.length > 0) {
        const participantsRows = dbParticipants.map(p => ({ event_id: newEvent.id, contact_id: p.id }));
      const { error: participantsError } = await supabase.from('event_participants').insert(participantsRows);
      if (participantsError) {
        console.log('EventContext addEvent: Participants error:', participantsError);
          setError(participantsError.message || 'Failed to add participants');
          setLoading(false);
          return;
        }
      }
    }
    // After successful event and participants insertion, fetch events from DB
    if (typeof EventProvider.fetchEvents === 'function') {
      await EventProvider.fetchEvents();
    }
    setLoading(false);
  };

  // Updating event (without changing participants)
  const updateEvent = async (event: Event) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('events')
      .update({
        title: event.title,
        description: event.description,
        currency: event.currency,
        category: event.category,
        emoji: event.emoji,
        image_uri: event.image_uri,
        updated_at: new Date().toISOString(),
      })
      .eq('id', event.id)
      .eq('user_id', user.id)
      .select();
    if (error || !data || data.length === 0) {
      setError(error?.message || 'Failed to update event');
      setLoading(false);
      return;
    }
    
    // Get current participants from database
    const { data: currentParticipants } = await supabase
      .from('event_participants')
      .select('contact_id')
      .eq('event_id', event.id);
    const currentIds = (currentParticipants || []).map((p: any) => p.contact_id);
    
    // Filter out user profile from event.participants to get actual contacts
    const eventContacts = event.participants.filter(p => p.id !== user.id);
    const eventContactIds = eventContacts.map(p => p.id);
    
    // Find participants to remove (in database but not in event.participants)
    const participantsToRemove = currentIds.filter(id => !eventContactIds.includes(id));
    
    // Find participants to add (in event.participants but not in database)
    const participantsToAdd = eventContactIds.filter(id => !currentIds.includes(id));
    
    // Remove participants
    if (participantsToRemove.length > 0) {
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', event.id)
        .in('contact_id', participantsToRemove);
    }
    
    // Add new participants
    if (participantsToAdd.length > 0) {
      const rows = participantsToAdd.map(contactId => ({ 
        event_id: event.id, 
        contact_id: contactId 
      }));
      const { error: insertError } = await supabase.from('event_participants').insert(rows);
      if (insertError) {
        console.log('EventContext updateEvent: Error inserting participants:', insertError);
      }
    }
    
    // Update local state with the new participants
    setEvents(prev => prev.map(e => e.id === event.id ? { ...data[0], participants: event.participants } : e));
    setLoading(false);
  };

  // Deleting event
  const deleteEvent = async (id: string) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    await supabase.from('event_participants').delete().eq('event_id', id);
    const { error } = await supabase.from('events').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      setError(error.message);
    } else {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
    setLoading(false);
  };

  // Add user/contact to event
  const addUserToEvent = async (eventId: string, contact: Contact) => {
    // Don't add user profile to event_participants
    if (contact.id === user?.id) {
      return;
    }
    
    setLoading(true);
    setError(null);
    await supabase.from('event_participants').insert([{ event_id: eventId, contact_id: contact.id }]);
    // Call fetchEvents to update list from database
    if (typeof EventProvider.fetchEvents === 'function') {
      await EventProvider.fetchEvents();
    }
    setLoading(false);
  };

  // Remove user/contact from event
  const removeUserFromEvent = async (eventId: string, contactId: string) => {
    // Don't remove user profile from event_participants
    if (contactId === user?.id) {
      return;
    }
    
    setLoading(true);
    setError(null);
    await supabase.from('event_participants').delete().eq('event_id', eventId).eq('contact_id', contactId);
    // Call fetchEvents to update list from database
    if (typeof EventProvider.fetchEvents === 'function') {
      await EventProvider.fetchEvents();
    }
    setLoading(false);
  };

  // Check if user is participant of event
  const isUserInEvent = (eventId: string) => {
    if (!user?.id) return false;
    const event = events.find(e => e.id === eventId);
    return event ? event.participants.some(p => p.id === user.id) : false;
  };

  // Protection against errors if user becomes null
  if (!user && !loading) {
    return (
      <EventContext.Provider value={{ 
        events: [], 
        addEvent: async () => {}, 
        updateEvent: async () => {}, 
        deleteEvent: async () => {},
        addUserToEvent: async () => {},
        removeUserFromEvent: async () => {},
        isUserInEvent: () => false,
        loading: false,
        error: null,
      }}>
        {children}
      </EventContext.Provider>
    );
  }

  return (
    <EventContext.Provider value={{ 
      events, 
      addEvent, 
      updateEvent, 
      deleteEvent,
      addUserToEvent,
      removeUserFromEvent,
      isUserInEvent,
      loading,
      error
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within EventProvider');
  }
  return context;
}; 