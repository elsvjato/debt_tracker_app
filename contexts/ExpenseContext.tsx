import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useSupabaseAuth } from './SupabaseAuthContext';

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
  updated_at?: string;
  paidBy: { contact_id?: string; user_id?: string; amount: number }[];
  splitBetween: { contact_id?: string; user_id?: string; amount: number }[];
}

interface ExpenseContextProps {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'paidBy' | 'splitBetween'>, paid_by: { contact_id?: string; user_id?: string; amount: number }[], split_between: { contact_id?: string; user_id?: string; amount: number }[]) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>, paid_by: { contact_id?: string; user_id?: string; amount: number }[], split_between: { contact_id?: string; user_id?: string; amount: number }[]) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByEvent: (eventId: string) => Expense[];
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextProps | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSupabaseAuth();

  // Loading user expenses from Supabase
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) {
            setExpenses([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (expensesError) {
        setError(expensesError.message);
          setExpenses([]);
        setLoading(false);
        return;
      }
      // Get paidBy and splitBetween for each expense
      const expenseIds = (expensesData || []).map(e => e.id);
      let paidByMap: Record<string, { contact_id?: string; user_id?: string; amount: number }[]> = {};
      let splitBetweenMap: Record<string, { contact_id?: string; user_id?: string; amount: number }[]> = {};
      if (expenseIds.length > 0) {
        const { data: paidByData } = await supabase
          .from('expense_paid_by')
          .select('expense_id, contact_id, user_id, amount')
          .in('expense_id', expenseIds);
        if (paidByData) {
          paidByMap = expenseIds.reduce((acc, expenseId) => {
            acc[expenseId] = paidByData.filter((p: any) => p.expense_id === expenseId).map((p: any) => ({ 
              contact_id: p.contact_id, 
              user_id: p.user_id,
              amount: p.amount 
            }));
            return acc;
          }, {} as Record<string, { contact_id?: string; user_id?: string; amount: number }[]>);
        }
        const { data: splitBetweenData } = await supabase
          .from('expense_split_between')
          .select('expense_id, contact_id, user_id, amount')
          .in('expense_id', expenseIds);
        if (splitBetweenData) {
          splitBetweenMap = expenseIds.reduce((acc, expenseId) => {
            acc[expenseId] = splitBetweenData.filter((s: any) => s.expense_id === expenseId).map((s: any) => ({ 
              contact_id: s.contact_id, 
              user_id: s.user_id,
              amount: s.amount 
            }));
            return acc;
          }, {} as Record<string, { contact_id?: string; user_id?: string; amount: number }[]>);
        }
      }
      // Combine expenses with paidBy and splitBetween
      const expensesWithDetails: Expense[] = (expensesData || []).map(e => ({
        ...e,
        paidBy: paidByMap[e.id] || [],
        splitBetween: splitBetweenMap[e.id] || [],
      }));
      setExpenses(expensesWithDetails);
      setLoading(false);
    };
    fetchExpenses();
  }, [user?.id]);

  // Adding expense
  const addExpense = async (
    expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'paidBy' | 'splitBetween'>,
    paid_by: { contact_id?: string; user_id?: string; amount: number }[],
    split_between: { contact_id?: string; user_id?: string; amount: number }[]
  ) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    // Add expense
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select();
    if (error || !data || data.length === 0) {
      setError(error?.message || 'Failed to add expense');
      setLoading(false);
      return;
    }
    const newExpense = data[0];
    // Add paidBy
    if (paid_by.length > 0) {
      const paidByRows = paid_by.map(p => ({ 
        expense_id: newExpense.id, 
        contact_id: p.contact_id || null, 
        user_id: p.user_id || null,
        amount: p.amount 
      }));
      await supabase.from('expense_paid_by').insert(paidByRows);
    }
    // Add splitBetween
    if (split_between.length > 0) {
      const splitRows = split_between.map(s => ({ 
        expense_id: newExpense.id, 
        contact_id: s.contact_id || null, 
        user_id: s.user_id || null,
        amount: s.amount 
      }));
      await supabase.from('expense_split_between').insert(splitRows);
    }
    setExpenses(prev => [{ ...newExpense, paidBy: paid_by, splitBetween: split_between }, ...prev]);
    setLoading(false);
  };

  // Updating expense
  const updateExpense = async (
    id: string,
    updates: Partial<Expense>,
    paid_by: { contact_id?: string; user_id?: string; amount: number }[],
    split_between: { contact_id?: string; user_id?: string; amount: number }[]
  ) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    if (error || !data || data.length === 0) {
      setError(error?.message || 'Failed to update expense');
      setLoading(false);
      return;
    }
    // Update paidBy
    await supabase.from('expense_paid_by').delete().eq('expense_id', id);
    if (paid_by.length > 0) {
      const paidByRows = paid_by.map(p => ({ 
        expense_id: id, 
        contact_id: p.contact_id || null, 
        user_id: p.user_id || null,
        amount: p.amount 
      }));
      await supabase.from('expense_paid_by').insert(paidByRows);
    }
    // Update splitBetween
    await supabase.from('expense_split_between').delete().eq('expense_id', id);
    if (split_between.length > 0) {
      const splitRows = split_between.map(s => ({ 
        expense_id: id, 
        contact_id: s.contact_id || null, 
        user_id: s.user_id || null,
        amount: s.amount 
      }));
      await supabase.from('expense_split_between').insert(splitRows);
    }
    setExpenses(prev => prev.map(e => e.id === id ? { ...data[0], paidBy: paid_by, splitBetween: split_between } : e));
    setLoading(false);
  };

  // Deleting expense
  const deleteExpense = async (id: string) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    await supabase.from('expense_paid_by').delete().eq('expense_id', id);
    await supabase.from('expense_split_between').delete().eq('expense_id', id);
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      setError(error.message);
    } else {
    setExpenses(prev => prev.filter(e => e.id !== id));
    }
    setLoading(false);
  };

  // Get expenses for event
  const getExpensesByEvent = (eventId: string) => {
    return expenses.filter(e => e.event_id === eventId);
  };

  // Refresh data function
  const refreshData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const { data: expensesData, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (expensesError) {
      setError(expensesError.message);
      setExpenses([]);
      setLoading(false);
      return;
    }
    // Get paidBy and splitBetween for each expense
    const expenseIds = (expensesData || []).map(e => e.id);
    let paidByMap: Record<string, { contact_id?: string; user_id?: string; amount: number }[]> = {};
    let splitBetweenMap: Record<string, { contact_id?: string; user_id?: string; amount: number }[]> = {};
    if (expenseIds.length > 0) {
      const { data: paidByData } = await supabase
        .from('expense_paid_by')
        .select('expense_id, contact_id, user_id, amount')
        .in('expense_id', expenseIds);
      if (paidByData) {
        paidByMap = expenseIds.reduce((acc, expenseId) => {
          acc[expenseId] = paidByData.filter((p: any) => p.expense_id === expenseId).map((p: any) => ({ 
            contact_id: p.contact_id, 
            user_id: p.user_id,
            amount: p.amount 
          }));
          return acc;
        }, {} as Record<string, { contact_id?: string; user_id?: string; amount: number }[]>);
      }
      const { data: splitBetweenData } = await supabase
        .from('expense_split_between')
        .select('expense_id, contact_id, user_id, amount')
        .in('expense_id', expenseIds);
      if (splitBetweenData) {
        splitBetweenMap = expenseIds.reduce((acc, expenseId) => {
          acc[expenseId] = splitBetweenData.filter((s: any) => s.expense_id === expenseId).map((s: any) => ({ 
            contact_id: s.contact_id, 
            user_id: s.user_id,
            amount: s.amount 
          }));
          return acc;
        }, {} as Record<string, { contact_id?: string; user_id?: string; amount: number }[]>);
      }
    }
    // Combine expenses with paidBy and splitBetween
    const expensesWithDetails: Expense[] = (expensesData || []).map(e => ({
      ...e,
      paidBy: paidByMap[e.id] || [],
      splitBetween: splitBetweenMap[e.id] || [],
    }));
    setExpenses(expensesWithDetails);
    setLoading(false);
  };

  // Protection against errors if user becomes null
  if (!user && !loading) {
    return (
      <ExpenseContext.Provider value={{
        expenses: [],
        addExpense: async () => {},
        updateExpense: async () => {},
        deleteExpense: async () => {},
        getExpensesByEvent: () => [],
        refreshData: async () => {},
        loading: false,
        error: null,
      }}>
        {children}
      </ExpenseContext.Provider>
    );
  }

  return (
    <ExpenseContext.Provider value={{
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByEvent,
      refreshData,
      loading,
      error
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}; 