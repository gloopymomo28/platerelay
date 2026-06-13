import { useMutation, useQuery } from '@tanstack/react-query';
import client from './client';

export const useCreateSubscription = () => {
  return useMutation({
    mutationFn: async (planId) => {
      const response = await client.post('/api/subscriptions/create', { plan_id: planId });
      return response.data;
    },
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (data) => {
      const response = await client.post('/api/subscriptions/verify', data);
      return response.data;
    },
  });
};

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const response = await client.get('/api/subscriptions/status');
      return response.data;
    },
  });
};
