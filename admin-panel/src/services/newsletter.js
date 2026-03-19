import api from './api';

// Check if Brevo API is configured
const isBrevoConfigured = () => {
    try {
        const config = localStorage.getItem('brevo_configured');
        return config === 'true';
    } catch (e) {
        return false;
    }
};

// Mock data for when Brevo is not configured
const MOCK_SUBSCRIBERS = [
    { id: 1, email: 'joao.silva@email.pt', name: 'Joao Silva', status: 'active', lists: ['Geral'], subscribedAt: '2026-01-15T10:30:00Z', opens: 45, clicks: 12 },
    { id: 2, email: 'maria.santos@email.pt', name: 'Maria Santos', status: 'active', lists: ['Geral', 'Premium'], subscribedAt: '2026-01-20T14:22:00Z', opens: 38, clicks: 8 },
    { id: 3, email: 'pedro.costa@email.pt', name: 'Pedro Costa', status: 'active', lists: ['Geral'], subscribedAt: '2026-02-01T09:15:00Z', opens: 22, clicks: 5 },
    { id: 4, email: 'ana.ferreira@email.pt', name: 'Ana Ferreira', status: 'unsubscribed', lists: ['Geral'], subscribedAt: '2025-12-10T16:45:00Z', opens: 15, clicks: 2 },
    { id: 5, email: 'carlos.oliveira@email.pt', name: 'Carlos Oliveira', status: 'active', lists: ['Premium'], subscribedAt: '2026-02-15T11:00:00Z', opens: 18, clicks: 4 },
];

const MOCK_CAMPAIGNS = [
    {
        id: 1,
        name: 'Briefing Semanal - Semana 10',
        subject: 'As noticias que marcaram a semana',
        status: 'sent',
        sentAt: '2026-03-08T08:00:00Z',
        recipients: 1250,
        opens: 487,
        clicks: 89,
        openRate: 38.96,
        clickRate: 7.12
    },
    {
        id: 2,
        name: 'Alerta: Eleicoes 2026',
        subject: 'URGENTE: Resultados preliminares das eleicoes',
        status: 'sent',
        sentAt: '2026-03-10T20:30:00Z',
        recipients: 1250,
        opens: 892,
        clicks: 234,
        openRate: 71.36,
        clickRate: 18.72
    },
    {
        id: 3,
        name: 'Briefing Semanal - Semana 11',
        subject: 'Resumo da semana: politica, economia e mais',
        status: 'scheduled',
        scheduledAt: '2026-03-22T08:00:00Z',
        recipients: 1280
    },
    {
        id: 4,
        name: 'Editorial de Marco',
        subject: 'A nossa visao sobre os acontecimentos do mes',
        status: 'draft',
        createdAt: '2026-03-15T14:00:00Z'
    },
];

const MOCK_LISTS = [
    { id: 1, name: 'Geral', subscribers: 1280, description: 'Lista principal de subscritores' },
    { id: 2, name: 'Premium', subscribers: 245, description: 'Subscritores premium com acesso antecipado' },
    { id: 3, name: 'Alertas', subscribers: 890, description: 'Subscritores para alertas de noticias urgentes' },
];

const MOCK_STATS = {
    totalSubscribers: 1280,
    activeSubscribers: 1215,
    unsubscribed: 65,
    totalCampaigns: 24,
    avgOpenRate: 42.5,
    avgClickRate: 8.3,
    lastCampaignDate: '2026-03-10T20:30:00Z',
    growth: {
        subscribers: 12.5,
        opens: 5.2,
        clicks: -2.1
    }
};

// ============ SUBSCRIBERS ============

export const getSubscribers = async (params = {}) => {
    if (!isBrevoConfigured()) {
        // Return mock data with filtering
        let filtered = [...MOCK_SUBSCRIBERS];

        if (params.status && params.status !== 'all') {
            filtered = filtered.filter(s => s.status === params.status);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            filtered = filtered.filter(s =>
                s.email.toLowerCase().includes(search) ||
                s.name.toLowerCase().includes(search)
            );
        }
        if (params.list) {
            filtered = filtered.filter(s => s.lists.includes(params.list));
        }

        return {
            data: filtered,
            total: filtered.length,
            page: params.page || 1,
            limit: params.limit || 20,
            isMock: true
        };
    }

    const response = await api.get('/api/newsletter/subscribers', { params });
    return response.data;
};

export const getSubscriber = async (id) => {
    if (!isBrevoConfigured()) {
        const subscriber = MOCK_SUBSCRIBERS.find(s => s.id === parseInt(id));
        return subscriber || null;
    }

    const response = await api.get(`/api/newsletter/subscribers/${id}`);
    return response.data;
};

export const createSubscriber = async (data) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - subscritor simulado', isMock: true };
    }

    const response = await api.post('/api/newsletter/subscribers', data);
    return response.data;
};

export const updateSubscriber = async (id, data) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - atualizacao simulada', isMock: true };
    }

    const response = await api.put(`/api/newsletter/subscribers/${id}`, data);
    return response.data;
};

