import React, { useState, useEffect } from 'react';
import { History, RotateCcw, X, Eye, ChevronRight } from 'lucide-react';
import api from '../services/api';

const RevisionHistory = ({ articleId, onRestore, onClose }) => {
    const [revisions, setRevisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRevision, setSelectedRevision] = useState(null);
    const [previewRevision, setPreviewRevision] = useState(null);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRevisions();
    }, [articleId]);

    const fetchRevisions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/articles/${articleId}/revisions`);
            setRevisions(response.data);
        } catch (err) {
            console.error('Error fetching revisions:', err);
            setError('Erro ao carregar historico');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (revisionId) => {
        try {
            const response = await api.get(`/api/articles/${articleId}/revisions/${revisionId}`);
            setPreviewRevision(response.data);
            setSelectedRevision(revisionId);
        } catch (err) {
            console.error('Error fetching revision:', err);
            setError('Erro ao carregar revisao');
        }
    };

    const handleRestore = async () => {
        if (!selectedRevision) return;

        try {
            setRestoring(true);
            await api.post(`/api/articles/${articleId}/revisions/${selectedRevision}/restore`);
            if (onRestore) {
                onRestore();
            }
        } catch (err) {
            console.error('Error restoring revision:', err);
            setError('Erro ao restaurar revisao');
        } finally {
            setRestoring(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusLabel = (status) => {
        const labels = {
            draft: 'Rascunho',
            published: 'Publicado',
            scheduled: 'Agendado'
        };
        return labels[status] || status;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2">
                        <History size={18} className="text-brand sm:w-5 sm:h-5" />
                        <h2 className="text-base sm:text-lg font-bold">Historico de Edicoes</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Content - stack on mobile, side by side on desktop */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Revisions List */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto max-h-[30vh] md:max-h-none">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Carregando...
                            </div>
                        ) : revisions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <History size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Nenhuma revisao encontrada</p>
                                <p className="text-xs mt-1">Revisoes sao criadas automaticamente ao editar o artigo</p>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {revisions.map((revision) => (
                                    <li key={revision.id}>
                                        <button
                                            onClick={() => handlePreview(revision.id)}
                                            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                                selectedRevision === revision.id ? 'bg-brand/10 border-l-2 border-brand' : ''
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    Revisao #{revision.revisionNumber}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(revision.createdAt)}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    por {revision.userName}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-400 shrink-0" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Preview Panel */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {previewRevision ? (
                            <div>
                                {/* Revision Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">
                                            Revisao #{previewRevision.revisionNumber}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            previewRevision.status === 'published' ? 'bg-green-100 text-green-700' :
                                            previewRevision.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {getStatusLabel(previewRevision.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Editado por <strong>{previewRevision.userName}</strong> em {formatDate(previewRevision.createdAt)}
                                    </p>
                                </div>

                                {/* Title Preview */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wide">Titulo</label>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {previewRevision.title || 'Sem titulo'}
                                    </h2>
                                </div>

                                {/* Featured Image Preview */}
                                {previewRevision.featureImage && (
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Imagem Destacada</label>
                                        <img
                                            src={previewRevision.featureImage}
                                            alt="Featured"
                                            className="mt-1 max-h-32 rounded-lg object-cover"
                                        />
                                    </div>
                                )}

                                {/* Excerpt Preview */}
                                {previewRevision.excerpt && (
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-500 uppercase tracking-wide">Resumo</label>
                                        <p className="text-sm text-gray-700 italic">
                                            {previewRevision.excerpt}
                                        </p>
                                    </div>
                                )}

                                {/* Content Preview */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-500 uppercase tracking-wide">Conteudo</label>
                                    <div
                                        className="mt-1 prose prose-sm max-w-none bg-white border rounded-lg p-4 max-h-64 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: previewRevision.content || '<p>Sem conteudo</p>' }}
                                    />
                                </div>

                                {/* Restore Button */}
                                <div className="flex justify-end pt-4 border-t">
                                    <button
                                        onClick={handleRestore}
                                        disabled={restoring}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-light disabled:opacity-50 transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                        {restoring ? 'Restaurando...' : 'Restaurar esta versao'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Eye size={48} className="mx-auto mb-2 opacity-50" />
                                    <p>Selecione uma revisao para visualizar</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevisionHistory;
