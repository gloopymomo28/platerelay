import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';

export const usePendingUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: async () => {
      const response = await client.get('/api/admin/users/pending');
      return response.data;
    },
  });
};

export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action, reason }) => {
      const response = await client.put(`/api/admin/users/${userId}/verify`, { action, reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAllUsers = (filters = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const response = await client.get('/api/admin/users', { params: filters });
      return response.data;
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await client.put(`/api/admin/users/${userId}/suspend`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAdminRelays = (filters = {}) => {
  return useQuery({
    queryKey: ['admin', 'relays', filters],
    queryFn: async () => {
      const response = await client.get('/api/admin/relays', { params: filters });
      return response.data;
    },
  });
};

export const useRemoveRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relayId) => {
      const response = await client.delete(`/api/admin/relays/${relayId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'relays'] });
    },
  });
};

export const useAdminDisputes = () => {
  return useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: async () => {
      const response = await client.get('/api/admin/disputes');
      return response.data;
    },
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ disputeId, notes }) => {
      const response = await client.put(`/api/admin/disputes/${disputeId}`, { admin_notes: notes, status: 'resolved' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
    },
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await client.get('/api/admin/stats');
      return response.data;
    },
  });
};
