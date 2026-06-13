import client from './client';

export const registerUser = async (data) => {
  const response = await client.post('/api/auth/register', data);
  return response.data;
};

export const completeProfile = async (data) => {
  const response = await client.post('/api/auth/complete-profile', data);
  return response.data;
};

export const uploadDocument = async (file, docType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);
  const response = await client.post('/api/auth/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getMe = async () => {
  const response = await client.get('/api/auth/me');
  return response.data;
};

export const updateMe = async (data) => {
  const response = await client.put('/api/auth/me', data);
  return response.data;
};
