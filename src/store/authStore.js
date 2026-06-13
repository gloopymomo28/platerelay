import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getMe } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session });
        try {
          const user = await getMe();
          set({ user, loading: false, initialized: true });
        } catch {
          set({ user: null, loading: false, initialized: true });
        }
      } else {
        set({ loading: false, initialized: true });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session });
        if (event === 'SIGNED_IN' && session) {
          try {
            const user = await getMe();
            set({ user });
          } catch {
            set({ user: null });
          }
        }
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session });
    try {
      const user = await getMe();
      set({ user });
      return user;
    } catch {
      return null;
    }
  },

  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  refreshUser: async () => {
    try {
      const user = await getMe();
      set({ user });
      return user;
    } catch {
      return null;
    }
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
