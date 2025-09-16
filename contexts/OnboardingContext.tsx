import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingDebt {
  type: 'owe' | 'owed';
  personName: string;
  amount: string;
  dueDate: string;
  category: string;
  note: string;
}

interface OnboardingContextType {
  debt: OnboardingDebt | null;
  setDebtType: (type: 'owe' | 'owed') => void;
  setDebtDetails: (details: Omit<OnboardingDebt, 'type'>) => void;
  clearDebt: () => void;
  isComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [debt, setDebt] = useState<OnboardingDebt | null>(null);

  const setDebtType = (type: 'owe' | 'owed') => {
    setDebt(prev => prev ? { ...prev, type } : {
      type,
      personName: '',
      amount: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      category: '',
      note: '',
    });
  };

  const setDebtDetails = (details: Omit<OnboardingDebt, 'type'>) => {
    setDebt(prev => prev ? { ...prev, ...details } : null);
  };

  const clearDebt = () => {
    setDebt(null);
  };

  const isComplete = debt !== null && 
    debt.personName.trim() !== '' && 
    debt.amount.trim() !== '' && 
    parseFloat(debt.amount) > 0;

  return (
    <OnboardingContext.Provider value={{
      debt,
      setDebtType,
      setDebtDetails,
      clearDebt,
      isComplete,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}