import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPage, getPage, updatePage } from '../../services/pages';
import { convertToHtml, htmlToEditorJs, generateSlug } from '../../utils/editorJsToHtml';
import MediaLibrary from '../Media/MediaLibrary';
import {
    Image as ImageIcon,
    X,
    ChevronDown,
    ChevronUp,
    Save,
    Send,
    RefreshCw
} from 'lucide-react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import api from '../../services/api';

const PageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const editorRef = useRef(null);
    const editorInstanceRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        feature_image: '',
        status: 'draft',
        meta_title: '',
        meta_description: ''
    });

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [showSeoPanel, setShowSeoPanel] = useState(false);
    const [editorData, setEditorData] = useState(null);
    const [editorReady, setEditorReady] = useState(false);

    // Initialize Editor.js
    useEffect(() => {
        if (!editorRef.current || editorInstanceRef.current) return;

        const initEditor = async () => {
            const editor = new EditorJS({
                holder: editorRef.current,
                placeholder: 'Escreva o conteudo da pagina...',
                autofocus: false,
                data: editorData || undefined,
                tools: {
                    header: {
                        class: Header,
                        config: {
                            placeholder: 'Titulo da secao',
                            levels: [2, 3, 4],
                            defaultLevel: 2,
                        },
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    image: {
                        class: ImageTool,
                        config: {
                            uploader: {
                                uploadByFile: async (file) => {
                                    try {
                                        const formData = new FormData();
                                        formData.append('file', file);
                                        const response = await api.post('/api/media', formData, {
                                            headers: { 'Content-Type': 'multipart/form-data' },
                                        });
                                        return { success: 1, file: { url: response.data.url } };
                                    } catch {
                                        return { success: 0 };
                                    }
                                },
                                uploadByUrl: async (url) => ({ success: 1, file: { url } }),
                            },
                        },
                    },
                    embed: {
                        class: Embed,
                        config: {
                            services: {
                                youtube: true,
                                twitter: true,
                                instagram: true,
                                vimeo: true,
                            },
                        },
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                    },
                    code: Code,
                    table: {
                        class: Table,
                        inlineToolbar: true,
                    },
                    delimiter: Delimiter,
                },
                onReady: () => {
                    setEditorReady(true);
                },
            });

            editorInstanceRef.current = editor;
        };

        initEditor();

        return () => {
            if (editorInstanceRef.current && editorInstanceRef.current.destroy) {
                editorInstanceRef.current.destroy();
                editorInstanceRef.current = null;
            }
        };
    }, []);

    // Load page if editing
    useEffect(() => {
        if (isEditing) fetchPage();
    }, [id]);

    // Load content into editor when data is ready
    useEffect(() => {
        if (editorReady && editorData && editorInstanceRef.current) {
            editorInstanceRef.current.render(editorData);
        }
    }, [editorReady, editorData]);

    const fetchPage = async () => {
        try {
            const data = await getPage(id);
            setFormData({
                title: data.title || '',
                slug: data.slug || '',
                excerpt: data.excerpt || '',
                feature_image: data.feature_image || '',
                status: data.status || 'draft',
                meta_title: data.meta_title || '',
                meta_description: data.meta_description || ''
            });

            if (data.html) {
                const blocks = htmlToEditorJs(data.html);
                setEditorData(blocks);
            }
        } catch {
            setError('Falha ao carregar pagina');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug || generateSlug(title)
        }));
    };

    const generateNewSlug = () => {
        setFormData(prev => ({
            ...prev,
            slug: generateSlug(prev.title)
        }));
    };

    const handleMediaSelect = (item) => {
        setFormData(prev => ({ ...prev, feature_image: item.url }));
        setShowMediaPicker(false);
    };

    const handleSubmit = async (targetStatus) => {
        setSaving(true);
        setError('');

        try {
            let html = '';
            if (editorInstanceRef.current) {
                const outputData = await editorInstanceRef.current.save();
                html = convertToHtml(outputData);
            }

            const payload = {
                title: formData.title,
                slug: formData.slug,
                html,
                custom_excerpt: formData.excerpt,
                feature_image: formData.feature_image || null,
                status: targetStatus || formData.status,
                meta_title: formData.meta_title || null,
                meta_description: formData.meta_description || null
            };

            if (isEditing) {
                await updatePage(id, payload);
            } else {
                await createPage(payload);
            }

            navigate('/pages');
        } catch (err) {
            console.error('Save error:', err);
            setError('Falha ao salvar pagina');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
            </div>
        );
    }

    return (
        <div className="flex gap-6 max-w-7xl mx-auto">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X size={16} /></button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    {/* Title */}
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="Titulo da pagina"
                        className="w-full text-3xl font-bold border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0 py-2 placeholder-gray-400"
                    />

                    {/* Slug */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">URL:</span>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="flex-1 border-0 border-b border-gray-200 focus:border-brand focus:ring-0 px-0 py-1 text-gray-700"
                        />
                        <button
                            type="button"
                            onClick={generateNewSlug}
                            className="p-1 text-gray-500 hover:text-brand"
                            title="Regenerar slug"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    {/* Featured Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Imagem Destacada</label>
                        {formData.feature_image ? (
                            <div className="relative inline-block">
                                <img
                                    src={formData.feature_image}
                                    alt="Featured"
                                    className="max-h-48 rounded-lg border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, feature_image: '' }))}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowMediaPicker(true)}
                                className="flex items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand hover:text-brand transition-colors w-full justify-center"
                            >
                                <ImageIcon size={20} />
                                <span>Adicionar imagem destacada</span>
                            </button>
                        )}
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Breve descricao da pagina"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand text-sm"
                        />
                    </div>

                    {/* Editor.js Container */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conteudo</label>
                        <div
                            ref={editorRef}
                            className="prose max-w-none border border-gray-200 rounded-lg p-4 min-h-[400px] focus-within:border-brand"
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-4">
                {/* Status Card */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Publicacao</h3>

                    <div className="mb-4">
                        <label className="block text-sm text-gray-600 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                        >
                            <option value="draft">Rascunho</option>
                            <option value="published">Publicada</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2 border-t">
                        <button
                            type="button"
                            onClick={() => handleSubmit('draft')}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Save size={16} />
                            Salvar Rascunho
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('published')}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light disabled:opacity-50"
                        >
                            <Send size={16} />
                            Publicar
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/pages')}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* SEO Card */}
                <div className="bg-white rounded-lg shadow">
                    <button
                        type="button"
                        onClick={() => setShowSeoPanel(!showSeoPanel)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                        <h3 className="font-medium text-gray-900">SEO</h3>
                        {showSeoPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {showSeoPanel && (
                        <div className="px-4 pb-4 space-y-4 border-t">
                            <div className="pt-4">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Meta Titulo
                                    <span className={`ml-2 ${formData.meta_title.length > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.meta_title.length}/60
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={formData.meta_title}
                                    onChange={handleChange}
                                    placeholder={formData.title || 'Titulo para buscadores'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Meta Descricao
                                    <span className={`ml-2 ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formData.meta_description.length}/160
                                    </span>
                                </label>
                                <textarea
                                    name="meta_description"
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Descricao para buscadores..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand text-sm"
                                />
                            </div>

                            {/* SEO Preview */}
                            <div className="bg-gray-50 rounded p-3">
                                <p className="text-sm font-medium text-blue-600 truncate">
                                    {formData.meta_title || formData.title || 'Titulo da pagina'}
                                </p>
                                <p className="text-xs text-green-700 truncate">
                                    seusite.com/{formData.slug || 'url-da-pagina'}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {formData.meta_description || formData.excerpt || 'Descricao da pagina...'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowMediaPicker(false)}
                >
                    <div
                        className="bg-gray-100 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Selecionar da Biblioteca de Midias</h2>
                            <button
                                onClick={() => setShowMediaPicker(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
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

export default PageEditor;
