import api from './api';

export const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
