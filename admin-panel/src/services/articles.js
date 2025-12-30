import api from './api';

export const getArticles = async (params) => {
    const response = await api.get('/articles', { params });
    return response.data;
};

export const getArticle = async (id) => {
    const response = await api.get(`/articles/${id}`);
    return response.data;
};

export const createArticle = async (data) => {
    const response = await api.post('/articles', data);
    return response.data;
};

export const updateArticle = async (id, data) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
};

export const deleteArticle = async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
};
