import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, updateSettings } from '../../services/settings';
import { Megaphone, ArrowRight } from 'lucide-react';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        siteTitle: '',
        siteDescription: '',
        adsEnabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getSettings();
            setSettings({
                siteTitle: data.siteTitle || 'O Investigador',
                siteDescription: data.siteDescription || 'Investigative Journalism Portal',
                adsEnabled: data.adsEnabled === 'true'
            });
        } catch (err) {
            setError('Failed to load settings');
            console.error('Error loading settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            await updateSettings({
                siteTitle: settings.siteTitle,
                siteDescription: settings.siteDescription,
                adsEnabled: String(settings.adsEnabled)
            });
            setSuccess(true);
        } catch (err) {
            setError('Failed to save settings');
            console.error('Error saving settings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                    Settings saved successfully!
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium mb-4">General Settings</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700">
                                Site Title
                            </label>
                            <input
                                type="text"
                                id="siteTitle"
                                name="siteTitle"
                                value={settings.siteTitle}
                                onChange={handleChange}
                                disabled={saving}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                                Site Description
                            </label>
                            <textarea
                                id="siteDescription"
                                name="siteDescription"
                                rows={3}
                                value={settings.siteDescription}
                                onChange={handleChange}
                                disabled={saving}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Advertisements Section */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 text-brand rounded-lg">
                            <Megaphone size={20} />
                        </div>
                        <h2 className="text-lg font-medium">Anúncios</h2>
                    </div>
                    <Link
                        to="/advertisements"
                        className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-light"
                    >
                        Configurações avançadas
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <h3 className="font-medium text-gray-900">Anúncios Ativos</h3>
                        <p className="text-sm text-gray-500">Ativar ou desativar todos os anúncios do site</p>
                    </div>
                    <button
                        onClick={() => {
                            setSettings(prev => ({ ...prev, adsEnabled: !prev.adsEnabled }));
                            setSuccess(false);
                        }}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.adsEnabled ? 'bg-green-500' : 'bg-gray-300'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.adsEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                    Para configurar posições individuais de anúncios e IDs do Google AdSense, acesse as{' '}
                    <Link to="/advertisements" className="text-brand hover:underline">
                        configurações avançadas de anúncios
                    </Link>.
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
