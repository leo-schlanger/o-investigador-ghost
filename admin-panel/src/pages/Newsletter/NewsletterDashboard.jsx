import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Users, Send, TrendingUp, TrendingDown,
    Eye, MousePointer, AlertCircle, Plus, Clock,
    BarChart2, ArrowRight, Settings, FileText
} from 'lucide-react';
import { getStats, getCampaigns, CAMPAIGN_STATUS } from '../../services/newsletter';

const NewsletterDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, campaignsData] = await Promise.all([
                getStats(),
                getCampaigns({ limit: 5 })
            ]);
            setStats(statsData);
            setRecentCampaigns(campaignsData.data || []);
        } catch (err) {
            console.error('Error fetching newsletter data:', err);
            setError('Erro ao carregar dados da newsletter');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num?.toLocaleString() || '0';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-PT', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const GrowthIndicator = ({ value }) => {
        if (!value) return null;
        const isPositive = value > 0;
        return (
            <span className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="ml-1">{Math.abs(value).toFixed(1)}%</span>
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const statusInfo = CAMPAIGN_STATUS[status] || CAMPAIGN_STATUS.draft;
        const colors = {
            gray: 'bg-gray-100 text-gray-700',
            blue: 'bg-blue-100 text-blue-700',
            yellow: 'bg-yellow-100 text-yellow-700',
            green: 'bg-green-100 text-green-700',
            red: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[statusInfo.color]}`}>
                {statusInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Newsletter</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestao de campanhas e subscritores</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/newsletter/settings"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        <Settings size={18} />
                        <span className="hidden sm:inline">Configuracoes</span>
                    </Link>
                    <Link
                        to="/newsletter/campaigns/new"
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light text-sm"
                    >
                        <Plus size={18} />
                        Nova Campanha
                    </Link>
                </div>
            </div>

            {/* Mock Mode Warning */}
            {stats?.isMock && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-yellow-800 font-medium">Modo de Demonstracao</p>
                        <p className="text-yellow-700 text-sm mt-1">
                            Os dados apresentados sao simulados. Configure as credenciais do Brevo nas{' '}
                            <Link to="/newsletter/settings" className="underline font-medium">configuracoes</Link>
                            {' '}para conectar a sua conta real.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="text-brand" size={24} />
                        <GrowthIndicator value={stats?.growth?.subscribers} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{formatNumber(stats?.totalSubscribers)}</p>
                    <p className="text-gray-500 text-sm">Subscritores</p>
                    <p className="text-xs text-gray-400 mt-1">{stats?.activeSubscribers} ativos</p>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Send className="text-green-600" size={24} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.totalCampaigns || 0}</p>
                    <p className="text-gray-500 text-sm">Campanhas Enviadas</p>
                    <p className="text-xs text-gray-400 mt-1">Ultima: {formatDate(stats?.lastCampaignDate)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Eye className="text-blue-600" size={24} />
                        <GrowthIndicator value={stats?.growth?.opens} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.avgOpenRate?.toFixed(1) || 0}%</p>
                    <p className="text-gray-500 text-sm">Taxa de Abertura</p>
                    <p className="text-xs text-gray-400 mt-1">Media das campanhas</p>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                        <MousePointer className="text-purple-600" size={24} />
                        <GrowthIndicator value={stats?.growth?.clicks} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{stats?.avgClickRate?.toFixed(1) || 0}%</p>
                    <p className="text-gray-500 text-sm">Taxa de Cliques</p>
                    <p className="text-xs text-gray-400 mt-1">Media das campanhas</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Campaigns */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Mail size={18} />
                            Campanhas Recentes
                        </h2>
                        <Link
                            to="/newsletter/campaigns"
                            className="text-brand text-sm flex items-center gap-1 hover:underline"
                        >
                            Ver todas <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="divide-y">
                        {recentCampaigns.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FileText size={40} className="mx-auto mb-2 opacity-50" />
                                <p>Nenhuma campanha encontrada</p>
                                <Link
                                    to="/newsletter/campaigns/new"
                                    className="text-brand text-sm hover:underline mt-2 inline-block"
                                >
                                    Criar primeira campanha
                                </Link>
                            </div>
                        ) : (
                            recentCampaigns.map(campaign => (
                                <Link
                                    key={campaign.id}
                                    to={`/newsletter/campaigns/${campaign.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{campaign.name}</p>
                                        <p className="text-sm text-gray-500 truncate">{campaign.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4 shrink-0">
                                        {campaign.status === 'sent' && (
                                            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Eye size={14} />
                                                    {campaign.openRate?.toFixed(1)}%
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MousePointer size={14} />
                                                    {campaign.clickRate?.toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                        {campaign.status === 'scheduled' && (
                                            <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                                                <Clock size={14} />
                                                {formatDateTime(campaign.scheduledAt)}
                                            </span>
                                        )}
                                        {getStatusBadge(campaign.status)}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions & Info */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <BarChart2 size={18} />
                            Acoes Rapidas
                        </h2>
                        <div className="space-y-2">
                            <Link
                                to="/newsletter/campaigns/new"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                                    <Plus className="text-brand" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Nova Campanha</p>
                                    <p className="text-xs text-gray-500">Criar e enviar newsletter</p>
                                </div>
                            </Link>
                            <Link
                                to="/newsletter/subscribers"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <Users className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Gerir Subscritores</p>
                                    <p className="text-xs text-gray-500">Ver e importar contactos</p>
                                </div>
                            </Link>
                            <Link
                                to="/newsletter/campaigns/new?template=breaking-news"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                    <AlertCircle className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Alerta de Noticia</p>
                                    <p className="text-xs text-gray-500">Enviar noticia urgente</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Performance Tips */}
                    <div className="bg-gradient-to-br from-brand to-brand-dark rounded-lg p-4 text-white">
                        <h3 className="font-semibold mb-2">Dicas de Performance</h3>
                        <ul className="text-sm text-white/80 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="shrink-0">1.</span>
                                Envie entre 8h-10h para melhores taxas de abertura
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0">2.</span>
                                Use assuntos curtos e diretos (40-60 caracteres)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0">3.</span>
                                Inclua sempre uma call-to-action clara
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterDashboard;
