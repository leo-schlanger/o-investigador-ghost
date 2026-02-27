import api from './api';

export const getPages = async (params) => {
    const response = await api.get('/api/pages', { params });
    return response.data;
};

export const getPage = async (id) => {
    const response = await api.get(`/api/pages/${id}`);
    return response.data;
};

export const createPage = async (data) => {
    const response = await api.post('/api/pages', data);
    return response.data;
};

export const updatePage = async (id, data) => {
    const response = await api.put(`/api/pages/${id}`, data);
    return response.data;
};

export const deletePage = async (id) => {
    const response = await api.delete(`/api/pages/${id}`);
    return response.data;
};
