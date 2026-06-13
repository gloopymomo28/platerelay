import { useQuery } from '@tanstack/react-query';
import client from './client';

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await client.get('/api/leaderboard');
      return response.data;
    },
  });
};
