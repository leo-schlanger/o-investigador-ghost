import React, { useState, useEffect } from 'react';
import { Search, X, Tag } from 'lucide-react';
import { getTags } from '../../services/media';

const MediaFilters = ({
    searchTerm,
    onSearchChange,
    selectedTagIds = [],
    onTagFilterChange
}) => {
    const [allTags, setAllTags] = useState([]);
    const [showTagFilter, setShowTagFilter] = useState(false);

    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await getTags();
                setAllTags(tags);
            } catch (err) {
                console.error('Error loading tags:', err);
            }
        };
        loadTags();
    }, []);

    const handleTagToggle = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            onTagFilterChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onTagFilterChange([...selectedTagIds, tagId]);
        }
    };

    const clearFilters = () => {
        onSearchChange('');
        onTagFilterChange([]);
    };

    const hasFilters = searchTerm || selectedTagIds.length > 0;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Pesquisar por nome de ficheiro..."
                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Tag filter button */}
                <div className="relative">
                    <button
                        onClick={() => setShowTagFilter(!showTagFilter)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${
                            selectedTagIds.length > 0
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <Tag size={14} />
                        Tags
                        {selectedTagIds.length > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {selectedTagIds.length}
                            </span>
                        )}
                    </button>

                    {/* Tag filter dropdown */}
                    {showTagFilter && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowTagFilter(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-2 z-20 min-w-[200px] max-h-64 overflow-y-auto">
                                {allTags.length === 0 ? (
                                    <p className="px-3 py-2 text-sm text-gray-500">
                                        Nenhuma tag disponivel
                                    </p>
                                ) : (
                                    <>
                                        {allTags.map((tag) => (
                                            <label
                                                key={tag.id}
                                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTagIds.includes(tag.id)}
                                                    onChange={() => handleTagToggle(tag.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm flex-1">{tag.name}</span>
                                                {tag.usageCount !== undefined && (
                                                    <span className="text-xs text-gray-400">
                                                        {tag.usageCount}
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                        {selectedTagIds.length > 0 && (
                                            <div className="border-t mt-2 pt-2 px-3">
                                                <button
                                                    onClick={() => {
                                                        onTagFilterChange([]);
                                                        setShowTagFilter(false);
                                                    }}
                                                    className="text-sm text-red-600 hover:underline"
                                                >
                                                    Limpar selecao
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Clear all filters */}
                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Active filter tags */}
            {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-gray-500 mr-1">Filtrar por:</span>
                    {selectedTagIds.map((tagId) => {
                        const tag = allTags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                            <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                                {tag.name}
                                <button
                                    onClick={() => handleTagToggle(tag.id)}
                                    className="hover:text-blue-900"
                                >
                                    <X size={10} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MediaFilters;