export const deleteSubscriber = async (id) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - remocao simulada', isMock: true };
    }

    const response = await api.delete(`/api/newsletter/subscribers/${id}`);
    return response.data;
};

export const importSubscribers = async (file) => {
    if (!isBrevoConfigured()) {
        return { success: true, imported: 0, message: 'Modo de demonstracao - importacao simulada', isMock: true };
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/newsletter/subscribers/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const exportSubscribers = async (params = {}) => {
    if (!isBrevoConfigured()) {
        // Generate CSV from mock data
        const headers = ['Email', 'Nome', 'Status', 'Listas', 'Data Subscricao'];
        const rows = MOCK_SUBSCRIBERS.map(s => [
            s.email,
            s.name,
            s.status,
            s.lists.join(';'),
            new Date(s.subscribedAt).toLocaleDateString('pt-PT')
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        return { data: csv, filename: 'subscritores.csv', isMock: true };
    }

    const response = await api.get('/api/newsletter/subscribers/export', {
        params,
        responseType: 'blob'
    });
    return response.data;
};

// ============ LISTS ============

export const getLists = async () => {
    if (!isBrevoConfigured()) {
        return { data: MOCK_LISTS, isMock: true };
    }

    const response = await api.get('/api/newsletter/lists');
    return response.data;
};

export const createList = async (data) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - lista simulada', isMock: true };
    }

    const response = await api.post('/api/newsletter/lists', data);
    return response.data;
};

export const updateList = async (id, data) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - atualizacao simulada', isMock: true };
    }

    const response = await api.put(`/api/newsletter/lists/${id}`, data);
    return response.data;
};

export const deleteList = async (id) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - remocao simulada', isMock: true };
    }

    const response = await api.delete(`/api/newsletter/lists/${id}`);
    return response.data;
};

// ============ CAMPAIGNS ============

export const getCampaigns = async (params = {}) => {
    if (!isBrevoConfigured()) {
        let filtered = [...MOCK_CAMPAIGNS];

        if (params.status && params.status !== 'all') {
            filtered = filtered.filter(c => c.status === params.status);
        }
        if (params.search) {
            const search = params.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(search) ||
                c.subject.toLowerCase().includes(search)
            );
        }

        return {
            data: filtered,
            total: filtered.length,
            isMock: true
        };
    }

    const response = await api.get('/api/newsletter/campaigns', { params });
    return response.data;
};

export const getCampaign = async (id) => {
    if (!isBrevoConfigured()) {
        const campaign = MOCK_CAMPAIGNS.find(c => c.id === parseInt(id));
        if (campaign) {
            return {
                ...campaign,
                content: {
                    blocks: [
                        { type: 'header', data: { text: 'Cabecalho', level: 1 } },
                        { type: 'paragraph', data: { text: 'Conteudo de exemplo...' } }
                    ]
                },
                isMock: true
            };
        }
        return null;
    }

    const response = await api.get(`/api/newsletter/campaigns/${id}`);
    return response.data;
};

export const createCampaign = async (data) => {
    if (!isBrevoConfigured()) {
        return {
            success: true,
            id: Date.now(),
            message: 'Modo de demonstracao - campanha simulada',
            isMock: true
        };
    }

    const response = await api.post('/api/newsletter/campaigns', data);
    return response.data;
};

export const updateCampaign = async (id, data) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - atualizacao simulada', isMock: true };
    }

    const response = await api.put(`/api/newsletter/campaigns/${id}`, data);
    return response.data;
};

export const deleteCampaign = async (id) => {
    if (!isBrevoConfigured()) {
        return { success: true, message: 'Modo de demonstracao - remocao simulada', isMock: true };
    }

    const response = await api.delete(`/api/newsletter/campaigns/${id}`);
    return response.data;
};

export const sendCampaign = async (id) => {
    if (!isBrevoConfigured()) {
        return {
            success: false,
            message: 'Para enviar campanhas, configure as credenciais do Brevo nas configuracoes.',
            isMock: true
        };
    }

    const response = await api.post(`/api/newsletter/campaigns/${id}/send`);
    return response.data;
};

export const scheduleCampaign = async (id, scheduledAt) => {
    if (!isBrevoConfigured()) {
        return {
            success: true,
            message: 'Modo de demonstracao - agendamento simulado',
            isMock: true
        };
    }

    const response = await api.post(`/api/newsletter/campaigns/${id}/schedule`, { scheduledAt });
    return response.data;
};

export const sendTestEmail = async (id, email) => {
    if (!isBrevoConfigured()) {
        return {
            success: false,
            message: 'Para enviar email de teste, configure as credenciais do Brevo nas configuracoes.',
            isMock: true
        };
    }

    const response = await api.post(`/api/newsletter/campaigns/${id}/test`, { email });
    return response.data;
};

