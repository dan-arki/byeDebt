import { useState, useEffect } from 'react';
import { AuthState, User } from '../types/auth';
import { AuthService } from '../services/authService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    hasSkippedAuth: false,
    isLoading: true,
  });

  const loadAuthState = async () => {
    try {
      const state = await AuthService.getAuthState();
      setAuthState(state);
    } catch (error) {
      console.error('Error loading auth state:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: false,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const user = await AuthService.login(email, password);
      setAuthState({
        isAuthenticated: true,
        user,
        hasSkippedAuth: false,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<void> => {
    try {
      const user = await AuthService.register(email, password, name);
      setAuthState({
        isAuthenticated: true,
        user,
        hasSkippedAuth: false,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    // Set loading state to show user feedback
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await AuthService.logout();
      
      // Clear local state immediately after successful logout
      setAuthState({
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: false,
        isLoading: false,
      });
      
      // Show success feedback
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, clear local state for security
      setAuthState({
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: false,
        isLoading: false,
      });
      
      // Re-throw error so UI can handle it
      throw error;
    }
  };

  const skipAuth = async (): Promise<void> => {
    try {
      await AuthService.skipAuth();
      setAuthState({
        isAuthenticated: false,
        user: null,
        hasSkippedAuth: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Skip auth error:', error);
    }
  };

  useEffect(() => {
    loadAuthState();
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    skipAuth,
    refreshAuthState: loadAuthState,
  };
}