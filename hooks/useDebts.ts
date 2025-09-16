import { useState, useEffect, useCallback } from 'react';
import { Debt } from '../types/debt';
import { DebtService } from '../services/debtService';
import { AuthService } from '../services/authService';
import { supabase } from '../lib/supabase';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        // If user is not authenticated, return empty debts
        setDebts([]);
        setLoading(false);
        return;
      }
      const userDebts = await DebtService.getUserDebts(currentUser.id);
      setDebts(userDebts);
    } catch (err) {
      console.error('Error fetching debts:', err);
      setError('Failed to load debts.');
      setDebts([]); // Clear debts on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
    
    // Set up real-time subscription for debts table
    const subscription = supabase
      .channel('debts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'debts' 
        }, 
        (payload) => {
          console.log('Debt change detected:', payload);
          // Refresh debts when any change occurs
          fetchDebts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchDebts]);

  return {
    debts,
    loading,
    error,
    refreshDebts: fetchDebts,
  };
}