import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';
import { useEffect } from 'react';

interface AuthState {
  user: User | null;
  profile: any | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ user: data.user, profile, loading: false, error: null });
      }
    } catch (error) {
      set({ loading: false, error: error as AuthError });
      throw error;
    }
  },
  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null, error: null });
  },
  loadUser: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        set({ user, profile, loading: false, error: null });
      } else {
        set({ user: null, profile: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ loading: false, error: error as AuthError });
    }
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ user: session.user, profile, loading: false, error: null });
      } else {
        set({ user: null, profile: null, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, error: error as AuthError });
    }
  },
}));
