// src/store/useAuthStore.ts
import { create } from 'zustand';
import { UserData } from '../types';
import { getCurrentUser, signIn, signOut, signUp, resetPassword as resetPasswordRequest, updatePassword, resendVerificationEmail as resendEmailRequest } from '../services/supabase'; // Import resendVerificationEmail

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, mobileNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>; // New action
  updateUserPassword: (newPassword: string) => Promise<void>; // New action
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      if (data?.user) {
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          throw new Error('Please verify your email before signing in');
        }
        
        const { data: userData } = await getCurrentUser();
        if (userData?.user) {
          set({
            user: userData.user,
            isLoggedIn: true,
          });
        }
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to login' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  register: async (email, password, fullName, mobileNumber) => {
    set({ isLoading: true, error: null });
    try {
      const data = await signUp(email, password, fullName, mobileNumber);
      
      if (data?.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            emailConfirmed: false,
            profile: {
              id: '',
              fullName,
              mobileNumber,
              countryCode: 'IN',
              countryName: 'India',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          isLoggedIn: false,
        });
      } else {
        throw new Error('Registration failed - no user data returned');
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to register' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut();
      set({ user: null, isLoggedIn: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to logout' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadUser: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await getCurrentUser();
      
      if (error) {
        // If we get a 403 error or user not found, log out the user
        if (error.status === 403 || error.message?.includes('user_not_found')) {
          await get().logout();
          return;
        }
        throw error;
      }
      
      if (data?.user) {
        set({
          user: data.user,
          isLoggedIn: true,
        });
      } else {
        // If no user data is returned, log out
        await get().logout();
      }
    } catch (error: any) {
      // For any other errors, clear the user state
      set({ user: null, isLoggedIn: false });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await resetPasswordRequest(email);
      if (error) throw error;
      set({ error: 'Password reset link sent to your email' });
    } catch (error: any) {
      set({ error: error.message || 'Failed to send reset link' });
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerificationEmail: async (email) => { // New action implementation
    set({ isLoading: true, error: null });
    try {
      const { error } = await resendEmailRequest(email);
      if (error) throw error;
      set({ error: 'Verification email resent successfully!' }); // Using error state for success message
    } catch (error: any) {
      set({ error: error.message || 'Failed to resend verification email' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateUserPassword: async (newPassword) => { // New action implementation
    set({ isLoading: true, error: null });
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      set({ error: 'Password updated successfully!' });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update password' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})); 