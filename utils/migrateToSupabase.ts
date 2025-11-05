import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabaseClient';

export interface MigrationResult {
  success: boolean;
  message: string;
  migratedContacts?: number;
  migratedEvents?: number;
  migratedExpenses?: number;
}

export const migrateDataToSupabase = async (userId: string): Promise<MigrationResult> => {
  try {
    let migratedContacts = 0;
    let migratedEvents = 0;
    let migratedExpenses = 0;

    // Migration of contacts
    try {
      const contactsData = await AsyncStorage.getItem('contacts');
      if (contactsData) {
        const contacts = JSON.parse(contactsData);
        if (Array.isArray(contacts) && contacts.length > 0) {
          const contactsToInsert = contacts.map(contact => ({
            user_id: userId,
            name: contact.name,
            email: contact.email,
            avatar: contact.avatar,
            favorite: contact.favorite || false
          }));

          const { error } = await supabase
            .from('contacts')
            .insert(contactsToInsert);

          if (!error) {
            migratedContacts = contacts.length;
            await AsyncStorage.removeItem('contacts');
          }
        }
      }
    } catch (error) {
      console.error('Error migrating contacts:', error);
    }

    // Migration of events
    try {
      const eventsData = await AsyncStorage.getItem('events');
      if (eventsData) {
        const events = JSON.parse(eventsData);
        if (Array.isArray(events) && events.length > 0) {
          for (const event of events) {
            // Creating event
            const { data: eventResult, error: eventError } = await supabase
              .from('events')
              .insert([{
                user_id: userId,
                title: event.title,
                description: event.description,
                currency: event.currency,
                category: event.category,
                emoji: event.emoji,
                image: event.image
              }])
              .select()
              .single();

            if (!eventError && eventResult && event.participants) {
              // Adding participants - filter out user profile
              const dbParticipants = event.participants.filter((participant: any) => participant.id !== userId);
              const participantData = dbParticipants.map((participant: any) => ({
                event_id: eventResult.id,
                contact_id: participant.id
              }));

              if (participantData.length > 0) {
                await supabase
                  .from('event_participants')
                  .insert(participantData);
              }
            }

            if (!eventError) {
              migratedEvents++;
            }
          }

          await AsyncStorage.removeItem('events');
        }
      }
    } catch (error) {
      console.error('Error migrating events:', error);
    }

    // Migration of expenses
    try {
      const expensesData = await AsyncStorage.getItem('expenses');
      if (expensesData) {
        const expenses = JSON.parse(expensesData);
        if (Array.isArray(expenses) && expenses.length > 0) {
          for (const expense of expenses) {
            // Creating expense
            const { data: expenseResult, error: expenseError } = await supabase
              .from('expenses')
              .insert([{
                event_id: expense.eventId,
                user_id: userId,
                title: expense.title,
                amount: expense.amount,
                currency: expense.currency,
                category: expense.category,
                notes: expense.notes,
                image_uri: expense.imageUri
              }])
              .select()
              .single();

            if (!expenseError && expenseResult) {
              // Adding those who paid
              if (expense.paidBy && expense.paidBy.length > 0) {
                const paidByData = expense.paidBy.map((pb: any) => ({
                  expense_id: expenseResult.id,
                  contact_id: pb.memberId,
                  amount: pb.amount
                }));

                await supabase
                  .from('expense_paid_by')
                  .insert(paidByData);
              }

              // Adding distribution
              if (expense.splitBetween && expense.splitBetween.length > 0) {
                const splitData = expense.splitBetween.map((sb: any) => ({
                  expense_id: expenseResult.id,
                  contact_id: sb.memberId,
                  amount: sb.amount
                }));

                await supabase
                  .from('expense_split_between')
                  .insert(splitData);
              }
            }

            if (!expenseError) {
              migratedExpenses++;
            }
          }

          await AsyncStorage.removeItem('expenses');
        }
      }
    } catch (error) {
      console.error('Error migrating expenses:', error);
    }

    return {
      success: true,
      message: `Migration completed successfully. Migrated: ${migratedContacts} contacts, ${migratedEvents} events, ${migratedExpenses} expenses.`,
      migratedContacts,
      migratedEvents,
      migratedExpenses
    };

  } catch (error) {
    return {
      success: false,
      message: `Migration failed: ${error}`
    };
  }
};

export const checkForLocalData = async (): Promise<boolean> => {
  try {
    const contacts = await AsyncStorage.getItem('contacts');
    const events = await AsyncStorage.getItem('events');
    const expenses = await AsyncStorage.getItem('expenses');

    return !!(contacts || events || expenses);
  } catch (error) {
    return false;
  }
}; 