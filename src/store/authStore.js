import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getMe } from '../api/auth';
import client from '../api/client';

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
    } catch (backendErr) {
      // Backend couldn't find the user doc — don't silently default to 'donor'.
      // Instead, try to use any Supabase user metadata we have.
      console.error('Failed to fetch user profile from backend:', backendErr);
      const minimalUser = {
        email,
        role: null,            // null = unknown, the UI should handle this gracefully
        org_name: email.split('@')[0],
        _backendUnavailable: true,
      };
      set({ user: minimalUser });
      return minimalUser;
    }
  },

  /**
   * register — Creates Supabase user, then calls our backend to create the
   * MongoDB user document with role + org info. Falls back gracefully if the
   * backend is unavailable (useful during hackathon demo).
   */
  register: async (email, password, role = 'donor', org_name = '') => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Try to create user document on our backend
    try {
      await client.post('/api/auth/register', {
        supabase_uid: data.user?.id,
        email,
        role,
        org_name: org_name || email.split('@')[0],
      });
    } catch (backendError) {
      // Backend may not be running during demo — store a minimal user locally
      console.warn('Backend not available, using local user state:', backendError.message);
    }

    // Set a provisional user state so the app can route correctly
    const provisionalUser = {
      email,
      role,
      org_name: org_name || email.split('@')[0],
      verification_status: 'pending_verification',
      subscription: { plan: 'free' },
    };
    set({ user: provisionalUser, session: data.session });
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
