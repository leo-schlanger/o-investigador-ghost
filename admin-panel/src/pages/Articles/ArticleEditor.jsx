import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createArticle, getArticle, updateArticle } from '../../services/articles';
import MediaLibrary from '../Media/MediaLibrary';
import { Image as ImageIcon, X } from 'lucide-react';

const ArticleEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        status: 'draft',
        feature_image: ''
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    useEffect(() => {
        if (isEditing) fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const data = await getArticle(id);
            setFormData({
                title: data.title,
                content: data.content || '',
                status: data.status,
                feature_image: data.feature_image || ''
            });
        } catch {
            setError('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMediaSelect = (item) => {
        setFormData(prev => ({ ...prev, feature_image: item.url }));
        setShowMediaPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (isEditing) {
                await updateArticle(id, formData);
            } else {
                await createArticle(formData);
            }
            navigate('/articles');
        } catch {
            setError('Failed to save article');
            setSaving(false);
        }
    };

    if (loading) return <div>Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Artigo' : 'Novo Artigo'}</h1>

            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Conteúdo (Markdown/HTML)</label>
                    <textarea
                        name="content"
                        rows={15}
                        value={formData.content}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand font-mono text-sm"
                    />
                </div>

                {/* Featured Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Destacada</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="feature_image"
                            value={formData.feature_image}
                            onChange={handleChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                            placeholder="Cole uma URL ou selecione da biblioteca..."
                        />
                        <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 text-gray-600"
                        >
                            <ImageIcon size={16} />
                            Biblioteca
                        </button>
                    </div>
                    {formData.feature_image && (
                        <div className="mt-2 relative inline-block">
                            <img
                                src={formData.feature_image}
                                alt="Feature"
                                className="h-32 rounded border object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, feature_image: '' }))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                    >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="scheduled">Agendado</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/articles')}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-brand text-white rounded hover:bg-brand-light disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Artigo'}
                    </button>
                </div>
            </form>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaPicker(false)}>
                    <div className="bg-gray-100 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Selecionar da Biblioteca de Mídias</h2>
                            <button onClick={() => setShowMediaPicker(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <MediaLibrary onSelect={handleMediaSelect} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArticleEditor;
