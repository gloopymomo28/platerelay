import { useQuery, useMutation } from '@tanstack/react-query';
import client from './client';

export const useImpactSummary = () => {
  return useQuery({
    queryKey: ['impact', 'summary'],
    queryFn: async () => {
      const response = await client.get('/api/impact/summary');
      return response.data;
    },
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async ({ month, year }) => {
      const response = await client.post('/api/impact/reports/generate', { month, year });
      return response.data;
    },
  });
};

export const useReports = () => {
  return useQuery({
    queryKey: ['impact', 'reports'],
    queryFn: async () => {
      const response = await client.get('/api/impact/reports');
      return response.data;
    },
  });
};
