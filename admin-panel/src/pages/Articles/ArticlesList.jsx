import React, { useState, useEffect, useCallback } from 'react';
import { getArticles, deleteArticle, ARTICLE_TYPES } from '../../services/articles';
import { Link } from 'react-router-dom';
import { Search, Filter, Trash2, Edit, Plus, ChevronLeft, ChevronRight, AlertCircle, X, RefreshCw, FileText } from 'lucide-react';

const ArticlesList = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: pagination.page,
                limit: 15,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                search: searchQuery || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined
            };

            const response = await getArticles(params);

            // Handle both array response and object with articles/meta
            if (Array.isArray(response)) {
                setArticles(response);
                setPagination(prev => ({ ...prev, pages: 1, total: response.length }));
            } else {
                setArticles(response.articles || []);
                if (response.meta?.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        pages: response.meta.pagination.pages,
                        total: response.meta.pagination.total
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch articles', err);
            const errorMessage = err.response?.data?.error
                || err.response?.data?.message
                || err.message
                || 'Erro desconhecido';

            // Traduzir erros comuns
            if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
                setError('Erro de conexao. Verifique se o servidor esta rodando.');
            } else if (errorMessage.includes('Ghost API is not configured')) {
                setError('API do Ghost nao esta configurada. Verifique as variaveis de ambiente.');
            } else if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
                setError('Sessao expirada. Faca login novamente.');
            } else {
                setError(`Erro ao carregar artigos: ${errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    }, [pagination.page, statusFilter, typeFilter, searchQuery]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (pagination.page !== 1) {
                setPagination(prev => ({ ...prev, page: 1 }));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDelete = async (article) => {
        setDeleting(true);
        setDeleteError('');
        try {
            await deleteArticle(article.id);
            setDeleteConfirm(null);
            fetchArticles();
        } catch (err) {
            console.error('Failed to delete article', err);
            const errorMessage = err.response?.data?.error
                || err.response?.data?.message
                || err.message
                || 'Erro desconhecido';

            if (errorMessage.includes('not found')) {
                setDeleteError('Artigo nao encontrado. Pode ter sido deletado por outro usuario.');
            } else if (errorMessage.includes('Network Error')) {
                setDeleteError('Erro de conexao. Verifique sua internet.');
            } else {
                setDeleteError(`Erro ao excluir: ${errorMessage}`);
            }
        } finally {
            setDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-green-100 text-green-800',
            draft: 'bg-gray-100 text-gray-800',
            scheduled: 'bg-blue-100 text-blue-800'
        };
        const labels = {
            published: 'Publicado',
            draft: 'Rascunho',
            scheduled: 'Agendado'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getTypeBadge = (articleType) => {
        if (!articleType) return null;

        const typeConfig = ARTICLE_TYPES[articleType];
        if (!typeConfig) return null;

        const colorStyles = {
            purple: 'bg-purple-100 text-purple-800',
            blue: 'bg-blue-100 text-blue-800',
            orange: 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorStyles[typeConfig.color] || 'bg-gray-100 text-gray-800'}`}>
                {typeConfig.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold">Artigos</h1>
                <Link
                    to="/articles/new"
                    className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded hover:bg-brand-light"
                >
                    <Plus size={18} />
                    Novo Artigo
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar artigos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand appearance-none bg-white"
                    >
                        <option value="all">Todos os status</option>
                        <option value="draft">Rascunhos</option>
                        <option value="published">Publicados</option>
                        <option value="scheduled">Agendados</option>
                    </select>
                </div>

                {/* Type Filter */}
                <div className="relative">
                    <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand appearance-none bg-white"
                    >
                        <option value="all">Todos os tipos</option>
                        <option value="cronica">Cronica</option>
                        <option value="reportagem">Reportagem</option>
                        <option value="opiniao">Opiniao</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg mb-6 overflow-hidden">
                    <div className="px-4 py-3 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="text-red-400 hover:text-red-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="px-4 pb-3 flex gap-2">
                        <button
                            onClick={fetchArticles}
                            className="flex items-center gap-1 text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            <RefreshCw size={12} />
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                    </div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Artigo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Atualizado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acoes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {articles.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                                ? 'Nenhum artigo encontrado com os filtros aplicados.'
                                                : 'Nenhum artigo ainda. Crie o primeiro!'}
                                        </td>
                                    </tr>
                                ) : (
                                    articles.map((article) => (
                                        <tr key={article.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        /{article.slug}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getTypeBadge(article.article_type) || (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(article.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(article.updated_at || article.updatedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/articles/${article.id}`}
                                                        className="p-2 text-gray-500 hover:text-brand rounded hover:bg-gray-100"
                                                        title="Editar"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirm(article)}
                                                        className="p-2 text-gray-500 hover:text-red-500 rounded hover:bg-red-50"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                    Pagina {pagination.page} de {pagination.pages} ({pagination.total} artigos)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page <= 1}
                                        className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page >= pagination.pages}
                                        className="p-2 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusao</h3>
                        <p className="text-gray-600 mb-4">
                            Tem certeza que deseja excluir o artigo <strong>"{deleteConfirm.title}"</strong>?
                            Esta acao nao pode ser desfeita.
                        </p>

                        {deleteError && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                <p className="text-red-700 text-sm">{deleteError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteConfirm(null);
                                    setDeleteError('');
                                }}
                                disabled={deleting}
                                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                {deleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticlesList;
