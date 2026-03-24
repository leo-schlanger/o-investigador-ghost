import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../services/settings';
import { Eye, EyeOff, Monitor, Sidebar, LayoutTemplate } from 'lucide-react';

const AD_SLOTS = [
  {
    id: 'header_leaderboard',
    name: 'Header Leaderboard',
    description: 'Banner no topo da homepage (728x90)',
    type: 'leaderboard',
    position: 'Topo da Página',
    icon: LayoutTemplate
  },
  {
    id: 'middle_leaderboard',
    name: 'Middle Leaderboard',
    description: 'Banner entre seções Últimas e Economia (728x90)',
    type: 'leaderboard',
    position: 'Meio da Homepage',
    icon: Monitor
  },
  {
    id: 'sidebar_mpu_1',
    name: 'Sidebar MPU 1',
    description: 'Anúncio retangular no sidebar superior (300x250)',
    type: 'mpu',
    position: 'Sidebar - Superior',
    icon: Sidebar
  },
  {
    id: 'sidebar_mpu_2',
    name: 'Sidebar MPU 2',
    description: 'Anúncio retangular no sidebar inferior (300x250)',
    type: 'mpu',
    position: 'Sidebar - Inferior',
    icon: Sidebar
  }
];

const AdvertisementsPage = () => {
  const [settings, setSettings] = useState({
    adsEnabled: false,
    adsenseClientId: '',
    adSlots: {}
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

      // Parse adSlots from JSON string if it exists
      let adSlots = {};
      if (data.adSlots) {
        try {
          adSlots = JSON.parse(data.adSlots);
        } catch (e) {
          console.error('Error parsing adSlots:', e);
        }
      }

      // Initialize default values for each slot
      AD_SLOTS.forEach((slot) => {
        if (!adSlots[slot.id]) {
          adSlots[slot.id] = { enabled: true, slotId: '' };
        }
      });

      setSettings({
        adsEnabled: data.adsEnabled === 'true',
        adsenseClientId: data.adsenseClientId || '',
        adSlots
      });
    } catch (err) {
      setError('Falha ao carregar configurações de anúncios');
      console.error('Error loading ad settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalToggle = () => {
    setSettings((prev) => ({
      ...prev,
      adsEnabled: !prev.adsEnabled
    }));
    setSuccess(false);
  };

  const handleClientIdChange = (e) => {
    setSettings((prev) => ({
      ...prev,
      adsenseClientId: e.target.value
    }));
    setSuccess(false);
  };

  const handleSlotToggle = (slotId) => {
    setSettings((prev) => ({
      ...prev,
      adSlots: {
        ...prev.adSlots,
        [slotId]: {
          ...prev.adSlots[slotId],
          enabled: !prev.adSlots[slotId]?.enabled
        }
      }
    }));
    setSuccess(false);
  };

  const handleSlotIdChange = (slotId, value) => {
    setSettings((prev) => ({
      ...prev,
      adSlots: {
        ...prev.adSlots,
        [slotId]: {
          ...prev.adSlots[slotId],
          slotId: value
        }
      }
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await updateSettings({
        adsEnabled: String(settings.adsEnabled),
        adsenseClientId: settings.adsenseClientId,
        adSlots: JSON.stringify(settings.adSlots)
      });

      setSuccess(true);
    } catch (err) {
      setError('Falha ao salvar configurações');
      console.error('Error saving ad settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Anúncios</h1>
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
      <h1 className="text-2xl font-bold mb-6">Anúncios</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Configurações salvas com sucesso!
        </div>
      )}

      {/* Global Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Configurações Globais</h2>

        <div className="space-y-6">
          {/* Global Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Anúncios Ativos</h3>
              <p className="text-sm text-gray-500">Ativar ou desativar todos os anúncios do site</p>
            </div>
            <button
              onClick={handleGlobalToggle}
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

          {/* AdSense Client ID */}
          <div>
            <label htmlFor="adsenseClientId" className="block text-sm font-medium text-gray-700">
              Google AdSense Client ID
            </label>
            <input
              type="text"
              id="adsenseClientId"
              value={settings.adsenseClientId}
              onChange={handleClientIdChange}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              disabled={saving}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:bg-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Encontre seu Client ID no painel do Google AdSense
            </p>
          </div>
        </div>
      </div>

      {/* Ad Slots */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Posições de Anúncios</h2>
        <p className="text-sm text-gray-500 mb-6">
          Configure cada posição de anúncio individualmente. Desative slots específicos sem desligar
          todos os anúncios.
        </p>

        <div className="space-y-4">
          {AD_SLOTS.map((slot) => {
            const SlotIcon = slot.icon;
            const slotSettings = settings.adSlots[slot.id] || { enabled: true, slotId: '' };
            const isDisabled = !settings.adsEnabled;

            return (
              <div
                key={slot.id}
                className={`border rounded-lg p-4 transition-colors ${
                  isDisabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        slotSettings.enabled && !isDisabled
                          ? 'bg-brand/10 text-brand'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <SlotIcon size={20} />
                    </div>
                    <div>
                      <h3
                        className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        {slot.name}
                      </h3>
                      <p className={`text-sm ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                        {slot.description}
                      </p>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                          isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {slot.position}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSlotToggle(slot.id)}
                      disabled={saving || isDisabled}
                      className={`p-2 rounded-lg transition-colors ${
                        isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : slotSettings.enabled
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={slotSettings.enabled ? 'Desativar' : 'Ativar'}
                    >
                      {slotSettings.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                {/* Slot ID Input */}
                <div className="mt-3 pl-11">
                  <label
                    className={`block text-xs font-medium mb-1 ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    Ad Slot ID
                  </label>
                  <input
                    type="text"
                    value={slotSettings.slotId}
                    onChange={(e) => handleSlotIdChange(slot.id, e.target.value)}
                    placeholder="1234567890"
                    disabled={saving || isDisabled || !slotSettings.enabled}
                    className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Preview das Posições</h2>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Header Leaderboard Preview */}
            <div
              className={`h-[90px] rounded flex items-center justify-center text-xs uppercase tracking-wider ${
                settings.adsEnabled && settings.adSlots.header_leaderboard?.enabled
                  ? 'bg-green-100 text-green-600 border-2 border-green-300'
                  : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
              }`}
            >
              Header Leaderboard (728x90)
            </div>

            <div className="flex gap-4">
              {/* Main Content Area */}
              <div className="flex-1 space-y-4">
                <div className="h-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                  Conteúdo Principal
                </div>

                {/* Middle Leaderboard Preview */}
                <div
                  className={`h-[90px] rounded flex items-center justify-center text-xs uppercase tracking-wider ${
                    settings.adsEnabled && settings.adSlots.middle_leaderboard?.enabled
                      ? 'bg-green-100 text-green-600 border-2 border-green-300'
                      : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  Middle Leaderboard (728x90)
                </div>

                <div className="h-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                  Mais Conteúdo
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-[120px] space-y-4">
                {/* Sidebar MPU 1 Preview */}
                <div
                  className={`h-[100px] rounded flex items-center justify-center text-[10px] uppercase tracking-wider text-center px-1 ${
                    settings.adsEnabled && settings.adSlots.sidebar_mpu_1?.enabled
                      ? 'bg-green-100 text-green-600 border-2 border-green-300'
                      : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  Sidebar MPU 1
                </div>

                <div className="h-16 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">
                  Widget
                </div>

                {/* Sidebar MPU 2 Preview */}
                <div
                  className={`h-[100px] rounded flex items-center justify-center text-[10px] uppercase tracking-wider text-center px-1 ${
                    settings.adsEnabled && settings.adSlots.sidebar_mpu_2?.enabled
                      ? 'bg-green-100 text-green-600 border-2 border-green-300'
                      : 'bg-gray-200 text-gray-400 border-2 border-gray-300'
                  }`}
                >
                  Sidebar MPU 2
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Verde = Ativo | Cinza = Desativado
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-light focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
};

export default AdvertisementsPage;
