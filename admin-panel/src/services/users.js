import api from './api';

export const getUsers = async () => {
  const response = await api.get('/api/auth/users');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/auth/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/api/auth/users', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/api/auth/users/${id}`, userData);
  return response.data;
};
