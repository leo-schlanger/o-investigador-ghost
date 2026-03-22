import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { getTagSuggestions, getOrCreateTag } from '../../services/media';

const MediaTagInput = ({ selectedTags = [], onChange, placeholder = 'Adicionar tag...' }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Fetch suggestions when input changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const tags = await getTagSuggestions(inputValue);
                // Filter out already selected tags
                const filtered = tags.filter(
                    t => !selectedTags.some(st => st.id === t.id)
                );
                setSuggestions(filtered);
            } catch (err) {
                console.error('Error fetching tag suggestions:', err);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        if (showSuggestions) {
            const debounce = setTimeout(fetchSuggestions, 150);
            return () => clearTimeout(debounce);
        }
    }, [inputValue, showSuggestions, selectedTags]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddTag = async (tag) => {
        if (!selectedTags.some(t => t.id === tag.id)) {
            onChange([...selectedTags, tag]);
        }
        setInputValue('');
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    };

    const handleCreateTag = async () => {
        if (!inputValue.trim()) return;

        try {
            const { tag } = await getOrCreateTag(inputValue.trim());
            handleAddTag(tag);
        } catch (err) {
            console.error('Error creating tag:', err);
        }
    };

    const handleRemoveTag = (tagId) => {
        onChange(selectedTags.filter(t => t.id !== tagId));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                handleAddTag(suggestions[highlightedIndex]);
            } else if (inputValue.trim()) {
                handleCreateTag();
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setHighlightedIndex(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
            handleRemoveTag(selectedTags[selectedTags.length - 1].id);
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Selected tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedTags.map((tag) => (
                    <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                        {tag.name}
                        <button
                            onClick={() => handleRemoveTag(tag.id)}
                            className="hover:text-blue-900"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setHighlightedIndex(-1);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Suggestions dropdown */}
                {showSuggestions && (suggestions.length > 0 || inputValue.trim()) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-48 overflow-y-auto">
                        {loading && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                A carregar...
                            </div>
                        )}

                        {!loading && suggestions.map((tag, index) => (
                            <button
                                key={tag.id}
                                onClick={() => handleAddTag(tag)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                                    highlightedIndex === index ? 'bg-gray-100' : ''
                                }`}
                            >
                                <span>{tag.name}</span>
                                {tag.usageCount !== undefined && (
                                    <span className="text-xs text-gray-400">
                                        {tag.usageCount} usos
                                    </span>
                                )}
                            </button>
                        ))}

                        {/* Create new tag option */}
                        {!loading && inputValue.trim() && !suggestions.some(
                            t => t.name.toLowerCase() === inputValue.trim().toLowerCase()
                        ) && (
                            <button
                                onClick={handleCreateTag}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-600 border-t ${
                                    highlightedIndex === -1 && suggestions.length === 0 ? 'bg-blue-50' : ''
                                }`}
                            >
                                <Plus size={14} />
                                Criar "{inputValue.trim()}"
                            </button>
                        )}

                        {!loading && suggestions.length === 0 && !inputValue.trim() && (
                            <div className="px-3 py-2 text-sm text-gray-500">
                                Comece a digitar para ver sugestoes
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaTagInput;
