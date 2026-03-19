import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Search, Download, Upload, Plus,
    Mail, Trash2, Edit2,
    ChevronRight, AlertCircle, CheckCircle, XCircle,
    RefreshCw
} from 'lucide-react';
import {
    getSubscribers, getLists, deleteSubscriber,
    createSubscriber, importSubscribers, exportSubscribers,
    SUBSCRIBER_STATUS
} from '../../services/newsletter';
import NewsletterNav from './NewsletterNav';

const Subscribers = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [isMock, setIsMock] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [listFilter, setListFilter] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] = useState(null);

    // Form state
    const [newSubscriber, setNewSubscriber] = useState({ email: '', name: '', lists: [] });
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        fetchSubscribers();
    }, [search, statusFilter, listFilter, page]);

    const fetchLists = async () => {
        try {
            const response = await getLists();
            setLists(response.data || []);
        } catch (err) {
            console.error('Error fetching lists:', err);
        }
    };

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getSubscribers({
                search,
                status: statusFilter,
                list: listFilter,
                page,
                limit
            });
            setSubscribers(response.data || []);
            setTotal(response.total || 0);
            setIsMock(response.isMock || false);
        } catch (err) {
            console.error('Error fetching subscribers:', err);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, listFilter, page]);

    const handleSearchChange = useCallback((e) => {
        setSearch(e.target.value);
        setPage(1);
    }, []);

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setPage(1);
    };

    const handleListChange = (e) => {
        setListFilter(e.target.value);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover este subscritor?')) return;

        try {
            await deleteSubscriber(id);
            fetchSubscribers();
        } catch (err) {
            console.error('Error deleting subscriber:', err);
            alert('Erro ao remover subscritor');
        }
    };

    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormLoading(true);

        try {
            const result = await createSubscriber(newSubscriber);
            if (result.isMock) {
                alert('Modo de demonstracao: subscritor nao foi realmente adicionado.');
            }
            setShowAddModal(false);
            setNewSubscriber({ email: '', name: '', lists: [] });
            fetchSubscribers();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Erro ao adicionar subscritor');
        } finally {
            setFormLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const result = await exportSubscribers({ status: statusFilter, list: listFilter });

            if (result.isMock) {
                // Download mock CSV
                const blob = new Blob([result.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', result.filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } else {
                // Handle real blob response
                const url = window.URL.createObjectURL(new Blob([result]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'subscritores.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            console.error('Error exporting:', err);
            alert('Erro ao exportar subscritores');
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await importSubscribers(file);
            if (result.isMock) {
                alert('Modo de demonstracao: importacao simulada.');
            } else {
                alert(`Importados ${result.imported} subscritores com sucesso!`);
            }
            setShowImportModal(false);
            fetchSubscribers();
        } catch (err) {
            console.error('Error importing:', err);
            alert('Erro ao importar ficheiro');
        }
    };

    const getStatusBadge = (status) => {
        const statusInfo = SUBSCRIBER_STATUS[status] || SUBSCRIBER_STATUS.active;
        const colors = {
            green: 'bg-green-100 text-green-700',
            red: 'bg-red-100 text-red-700',
            orange: 'bg-orange-100 text-orange-700',
            gray: 'bg-gray-100 text-gray-700'
        };
        const icons = {
            active: CheckCircle,
            unsubscribed: XCircle,
            bounced: AlertCircle,
            blocked: XCircle
        };
        const Icon = icons[status] || CheckCircle;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[statusInfo.color]}`}>
                <Icon size={12} />
                {statusInfo.label}
            </span>
        );
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Newsletter</h1>
                    <p className="text-gray-500 text-sm">{total} subscritores no total</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Importar</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light text-sm"
                    >
                        <Plus size={16} />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <NewsletterNav />

            {/* Mock Warning */}
            {isMock && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
                    <AlertCircle className="text-yellow-600 shrink-0" size={16} />
                    <span className="text-yellow-700">
                        Modo de demonstracao - dados simulados. Configure o Brevo para ver dados reais.
                    </span>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar por email ou nome..."
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
                        <option value="active">Ativos</option>
                        <option value="unsubscribed">Cancelados</option>
                        <option value="bounced">Bounce</option>
                        <option value="blocked">Bloqueados</option>
                    </select>
                    <select
                        value={listFilter}
                        onChange={handleListChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                    >
                        <option value="">Todas as listas</option>
                        {lists.map(list => (
                            <option key={list.id} value={list.name}>{list.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchSubscribers}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Atualizar"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500">Nenhum subscritor encontrado</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-brand text-sm hover:underline mt-2"
                        >
                            Adicionar subscritor
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Nome</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Listas</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Aberturas</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acoes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {subscribers.map(subscriber => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                                                    <Mail className="text-brand" size={14} />
                                                </div>
                                                <span className="text-sm font-medium truncate">{subscriber.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                                            {subscriber.name || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(subscriber.status)}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {subscriber.lists?.map(list => (
                                                    <span
                                                        key={list}
                                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                    >
                                                        {list}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                                            {subscriber.opens || 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedSubscriber(subscriber)}
                                                    className="p-1.5 text-gray-400 hover:text-brand rounded"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(subscriber.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Subscriber Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold">Adicionar Subscritor</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubscriber} className="p-4 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
                                    {formError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newSubscriber.email}
                                    onChange={(e) => setNewSubscriber(s => ({ ...s, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                                    placeholder="email@exemplo.pt"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={newSubscriber.name}
                                    onChange={(e) => setNewSubscriber(s => ({ ...s, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                                    placeholder="Nome completo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Listas
                                </label>
                                <div className="space-y-2">
                                    {lists.map(list => (
                                        <label key={list.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newSubscriber.lists.includes(list.name)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewSubscriber(s => ({
                                                            ...s,
                                                            lists: [...s.lists, list.name]
                                                        }));
                                                    } else {
                                                        setNewSubscriber(s => ({
                                                            ...s,
                                                            lists: s.lists.filter(l => l !== list.name)
                                                        }));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-brand focus:ring-brand"
                                            />
                                            <span className="text-sm">{list.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="flex-1 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light disabled:opacity-50"
                                >
                                    {formLoading ? 'A adicionar...' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold">Importar Subscritores</h2>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-gray-600">
                                Carregue um ficheiro CSV com as colunas: <code className="bg-gray-100 px-1 rounded">email, nome</code>
                            </p>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                                <p className="text-sm text-gray-500 mb-3">
                                    Arraste um ficheiro CSV ou clique para selecionar
                                </p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleImportFile}
                                    className="hidden"
                                    id="import-file"
                                />
                                <label
                                    htmlFor="import-file"
                                    className="inline-block px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light cursor-pointer"
                                >
                                    Selecionar Ficheiro
                                </label>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribers;
