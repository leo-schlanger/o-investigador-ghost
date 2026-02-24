import api from './api';

export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getMedia = async () => {
    const response = await api.get('/api/media');
    return response.data;
};

export const deleteMedia = async (id) => {
    const response = await api.delete(`/api/media/${id}`);
    return response.data;
};
