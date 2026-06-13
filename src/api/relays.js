import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';

export const useNearbyRelays = (lat, lng, radiusKm = 10) => {
  return useQuery({
    queryKey: ['relays', 'nearby', lat, lng, radiusKm],
    queryFn: async () => {
      const response = await client.get('/api/relays/nearby', {
        params: { lat, lng, radius_km: radiusKm },
      });
      return response.data;
    },
    enabled: !!lat && !!lng,
    refetchInterval: 30000,
  });
};

export const useMyRelays = (page = 1) => {
  return useQuery({
    queryKey: ['relays', 'mine', page],
    queryFn: async () => {
      const response = await client.get('/api/relays/mine', { params: { page } });
      return response.data;
    },
  });
};

export const useRelay = (id) => {
  return useQuery({
    queryKey: ['relay', id],
    queryFn: async () => {
      const response = await client.get(`/api/relays/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useClaimedRelays = (page = 1) => {
  return useQuery({
    queryKey: ['relays', 'claimed', page],
    queryFn: async () => {
      const response = await client.get('/api/relays/claimed', { params: { page } });
      return response.data;
    },
  });
};

export const useCreateRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const response = await client.post('/api/relays', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relays'] });
    },
  });
};

export const useClaimRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relayId) => {
      const response = await client.post(`/api/relays/${relayId}/claim`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relays'] });
    },
  });
};

export const useUnclaimRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relayId) => {
      const response = await client.delete(`/api/relays/${relayId}/claim`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relays'] });
    },
  });
};

export const useConfirmRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relayId) => {
      const response = await client.post(`/api/relays/${relayId}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relays'] });
    },
  });
};

export const useCancelRelay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (relayId) => {
      const response = await client.delete(`/api/relays/${relayId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relays'] });
    },
  });
};
