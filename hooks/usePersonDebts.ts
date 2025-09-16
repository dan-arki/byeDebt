import { useState, useEffect, useCallback } from 'react';
import { Debt } from '../types/debt';
import { DebtService } from '../services/debtService';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

export interface PersonDebtSummary {
  personName: string;
  totalOwed: number; // Amount the person owes to current user
  totalOwing: number; // Amount current user owes to the person
  netBalance: number; // Positive = person owes you, Negative = you owe person
  totalDebts: number;
  activeDebts: number;
  paidDebts: number;
}

export function usePersonDebts(personName: string) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<PersonDebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateSummary = useCallback((debtsList: Debt[], currentUserName: string): PersonDebtSummary => {
    let totalOwed = 0; // Amount person owes to current user
    let totalOwing = 0; // Amount current user owes to person
    let activeDebts = 0;
    let paidDebts = 0;

    debtsList.forEach(debt => {
      if (debt.status === 'paid') {
        paidDebts++;
      } else {
        activeDebts++;
        
        // If current user is creditor, person owes money to current user
        if (debt.creditorName === currentUserName) {
          totalOwed += debt.amount;
        }
        // If current user is debtor, current user owes money to person
        else if (debt.debtorName === currentUserName) {
          totalOwing += debt.amount;
        }
      }
    });

    const netBalance = totalOwed - totalOwing;

    return {
      personName,
      totalOwed,
      totalOwing,
      netBalance,
      totalDebts: debtsList.length,
      activeDebts,
      paidDebts,
    };
  }, [personName]);

  const fetchPersonDebts = useCallback(async () => {
    if (!personName) {
      setError('Person name is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        setError('User not authenticated');
        setDebts([]);
        setSummary(null);
        setLoading(false);
        return;
      }

      const personDebts = await DebtService.getDebtsInvolvingPerson(currentUser.id, personName);
      setDebts(personDebts);
      
      const currentUserName = currentUser.name || 'You';
      const summaryData = calculateSummary(personDebts, currentUserName);
      setSummary(summaryData);
      
    } catch (err) {
      console.error('Error fetching person debts:', err);
      setError('Failed to load debts for this person.');
      setDebts([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [personName, calculateSummary]);

  useEffect(() => {
    fetchPersonDebts();
    
    // Set up real-time subscription for debts table
    const subscription = supabase
      .channel(`person_debts_${personName}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'debts' 
        }, 
        (payload) => {
          console.log('Debt change detected for person:', payload);
          // Refresh debts when any change occurs
          fetchPersonDebts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPersonDebts, personName]);

  return {
    debts,
    summary,
    loading,
    error,
    refreshPersonDebts: fetchPersonDebts,
  };
}