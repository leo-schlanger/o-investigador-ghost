import api from './api';

export const getStats = async () => {
    try {
        const response = await api.get('/api/analytics/stats');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch stats', error);
        return {
            totalViews: 0,
            viewsToday: 0,
            viewsWeek: 0,
            viewsMonth: 0,
            articlesCount: 0,
            usersCount: 0
        };
    }
};

export const getTopArticles = async (limit = 10, period = 'all') => {
    try {
        const response = await api.get(`/api/analytics/top-articles?limit=${limit}&period=${period}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch top articles', error);
        return [];
    }
};

export const getViewsByCountry = async (limit = 10) => {
    try {
        const response = await api.get(`/api/analytics/views-by-country?limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch views by country', error);
        return [];
    }
};

export const getViewsTimeline = async (days = 30) => {
    try {
        const response = await api.get(`/api/analytics/views-timeline?days=${days}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch views timeline', error);
        return [];
    }
};
