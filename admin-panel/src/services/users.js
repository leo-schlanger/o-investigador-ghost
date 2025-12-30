import api from './api';

export const getUsers = async () => {
    const response = await api.get('/auth/users');
    return response.data;
};

export const deleteUser = async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
};

// Register is already in auth.js, can reuse or re-export
import { register } from './auth';
export { register as createUser };
