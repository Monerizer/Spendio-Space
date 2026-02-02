import { supabase } from '@/lib/supabaseClient';
import type { UserData, Transaction, DebtItem } from '@/context/SpendioContext';

/**
 * User Profile Service
 * Handles user profile CRUD operations in Supabase
 */
export const userProfileService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserData>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Create user profile
  async createProfile(userId: string, profile: Partial<UserData>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ id: userId, ...profile }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

/**
 * Transactions Service
 * Handles transaction CRUD operations in Supabase
 */
export const transactionsService = {
  // Get all transactions for a user
  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Transaction[];
  },

  // Get transactions for a specific month
  async getTransactionsByMonth(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Transaction[];
  },

  // Create transaction
  async createTransaction(userId: string, transaction: Omit<Transaction, 'id'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ user_id: userId, ...transaction }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Transaction;
  },

  // Update transaction
  async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Transaction;
  },

  // Delete transaction
  async deleteTransaction(transactionId: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw new Error(error.message);
  },

  // Bulk insert transactions
  async bulkCreateTransactions(userId: string, transactions: Array<Omit<Transaction, 'id'>>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions.map(tx => ({ user_id: userId, ...tx })))
      .select();

    if (error) throw new Error(error.message);
    return data as Transaction[];
  },
};

/**
 * Debts Service
 * Handles debt tracking CRUD operations in Supabase
 */
export const debtsService = {
  // Get all debts for a user
  async getDebts(userId: string) {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as DebtItem[];
  },

  // Create debt
  async createDebt(userId: string, debt: Omit<DebtItem, 'id'>) {
    const { data, error } = await supabase
      .from('debts')
      .insert([{ user_id: userId, ...debt }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as DebtItem;
  },

  // Update debt
  async updateDebt(debtId: string, updates: Partial<DebtItem>) {
    const { data, error } = await supabase
      .from('debts')
      .update(updates)
      .eq('id', debtId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as DebtItem;
  },

  // Delete debt
  async deleteDebt(debtId: string) {
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId);

    if (error) throw new Error(error.message);
  },
};

/**
 * Financial Targets Service
 * Handles savings/investing targets CRUD operations in Supabase
 */
export const financialTargetsService = {
  // Get targets for a user
  async getTargets(userId: string) {
    const { data, error } = await supabase
      .from('financial_targets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message); // 404 is ok
    return data || { savings: 0, investing: 0 };
  },

  // Update targets
  async updateTargets(userId: string, targets: { savings: number; investing: number }) {
    const { data, error } = await supabase
      .from('financial_targets')
      .upsert({ user_id: userId, ...targets })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

/**
 * Snapshots Service
 * Handles financial snapshot CRUD operations in Supabase
 */
export const snapshotsService = {
  // Get latest snapshot
  async getLatestSnapshot(userId: string) {
    const { data, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message); // 404 is ok
    return data || null;
  },

  // Create snapshot
  async createSnapshot(userId: string, snapshot: any) {
    const { data, error } = await supabase
      .from('snapshots')
      .insert([{ user_id: userId, ...snapshot }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get snapshot history
  async getSnapshotHistory(userId: string, limit = 12) {
    const { data, error } = await supabase
      .from('snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data || [];
  },
};

export default {
  userProfileService,
  transactionsService,
  debtsService,
  financialTargetsService,
  snapshotsService,
};