export const duplicateCampaign = async (id) => {
    if (!isBrevoConfigured()) {
        return {
            success: true,
            id: Date.now(),
            message: 'Modo de demonstracao - duplicacao simulada',
            isMock: true
        };
    }

    const response = await api.post(`/api/newsletter/campaigns/${id}/duplicate`);
    return response.data;
};

// ============ TEMPLATES ============

export const NEWSLETTER_TEMPLATES = [
    {
        id: 'daily-briefing',
        name: 'Briefing Diario',
        description: 'Resumo das principais noticias do dia',
        thumbnail: null,
        category: 'noticias',
        sections: ['header', 'featured', 'news-list', 'opinion', 'footer']
    },
    {
        id: 'weekly-digest',
        name: 'Resumo Semanal',
        description: 'As melhores noticias e analises da semana',
        thumbnail: null,
        category: 'noticias',
        sections: ['header', 'intro', 'featured', 'category-news', 'opinion', 'footer']
    },
    {
        id: 'breaking-news',
        name: 'Alerta de Noticia',
        description: 'Para noticias urgentes e de ultima hora',
        thumbnail: null,
        category: 'alertas',
        sections: ['header', 'alert-banner', 'main-story', 'footer']
    },
    {
        id: 'editorial',
        name: 'Editorial',
        description: 'Opiniao e analise aprofundada',
        thumbnail: null,
        category: 'opiniao',
        sections: ['header', 'author', 'content', 'related', 'footer']
    },
    {
        id: 'special-edition',
        name: 'Edicao Especial',
        description: 'Para coberturas especiais e eventos',
        thumbnail: null,
        category: 'especial',
        sections: ['header', 'hero', 'timeline', 'analysis', 'gallery', 'footer']
    }
];

export const getTemplates = async () => {
    return { data: NEWSLETTER_TEMPLATES };
};

export const getTemplate = async (id) => {
    return NEWSLETTER_TEMPLATES.find(t => t.id === id) || null;
};

// ============ STATISTICS ============

export const getStats = async () => {
    if (!isBrevoConfigured()) {
        return { ...MOCK_STATS, isMock: true };
    }

    const response = await api.get('/api/newsletter/stats');
    return response.data;
};

export const getCampaignStats = async (id) => {
    if (!isBrevoConfigured()) {
        const campaign = MOCK_CAMPAIGNS.find(c => c.id === parseInt(id));
        if (campaign && campaign.status === 'sent') {
            return {
                opens: campaign.opens,
                clicks: campaign.clicks,
                openRate: campaign.openRate,
                clickRate: campaign.clickRate,
                bounces: Math.floor(campaign.recipients * 0.02),
                unsubscribes: Math.floor(campaign.recipients * 0.005),
                timeline: [
                    { hour: '08:00', opens: 120, clicks: 15 },
                    { hour: '09:00', opens: 180, clicks: 28 },
                    { hour: '10:00', opens: 95, clicks: 22 },
                    { hour: '11:00', opens: 52, clicks: 14 },
                    { hour: '12:00', opens: 40, clicks: 10 },
                ],
                isMock: true
            };
        }
        return null;
    }

    const response = await api.get(`/api/newsletter/campaigns/${id}/stats`);
    return response.data;
};

// ============ SETTINGS ============

export const getNewsletterSettings = async () => {
    if (!isBrevoConfigured()) {
        return {
            configured: false,
            senderName: '',
            senderEmail: '',
            replyTo: '',
            defaultList: null,
            doubleOptIn: true,
            welcomeEmail: true,
            unsubscribePage: '',
            isMock: true
        };
    }

    const response = await api.get('/api/newsletter/settings');
    return response.data;
};

export const updateNewsletterSettings = async (data) => {
    // This should work even without Brevo to save local settings
    const response = await api.put('/api/newsletter/settings', data);

    // Update local storage flag
    if (data.apiKey) {
        try {
            localStorage.setItem('brevo_configured', 'true');
        } catch (e) {
            console.warn('localStorage not available');
        }
    }

    return response.data;
};

export const testBrevoConnection = async (apiKey) => {
    try {
        const response = await api.post('/api/newsletter/test-connection', { apiKey });
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Erro ao testar conexao' };
    }
};

// ============ CAMPAIGN STATUS CONSTANTS ============

export const CAMPAIGN_STATUS = {
    draft: { value: 'draft', label: 'Rascunho', color: 'gray' },
    scheduled: { value: 'scheduled', label: 'Agendado', color: 'blue' },
    sending: { value: 'sending', label: 'A enviar', color: 'yellow' },
    sent: { value: 'sent', label: 'Enviado', color: 'green' },
    failed: { value: 'failed', label: 'Falhou', color: 'red' }
};

export const SUBSCRIBER_STATUS = {
    active: { value: 'active', label: 'Ativo', color: 'green' },
    unsubscribed: { value: 'unsubscribed', label: 'Cancelado', color: 'red' },
    bounced: { value: 'bounced', label: 'Bounce', color: 'orange' },
    blocked: { value: 'blocked', label: 'Bloqueado', color: 'gray' }
};
