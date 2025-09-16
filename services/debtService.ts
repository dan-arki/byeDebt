import { supabase } from '../lib/supabase';
import { Debt, CreateDebtPayload } from '../types/debt';
import { AuthService } from './authService';
import { SUPPORTED_CURRENCIES } from '../types/currency';

export class DebtService {
  static async createDebt(payload: CreateDebtPayload): Promise<Debt> {
    // 1. Input Validation
    const { debtorName, creditorName, amount, currency, dueDate, category, description } = payload;

    if (!debtorName || debtorName.trim() === '') {
      throw new Error('Debtor name is required.');
    }
    if (!creditorName || creditorName.trim() === '') {
      throw new Error('Creditor name is required.');
    }
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number.');
    }
    if (!currency || !SUPPORTED_CURRENCIES.some(c => c.code === currency)) {
      throw new Error('Invalid or unsupported currency.');
    }
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      throw new Error('Due date must be in YYYY-MM-DD format.');
    }
    
    // Validate that due date is a real date
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      throw new Error('Invalid due date.');
    }

    // Get current authenticated user
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated.');
    }

    const debtStatus = payload.status || 'pending';
    if (!['pending', 'paid', 'overdue'].includes(debtStatus)) {
      throw new Error('Invalid debt status.');
    }

    // 2. Insert into database
    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: currentUser.id,
        debtor_name: debtorName.trim(),
        creditor_name: creditorName.trim(),
        amount: amount,
        currency: currency,
        due_date: dueDate,
        status: debtStatus,
        category: category || null,
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create debt: ${error.message}`);
    }

    // 3. Map database response to Debt interface
    const createdDebt: Debt = {
      id: data.id,
      userId: data.user_id,
      debtorName: data.debtor_name,
      creditorName: data.creditor_name,
      amount: parseFloat(data.amount),
      currency: data.currency,
      dueDate: data.due_date,
      status: data.status,
      category: data.category,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return createdDebt;
  }

  static async getUserDebts(userId: string): Promise<Debt[]> {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user debts:', error);
        throw new Error(`Failed to fetch debts: ${error.message}`);
      }

      return data.map(debt => ({
        id: debt.id,
        userId: debt.user_id,
        debtorName: debt.debtor_name,
        creditorName: debt.creditor_name,
        amount: parseFloat(debt.amount),
        currency: debt.currency,
        dueDate: debt.due_date,
        status: debt.status,
        category: debt.category,
        description: debt.description,
        createdAt: debt.created_at,
        updatedAt: debt.updated_at,
      }));
    } catch (error) {
      console.error('Error in getUserDebts:', error);
      throw error;
    }
  }

  static async updateDebtStatus(debtId: string, status: 'pending' | 'paid' | 'overdue'): Promise<Debt> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated.');
      }

      const { data, error } = await supabase
        .from('debts')
        .update({ status })
        .eq('id', debtId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating debt status:', error);
        throw new Error(`Failed to update debt: ${error.message}`);
      }

      return {
        id: data.id,
        userId: data.user_id,
        debtorName: data.debtor_name,
        creditorName: data.creditor_name,
        amount: parseFloat(data.amount),
        currency: data.currency,
        dueDate: data.due_date,
        status: data.status,
        category: data.category,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error in updateDebtStatus:', error);
      throw error;
    }
  }

  static async deleteDebt(debtId: string): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated.');
      }

      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error deleting debt:', error);
        throw new Error(`Failed to delete debt: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteDebt:', error);
      throw error;
    }
  }

  static async getDebtsInvolvingPerson(userId: string, personName: string): Promise<Debt[]> {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .or(`debtor_name.eq.${personName},creditor_name.eq.${personName}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching debts for person:', error);
        throw new Error(`Failed to fetch debts for ${personName}: ${error.message}`);
      }

      return data.map(debt => ({
        id: debt.id,
        userId: debt.user_id,
        debtorName: debt.debtor_name,
        creditorName: debt.creditor_name,
        amount: parseFloat(debt.amount),
        currency: debt.currency,
        dueDate: debt.due_date,
        status: debt.status,
        category: debt.category,
        description: debt.description,
        createdAt: debt.created_at,
        updatedAt: debt.updated_at,
      }));
    } catch (error) {
      console.error('Error in getDebtsInvolvingPerson:', error);
      throw error;
    }
  }

  static async getUniquePersons(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('debtor_name, creditor_name')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching unique persons:', error);
        throw new Error(`Failed to fetch unique persons: ${error.message}`);
      }

      const persons = new Set<string>();
      data.forEach(debt => {
        persons.add(debt.debtor_name);
        persons.add(debt.creditor_name);
      });

      // Remove the current user from the list
      const currentUser = await AuthService.getCurrentUser();
      const currentUserName = currentUser?.name || 'You';
      persons.delete(currentUserName);

      return Array.from(persons).sort();
    } catch (error) {
      console.error('Error in getUniquePersons:', error);
      throw error;
    }
  }
}