import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Search,
  Plus,
  MoreVertical,
  Eye,
  MousePointer,
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Copy,
  Edit2,
  Calendar,
  Users,
  FileText,
  RefreshCw,
  BarChart2
} from 'lucide-react';
import {
  getCampaigns,
  deleteCampaign,
  duplicateCampaign,
  CAMPAIGN_STATUS
} from '../../services/newsletter';
import { useNotification } from '../../context/NotificationContext';
import NewsletterNav from './NewsletterNav';

const Campaigns = () => {
  const navigate = useNavigate();
  const { showError, showInfo } = useNotification();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [isMock, setIsMock] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Action menu
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [search, statusFilter, page]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCampaigns({
        search,
        status: statusFilter,
        page,
        limit
      });
      setCampaigns(response.data || []);
      setTotal(response.total || 0);
      setIsMock(response.isMock || false);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta campanha?')) return;

    try {
      await deleteCampaign(id);
      fetchCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      showError('Erro ao eliminar campanha');
    }
    setOpenMenu(null);
  };

  const handleDuplicate = async (id) => {
    try {
      const result = await duplicateCampaign(id);
      if (result.isMock) {
        showInfo('Modo de demonstracao: campanha duplicada simulada.');
      }
      fetchCampaigns();
    } catch (err) {
      console.error('Error duplicating campaign:', err);
      showError('Erro ao duplicar campanha');
    }
    setOpenMenu(null);
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

  const getStatusIcon = (status) => {
    const icons = {
      draft: FileText,
      scheduled: Clock,
      sending: Send,
      sent: Send,
      failed: AlertCircle
    };
    return icons[status] || FileText;
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Newsletter</h1>
          <p className="text-gray-500 text-sm">{total} campanhas no total</p>
        </div>
        <Link
          to="/newsletter/campaigns/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light text-sm"
        >
          <Plus size={18} />
          Nova Campanha
        </Link>
      </div>

      {/* Navigation Tabs */}
      <NewsletterNav />

      {/* Mock Warning */}
      {isMock && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
          <AlertCircle className="text-yellow-600 shrink-0" size={16} />
          <span className="text-yellow-700">Modo de demonstracao - dados simulados.</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Pesquisar campanhas..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
          >
            <option value="all">Todos os status</option>
            <option value="draft">Rascunhos</option>
            <option value="scheduled">Agendados</option>
            <option value="sent">Enviados</option>
            <option value="failed">Falhados</option>
          </select>
          <button
            onClick={fetchCampaigns}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Atualizar"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhuma campanha encontrada</p>
            <Link
              to="/newsletter/campaigns/new"
              className="text-brand text-sm hover:underline mt-2 inline-block"
            >
              Criar primeira campanha
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {campaigns.map((campaign) => {
              const StatusIcon = getStatusIcon(campaign.status);
              return (
                <div key={campaign.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <StatusIcon className="text-brand" size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/newsletter/campaigns/${campaign.id}`}
                          className="font-medium hover:text-brand block truncate"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-sm text-gray-500 truncate">{campaign.subject}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                          {campaign.status === 'sent' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Users size={12} />
                                {campaign.recipients?.toLocaleString()} destinatarios
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDateTime(campaign.sentAt)}
                              </span>
                            </>
                          )}
                          {campaign.status === 'scheduled' && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <Clock size={12} />
                              Agendado para {formatDateTime(campaign.scheduledAt)}
                            </span>
                          )}
                          {campaign.status === 'draft' && (
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Criado em {formatDate(campaign.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Stats for sent campaigns */}
                      {campaign.status === 'sent' && (
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Eye size={14} />
                              <span className="font-medium">{campaign.openRate?.toFixed(1)}%</span>
                            </div>
                            <p className="text-xs text-gray-400">Aberturas</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MousePointer size={14} />
                              <span className="font-medium">{campaign.clickRate?.toFixed(1)}%</span>
                            </div>
                            <p className="text-xs text-gray-400">Cliques</p>
                          </div>
                        </div>
                      )}

                      {getStatusBadge(campaign.status)}

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === campaign.id ? null : campaign.id)}
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenu === campaign.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20">
                              <Link
                                to={`/newsletter/campaigns/${campaign.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                onClick={() => setOpenMenu(null)}
                              >
                                <Edit2 size={14} />
                                {campaign.status === 'draft' ? 'Editar' : 'Ver detalhes'}
                              </Link>
                              {campaign.status === 'sent' && (
                                <Link
                                  to={`/newsletter/campaigns/${campaign.id}/stats`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                                  onClick={() => setOpenMenu(null)}
                                >
                                  <BarChart2 size={14} />
                                  Ver estatisticas
                                </Link>
                              )}
                              <button
                                onClick={() => handleDuplicate(campaign.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-left"
                              >
                                <Copy size={14} />
                                Duplicar
                              </button>
                              {campaign.status === 'draft' && (
                                <button
                                  onClick={() => handleDelete(campaign.id)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 text-red-600 text-left"
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
