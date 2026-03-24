import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

const FolderItem = ({
  folder,
  level = 0,
  selectedFolderId,
  onSelect,
  onRename,
  onDelete,
  onCreateSubfolder
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename(folder.id, newName.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setNewName(folder.name);
      setIsRenaming(false);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group relative ${
          isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {/* Expand/collapse button */}
        <button
          className="p-0.5 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </button>

        {/* Folder icon */}
        {isExpanded ? (
          <FolderOpen size={16} className="text-yellow-600 flex-shrink-0" />
        ) : (
          <Folder size={16} className="text-yellow-600 flex-shrink-0" />
        )}

        {/* Name or rename input */}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-1 py-0.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm truncate">{folder.name}</span>
        )}

        {/* Media count badge */}
        {folder.mediaCount > 0 && (
          <span className="text-xs text-gray-400 mr-1">{folder.mediaCount}</span>
        )}

        {/* Actions menu */}
        <div className="relative">
          <button
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg py-1 z-20 min-w-[140px]">
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateSubfolder(folder.id);
                    setShowMenu(false);
                  }}
                >
                  <Plus size={14} />
                  Nova subpasta
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                >
                  <Pencil size={14} />
                  Renomear
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(folder.id, folder.name);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentIdForNew, setParentIdForNew] = useState(null);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), parentIdForNew);
    }
    setNewFolderName('');
    setIsCreating(false);
    setParentIdForNew(null);
  };

  const handleCreateSubfolder = (parentId) => {
    setParentIdForNew(parentId);
    setNewFolderName('');
    setIsCreating(true);
  };

  const handleDelete = (folderId, folderName) => {
    if (
      window.confirm(
        `Eliminar a pasta "${folderName}"? Os ficheiros serao movidos para a pasta pai.`
      )
    ) {
      onDeleteFolder(folderId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm text-gray-700">Pastas</h3>
        <button
          onClick={() => {
            setParentIdForNew(null);
            setIsCreating(true);
          }}
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
          title="Nova pasta"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* All media (root) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer ${
            selectedFolderId === null ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <ImageIcon size={16} className="text-gray-500" />
          <span className="text-sm">Todas as Midias</span>
        </div>

        {/* Root level (no folder) */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer ${
            selectedFolderId === 'root' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelectFolder('root')}
        >
          <Folder size={16} className="text-gray-400" />
          <span className="text-sm text-gray-600">Sem pasta</span>
        </div>

        {/* Folder tree */}
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            selectedFolderId={selectedFolderId}
            onSelect={onSelectFolder}
            onRename={onRenameFolder}
            onDelete={handleDelete}
            onCreateSubfolder={handleCreateSubfolder}
          />
        ))}
      </div>

      {/* New folder input */}
      {isCreating && (
        <div className="p-3 border-t bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">
            {parentIdForNew ? 'Nova subpasta:' : 'Nova pasta:'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewFolderName('');
                }
              }}
              placeholder="Nome da pasta"
              className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Criar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderTree;
