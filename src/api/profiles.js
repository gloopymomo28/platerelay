import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from './client';

export const usePublicProfile = (userId) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await client.get(`/api/profiles/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useShelterPhotos = (userId) => {
  return useQuery({
    queryKey: ['shelter-photos', userId],
    queryFn: async () => {
      const response = await client.get(`/api/profiles/${userId}/photos`);
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUploadShelterPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, caption }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption);
      const response = await client.post('/api/profiles/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelter-photos'] });
    },
  });
};
