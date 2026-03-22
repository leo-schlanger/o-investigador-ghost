import api from './api';

// Media CRUD
export const uploadMedia = async (file, folderId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
        formData.append('folderId', folderId);
    }

    const response = await api.post('/api/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getMedia = async (params = {}) => {
    const { folderId, tags, search, page = 1, limit = 50 } = params;
    const queryParams = new URLSearchParams();

    if (folderId !== undefined) {
        queryParams.append('folderId', folderId === null ? 'null' : folderId);
    }
    if (tags && tags.length > 0) {
        queryParams.append('tags', tags.join(','));
    }
    if (search) {
        queryParams.append('search', search);
    }
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await api.get(`/api/media?${queryParams.toString()}`);
    return response.data;
};

export const getMediaById = async (id) => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
};

export const updateMedia = async (id, data) => {
    const response = await api.put(`/api/media/${id}`, data);
    return response.data;
};

export const deleteMedia = async (id) => {
    const response = await api.delete(`/api/media/${id}`);
    return response.data;
};

export const bulkMoveMedia = async (mediaIds, folderId) => {
    const response = await api.put('/api/media/bulk-move', { mediaIds, folderId });
    return response.data;
};

export const bulkAddTags = async (mediaIds, tagIds) => {
    const response = await api.put('/api/media/bulk-add-tags', { mediaIds, tagIds });
    return response.data;
};

// Folder CRUD
export const getFolders = async (format = 'tree') => {
    const response = await api.get(`/api/media/folders?format=${format}`);
    return response.data;
};

export const createFolder = async (name, parentId = null) => {
    const response = await api.post('/api/media/folders', { name, parentId });
    return response.data;
};

export const updateFolder = async (id, data) => {
    const response = await api.put(`/api/media/folders/${id}`, data);
    return response.data;
};

export const deleteFolder = async (id) => {
    const response = await api.delete(`/api/media/folders/${id}`);
    return response.data;
};

// Tag CRUD
export const getTags = async () => {
    const response = await api.get('/api/media/tags');
    return response.data;
};

export const getTagSuggestions = async (query = '') => {
    const response = await api.get(`/api/media/tags/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
};

export const createTag = async (name) => {
    const response = await api.post('/api/media/tags', { name });
    return response.data;
};

export const getOrCreateTag = async (name) => {
    const response = await api.post('/api/media/tags/get-or-create', { name });
    return response.data;
};

export const deleteTag = async (id) => {
    const response = await api.delete(`/api/media/tags/${id}`);
    return response.data;
};
