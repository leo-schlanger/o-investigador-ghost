import api from './api';

export const getStats = async () => {
    try {
        const [articlesRes, usersRes] = await Promise.all([
            api.get('/api/articles'),
            api.get('/api/auth/users')
        ]);

        // articlesRes.data returns { articles: [], meta: {} }
        const articlesCount = articlesRes.data.articles?.length || articlesRes.data.meta?.pagination?.total || 0;
        const usersCount = Array.isArray(usersRes.data) ? usersRes.data.length : 0;

        return {
            articlesCount,
            usersCount,
            viewsCount: 12345, // Mock - seria integrado com analytics
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
