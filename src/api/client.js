import axios from 'axios';
import { supabase } from '../lib/supabase';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Auth token interceptor
client.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Failed to get auth session:', error);
  }
  return config;
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/api/auth/me')) {
      // Token expired — redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
