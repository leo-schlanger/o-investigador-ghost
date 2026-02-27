import React, { useState, useEffect } from 'react';
import { getNavigation, updateNavigation } from '../../services/navigation';
import { Plus, Trash2, GripVertical, Save, Menu, Link as LinkIcon } from 'lucide-react';

const Navigation = () => {
    const [navigation, setNavigation] = useState([]);
    const [secondaryNavigation, setSecondaryNavigation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadNavigation();
    }, []);

    const loadNavigation = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getNavigation();
            setNavigation(data.navigation || []);
            setSecondaryNavigation(data.secondary_navigation || []);
        } catch (err) {
            setError('Falha ao carregar navegacao');
            console.error('Error loading navigation:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = (type) => {
        const newItem = { label: '', url: '/' };
        if (type === 'primary') {
            setNavigation([...navigation, newItem]);
        } else {
            setSecondaryNavigation([...secondaryNavigation, newItem]);
        }
        setSuccess(false);
    };

    const handleRemoveItem = (type, index) => {
        if (type === 'primary') {
            setNavigation(navigation.filter((_, i) => i !== index));
        } else {
            setSecondaryNavigation(secondaryNavigation.filter((_, i) => i !== index));
        }
        setSuccess(false);
    };

    const handleItemChange = (type, index, field, value) => {
        if (type === 'primary') {
            const updated = [...navigation];
            updated[index] = { ...updated[index], [field]: value };
            setNavigation(updated);
        } else {
            const updated = [...secondaryNavigation];
            updated[index] = { ...updated[index], [field]: value };
            setSecondaryNavigation(updated);
        }
        setSuccess(false);
    };

    const handleMoveItem = (type, index, direction) => {
        const items = type === 'primary' ? [...navigation] : [...secondaryNavigation];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= items.length) return;

        const item = items[index];
        items.splice(index, 1);
        items.splice(newIndex, 0, item);

        if (type === 'primary') {
            setNavigation(items);
        } else {
            setSecondaryNavigation(items);
        }
        setSuccess(false);
    };

    const handleSave = async () => {
        // Validate items
        for (const item of navigation) {
            if (!item.label.trim() || !item.url.trim()) {
                setError('Todos os itens do menu principal devem ter titulo e URL');
                return;
            }
        }
        for (const item of secondaryNavigation) {
            if (!item.label.trim() || !item.url.trim()) {
                setError('Todos os itens do menu secundario devem ter titulo e URL');
                return;
            }
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            await updateNavigation({
                navigation,
                secondary_navigation: secondaryNavigation
            });

            setSuccess(true);
        } catch (err) {
            setError('Falha ao salvar navegacao');
            console.error('Error saving navigation:', err);
        } finally {
            setSaving(false);
        }
    };

    const NavigationList = ({ items, type, title, description }) => (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-brand/10 text-brand rounded-lg">
                    <Menu size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-medium">{title}</h2>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                {items.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4 text-center border-2 border-dashed rounded-lg">
                        Nenhum item. Clique em "Adicionar Item" para comecar.
                    </p>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg group"
                        >
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleMoveItem(type, index, 'up')}
                                    disabled={index === 0}
                                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleMoveItem(type, index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            <GripVertical size={16} className="text-gray-300" />

                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => handleItemChange(type, index, 'label', e.target.value)}
                                    placeholder="Titulo"
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-brand focus:border-brand"
                                />
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={item.url}
                                            onChange={(e) => handleItemChange(type, index, 'url', e.target.value)}
                                            placeholder="/url"
                                            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-brand focus:border-brand"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveItem(type, index)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={() => handleAddItem(type)}
                className="mt-4 flex items-center gap-2 text-sm text-brand hover:text-brand-light"
            >
                <Plus size={16} />
                Adicionar Item
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Navegacao</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Navegacao</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                    Navegacao salva com sucesso!
                </div>
            )}

            <NavigationList
                items={navigation}
                type="primary"
                title="Menu Principal"
                description="Links exibidos no cabecalho do site"
            />

            <NavigationList
                items={secondaryNavigation}
                type="secondary"
                title="Menu Secundario (Rodape)"
                description="Links exibidos no rodape do site"
            />

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-md hover:bg-brand-light disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? 'Salvando...' : 'Salvar Navegacao'}
                </button>
            </div>
        </div>
    );
};

export default Navigation;
