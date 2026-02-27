import api from './api';

export const getNavigation = async () => {
    const response = await api.get('/api/navigation');
    return response.data;
};

export const updateNavigation = async (data) => {
    const response = await api.put('/api/navigation', data);
    return response.data;
};
