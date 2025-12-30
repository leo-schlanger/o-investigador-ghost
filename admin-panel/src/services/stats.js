import api from './api';

export const getStats = async () => {
    // In a real app, we'd have a /stats endpoint
    // Here we'll fetch lists and count them
    try {
        const [articlesRes, usersRes] = await Promise.all([
            api.get('/articles'),
            api.get('/auth/users')
        ]);

        return {
            articlesCount: articlesRes.data.length,
            usersCount: usersRes.data.length,
            viewsCount: 12345, // Mock
            storageUsage: '1.2 GB' // Mock
        };
    } catch (error) {
        console.error('Failed to fetch stats', error);
        return {
            articlesCount: 0,
            usersCount: 0,
            viewsCount: 0,
            storageUsage: '0 GB'
        };
    }
};
