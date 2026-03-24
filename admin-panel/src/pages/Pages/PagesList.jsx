import React, { useState, useEffect, useCallback } from 'react';
import { getPages, deletePage } from '../../services/pages';
import { Link } from 'react-router-dom';
import { Search, Trash2, Edit, Plus, FileText } from 'lucide-react';

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      };

      const response = await getPages(params);
      setPages(response.pages || response || []);
    } catch (err) {
      console.error('Failed to fetch pages', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido';
      if (errorMessage.includes('Ghost API is not configured')) {
        setError('API do Ghost nao esta configurada. Verifique as variaveis de ambiente.');
      } else if (errorMessage.includes('Network Error')) {
        setError('Erro de conexao. Verifique se o servidor esta rodando.');
      } else {
        setError(`Falha ao carregar paginas: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (page) => {
    setDeleting(true);
    try {
      await deletePage(page.id);
      setDeleteConfirm(null);
      fetchPages();
    } catch (error) {
      console.error('Failed to delete page', error);
      alert('Falha ao excluir pagina');
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
      published: 'Publicada',
      draft: 'Rascunho',
      scheduled: 'Agendada'
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}
      >
        {labels[status] || status}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Paginas</h1>
        <Link
          to="/pages/new"
          className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded hover:bg-brand-light"
        >
          <Plus size={18} />
          Nova Pagina
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paginas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
        >
          <option value="all">Todos os status</option>
          <option value="draft">Rascunhos</option>
          <option value="published">Publicadas</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchPages}
            className="mt-2 text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atualizada
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhuma pagina encontrada. Crie a primeira!</p>
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        <div className="text-xs text-gray-500">/{page.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(page.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(page.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/pages/${page.id}`}
                          className="p-2 text-gray-500 hover:text-brand rounded hover:bg-gray-100"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(page)}
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar exclusao</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a pagina <strong>"{deleteConfirm.title}"</strong>? Esta
              acao nao pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
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

export default PagesList;
