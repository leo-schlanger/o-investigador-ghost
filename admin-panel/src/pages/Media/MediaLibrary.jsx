import React, { useState, useEffect, useCallback } from 'react';
import { uploadMedia, getMedia, deleteMedia } from '../../services/media';
import { Upload, Trash2, Copy, X, Check, Image as ImageIcon } from 'lucide-react';

const MediaLibrary = ({ onSelect = null }) => {
    // onSelect is optional — when provided, the library acts as a picker modal
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const loadMedia = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getMedia();
            setMedia(data);
        } catch (err) {
            setError('Falha ao carregar mídias');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadMedia(); }, [loadMedia]);

    const handleUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError('');
        try {
            for (const file of Array.from(files)) {
                await uploadMedia(file);
            }
            await loadMedia();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir esta mídia?')) return;
        try {
            await deleteMedia(id);
            setMedia(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert('Erro ao excluir mídia');
        }
    };

    const handleCopyUrl = (item) => {
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const isImage = (mimetype) => mimetype?.startsWith('image/');

    return (
        <div className={onSelect ? '' : 'max-w-6xl mx-auto'}>
            {!onSelect && <h1 className="text-2xl font-bold mb-6">Biblioteca de Mídias</h1>}

            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${dragOver ? 'border-brand bg-blue-50' : 'border-gray-300 bg-white'}`}
            >
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600 font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                <p className="text-sm text-gray-400 mt-1">Imagens (JPG, PNG, GIF, WebP) até 10MB</p>
                <label className="mt-4 inline-block cursor-pointer bg-brand text-white px-4 py-2 rounded hover:bg-brand-light">
                    {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        accept="image/*"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                </label>
            </div>

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            {/* Gallery */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">A carregar mídias...</div>
            ) : media.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-lg">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhuma mídia ainda. Faça o upload de imagens acima.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onSelect && onSelect(item)}
                            className={`group relative bg-white rounded-lg overflow-hidden shadow border border-gray-100 ${onSelect ? 'cursor-pointer hover:ring-2 hover:ring-brand' : ''}`}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                {isImage(item.mimetype) ? (
                                    <img
                                        src={item.url}
                                        alt={item.originalName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-xs text-gray-400 text-center p-2">
                                        <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                                        {item.filename?.split('.').pop()?.toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleCopyUrl(item); }}
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-brand"
                                    title="Copiar URL"
                                >
                                    {copiedId === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                                {!onSelect && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* File name */}
                            <p className="text-xs text-gray-500 truncate px-2 py-1 border-t">{item.originalName || item.filename}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
