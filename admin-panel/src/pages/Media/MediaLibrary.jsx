import React, { useState, useEffect, useCallback } from 'react';
import {
    uploadMedia,
    getMedia,
    deleteMedia,
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    bulkMoveMedia
} from '../../services/media';
import {
    Upload,
    Trash2,
    Copy,
    Check,
    Image as ImageIcon,
    FolderOpen,
    ChevronLeft,
    ChevronRight,
    Square,
    CheckSquare,
    Move
} from 'lucide-react';
import FolderTree from '../../components/Media/FolderTree';
import MediaFilters from '../../components/Media/MediaFilters';
import MediaDetailsSidebar from '../../components/Media/MediaDetailsSidebar';

const MediaLibrary = ({ onSelect = null }) => {
    // State
    const [media, setMedia] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    // Filters
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState([]);

    // Selection
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isMultiSelect, setIsMultiSelect] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // UI
    const [showSidebar, setShowSidebar] = useState(true);
    const [showDetails, setShowDetails] = useState(false);

    // Load folders
    const loadFolders = useCallback(async () => {
        try {
            const data = await getFolders('tree');
            setFolders(data);
        } catch (err) {
            console.error('Error loading folders:', err);
        }
    }, []);

    // Load media with filters
    const loadMedia = useCallback(async () => {
        try {
            setLoading(true);

            const params = {
                page,
                limit: 50,
                search: searchTerm,
                tags: selectedTagIds
            };

            // Handle folder filter
            if (selectedFolderId === 'root') {
                params.folderId = null; // Root level (no folder)
            } else if (selectedFolderId) {
                params.folderId = selectedFolderId;
            }
            // If selectedFolderId is null, don't filter by folder (show all)

            const data = await getMedia(params);
            setMedia(data.items || data);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || (data.items ? data.items.length : data.length));
        } catch (err) {
            setError('Falha ao carregar midias');
        } finally {
            setLoading(false);
        }
    }, [selectedFolderId, searchTerm, selectedTagIds, page]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders]);

    useEffect(() => {
        loadMedia();
    }, [loadMedia]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedFolderId, searchTerm, selectedTagIds]);

    const handleUpload = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError('');
        try {
            const folderId = selectedFolderId === 'root' ? null : selectedFolderId;
            for (const file of Array.from(files)) {
                await uploadMedia(file, folderId);
            }
            await loadMedia();
            await loadFolders();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteMedia(id);
            setMedia(prev => prev.filter(m => m.id !== id));
            setSelectedMedia(null);
            setShowDetails(false);
            await loadFolders();
        } catch (err) {
            alert('Erro ao eliminar midia');
        }
    };

    const handleCopyUrl = (item, e) => {
        e?.stopPropagation();
        navigator.clipboard.writeText(item.url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleMediaClick = (item, e) => {
        if (onSelect) {
            onSelect(item);
            return;
        }

        if (isMultiSelect) {
            toggleSelection(item.id);
            return;
        }

        if (e?.ctrlKey || e?.metaKey) {
            toggleSelection(item.id);
            return;
        }

        setSelectedMedia(item);
        setShowDetails(true);
        setSelectedIds([]);
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === media.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(media.map(m => m.id));
        }
    };

    const handleBulkMove = async (folderId) => {
        if (selectedIds.length === 0) return;
        try {
            await bulkMoveMedia(selectedIds, folderId);
            setSelectedIds([]);
            await loadMedia();
            await loadFolders();
        } catch (err) {
            alert('Erro ao mover ficheiros');
        }
    };

    const handleCreateFolder = async (name, parentId) => {
        try {
            await createFolder(name, parentId);
            await loadFolders();
        } catch (err) {
            alert('Erro ao criar pasta');
        }
    };

    const handleRenameFolder = async (id, name) => {
        try {
            await updateFolder(id, { name });
            await loadFolders();
        } catch (err) {
            alert('Erro ao renomear pasta');
        }
    };

    const handleDeleteFolder = async (id) => {
        try {
            await deleteFolder(id);
            if (selectedFolderId === id) {
                setSelectedFolderId(null);
            }
            await loadFolders();
            await loadMedia();
        } catch (err) {
            alert('Erro ao eliminar pasta');
        }
    };

    const handleMediaUpdate = (updatedMedia) => {
        setMedia(prev => prev.map(m => m.id === updatedMedia.id ? updatedMedia : m));
        setSelectedMedia(updatedMedia);
    };

    const isImage = (mimetype) => mimetype?.startsWith('image/');

    // Compact mode when used as picker
    const isPickerMode = !!onSelect;

    return (
        <div className={`flex h-full ${isPickerMode ? '' : 'min-h-[calc(100vh-64px)]'}`}>
            {/* Folder sidebar */}
            {!isPickerMode && showSidebar && (
                <div className="w-60 flex-shrink-0 bg-gray-50 border-r overflow-hidden">
                    <FolderTree
                        folders={folders}
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={setSelectedFolderId}
                        onCreateFolder={handleCreateFolder}
                        onRenameFolder={handleRenameFolder}
                        onDeleteFolder={handleDeleteFolder}
                    />
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {!isPickerMode && (
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="p-1.5 hover:bg-gray-100 rounded"
                                    title={showSidebar ? 'Ocultar pastas' : 'Mostrar pastas'}
                                >
                                    {showSidebar ? <ChevronLeft size={18} /> : <FolderOpen size={18} />}
                                </button>
                            )}
                            <h1 className={`font-bold ${isPickerMode ? 'text-lg' : 'text-xl'}`}>
                                Biblioteca de Midias
                            </h1>
                            {total > 0 && (
                                <span className="text-sm text-gray-500">
                                    {total} {total === 1 ? 'ficheiro' : 'ficheiros'}
                                </span>
                            )}
                        </div>

                        {/* Multi-select actions */}
                        {selectedIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
                                </span>
                                <div className="relative group">
                                    <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                                        <Move size={14} />
                                        Mover para...
                                    </button>
                                    <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg py-1 z-10 min-w-[160px] hidden group-hover:block">
                                        <button
                                            onClick={() => handleBulkMove(null)}
                                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                                        >
                                            Sem pasta
                                        </button>
                                        {folders.map(folder => (
                                            <button
                                                key={folder.id}
                                                onClick={() => handleBulkMove(folder.id)}
                                                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                                            >
                                                {folder.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <MediaFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                selectedTagIds={selectedTagIds}
                                onTagFilterChange={setSelectedTagIds}
                            />
                        </div>

                        {!isPickerMode && media.length > 0 && (
                            <button
                                onClick={() => setIsMultiSelect(!isMultiSelect)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm border rounded ${
                                    isMultiSelect ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
                                }`}
                            >
                                {isMultiSelect ? <CheckSquare size={14} /> : <Square size={14} />}
                                Selecionar
                            </button>
                        )}
                    </div>

                    {isMultiSelect && media.length > 0 && (
                        <div className="mt-2">
                            <button
                                onClick={handleSelectAll}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {selectedIds.length === media.length ? 'Desselecionar todos' : 'Selecionar todos'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Upload zone */}
                <div className="px-4 pt-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                        }`}
                    >
                        <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                        <p className="text-gray-600 font-medium text-sm">
                            Arraste arquivos aqui ou clique para selecionar
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Imagens (JPG, PNG, GIF, WebP) ate 10MB
                        </p>
                        <label className="mt-3 inline-block cursor-pointer bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
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
                </div>

                {error && <p className="text-red-500 px-4 pt-2 text-sm">{error}</p>}

                {/* Media grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">A carregar midias...</div>
                    ) : media.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-white rounded-lg">
                            <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                            <p>Nenhuma midia encontrada.</p>
                            {(searchTerm || selectedTagIds.length > 0 || selectedFolderId) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedTagIds([]);
                                        setSelectedFolderId(null);
                                    }}
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {media.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={(e) => handleMediaClick(item, e)}
                                        className={`group relative bg-white rounded-lg overflow-hidden shadow-sm border transition-all cursor-pointer ${
                                            selectedIds.includes(item.id)
                                                ? 'ring-2 ring-blue-500 border-blue-500'
                                                : selectedMedia?.id === item.id
                                                ? 'ring-2 ring-blue-400'
                                                : 'border-gray-100 hover:shadow-md'
                                        }`}
                                    >
                                        {/* Selection checkbox */}
                                        {isMultiSelect && (
                                            <div className="absolute top-2 left-2 z-10">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                    selectedIds.includes(item.id)
                                                        ? 'bg-blue-500 border-blue-500'
                                                        : 'bg-white border-gray-300'
                                                }`}>
                                                    {selectedIds.includes(item.id) && (
                                                        <Check size={12} className="text-white" />
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Thumbnail */}
                                        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                                            {isImage(item.mimetype) ? (
                                                <img
                                                    src={item.url}
                                                    alt={item.originalName}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="text-xs text-gray-400 text-center p-2">
                                                    <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                                                    {item.filename?.split('.').pop()?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => handleCopyUrl(item, e)}
                                                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600"
                                                title="Copiar URL"
                                            >
                                                {copiedId === item.id ? (
                                                    <Check size={16} className="text-green-500" />
                                                ) : (
                                                    <Copy size={16} />
                                                )}
                                            </button>
                                            {!isPickerMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm('Eliminar este ficheiro?')) {
                                                            handleDelete(item.id);
                                                        }
                                                    }}
                                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Tags indicator */}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="absolute bottom-8 left-1 right-1 flex gap-0.5 flex-wrap justify-center">
                                                {item.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-1 py-0.5 bg-blue-500/80 text-white text-[10px] rounded"
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {item.tags.length > 3 && (
                                                    <span className="px-1 py-0.5 bg-gray-500/80 text-white text-[10px] rounded">
                                                        +{item.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* File name */}
                                        <p className="text-xs text-gray-500 truncate px-2 py-1.5 border-t bg-white">
                                            {item.originalName || item.filename}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Pagina {page} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Details sidebar */}
            {!isPickerMode && showDetails && selectedMedia && (
                <div className="w-72 flex-shrink-0">
                    <MediaDetailsSidebar
                        media={selectedMedia}
                        onClose={() => {
                            setShowDetails(false);
                            setSelectedMedia(null);
                        }}
                        onUpdate={handleMediaUpdate}
                        onDelete={(id) => {
                            handleDelete(id);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
