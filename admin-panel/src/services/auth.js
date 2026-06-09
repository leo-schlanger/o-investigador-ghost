import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  const result = response.data;
  // Support both old and new API response formats
  return result.data || result;
};

export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  const result = response.data;
  return result.data || result;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/me', data);
  return response.data;
};

export const refreshToken = async () => {
  // O refresh token vem do cookie httpOnly (api tem withCredentials)
  const response = await api.post('/api/auth/refresh', {});
  const result = response.data;
  return result.data || result;
};

export const logout = async () => {
  // Limpa o cookie httpOnly do refresh token no servidor
  try {
    await api.post('/api/auth/logout', {});
  } catch {
    // ignorar — logout local prossegue de qualquer forma
  }
};
