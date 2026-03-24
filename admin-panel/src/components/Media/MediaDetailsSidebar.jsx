import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Calendar,
  HardDrive
} from 'lucide-react';
import { updateMedia, getFolders } from '../../services/media';
import MediaTagInput from './MediaTagInput';

const MediaDetailsSidebar = ({ media, onClose, onUpdate, onDelete }) => {
  const [folders, setFolders] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load folders
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const data = await getFolders('flat');
        setFolders(data);
      } catch (err) {
        console.error('Error loading folders:', err);
      }
    };
    loadFolders();
  }, []);

  // Update local state when media changes
  useEffect(() => {
    if (media) {
      setSelectedTags(media.tags || []);
      setSelectedFolderId(media.folderId || null);
    }
  }, [media]);

  if (!media) return null;

  const handleCopy = (field, value) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTagsChange = async (newTags) => {
    setSelectedTags(newTags);
    setSaving(true);
    try {
      const updated = await updateMedia(media.id, {
        tagIds: newTags.map((t) => t.id)
      });
      onUpdate(updated);
    } catch (err) {
      console.error('Error updating tags:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFolderChange = async (folderId) => {
    setSelectedFolderId(folderId);
    setSaving(true);
    try {
      const updated = await updateMedia(media.id, {
        folderId: folderId || null
      });
      onUpdate(updated);
    } catch (err) {
      console.error('Error updating folder:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Desconhecido';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconhecido';
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = media.mimetype?.startsWith('image/');

  // Flatten folders for select dropdown
  const flattenFolders = (folderList, level = 0) => {
    const result = [];
    folderList.forEach((folder) => {
      result.push({ ...folder, level });
      if (folder.children && folder.children.length > 0) {
        result.push(...flattenFolders(folder.children, level + 1));
      }
    });
    return result;
  };

  const flatFolders =
    Array.isArray(folders) && folders[0]?.children !== undefined
      ? flattenFolders(folders)
      : folders;

  return (
    <div className="h-full flex flex-col bg-white border-l">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium text-sm text-gray-700">Detalhes</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Preview */}
        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
          {isImage ? (
            <img
              src={media.url}
              alt={media.originalName}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-2" />
              <p className="text-sm">{media.mimetype}</p>
            </div>
          )}
        </div>

        {/* File info */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Informacoes</h4>

          <div className="flex items-start gap-2">
            <ImageIcon size={14} className="text-gray-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Nome</p>
              <p className="text-sm truncate" title={media.originalName || media.filename}>
                {media.originalName || media.filename}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <HardDrive size={14} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Tamanho</p>
              <p className="text-sm">{formatFileSize(media.size)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar size={14} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Carregado em</p>
              <p className="text-sm">{formatDate(media.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* URL */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">URL</h4>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={media.url}
              readOnly
              className="flex-1 px-2 py-1.5 text-xs bg-gray-50 border rounded truncate"
            />
            <button
              onClick={() => handleCopy('url', media.url)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
              title="Copiar URL"
            >
              {copiedField === 'url' ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Folder */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
            <FolderOpen size={12} />
            Pasta
          </h4>
          <select
            value={selectedFolderId || ''}
            onChange={(e) => handleFolderChange(e.target.value || null)}
            disabled={saving}
            className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Sem pasta</option>
            {flatFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {'  '.repeat(folder.level || 0)}
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500 uppercase">Tags</h4>
          <MediaTagInput
            selectedTags={selectedTags}
            onChange={handleTagsChange}
            placeholder="Adicionar tag..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t space-y-2">
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Abrir em nova aba
        </a>
        <button
          onClick={() => {
            if (window.confirm('Eliminar este ficheiro?')) {
              onDelete(media.id);
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 text-sm border border-red-300 rounded hover:bg-red-50"
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-sm text-gray-500">A guardar...</div>
        </div>
      )}
    </div>
  );
};

export default MediaDetailsSidebar;
