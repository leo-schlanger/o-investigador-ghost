import React, { useState, useEffect } from 'react';
import {
  Save,
  Key,
  Mail,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  getNewsletterSettings,
  updateNewsletterSettings,
  testBrevoConnection,
  getLists,
  createList,
  deleteList
} from '../../services/newsletter';
import { useNotification } from '../../context/NotificationContext';
import NewsletterNav from './NewsletterNav';

const NewsletterSettings = () => {
  const { showError, showInfo } = useNotification();
  const [settings, setSettings] = useState({
    apiKey: '',
    senderName: '',
    senderEmail: '',
    replyTo: '',
    defaultListId: null,
    doubleOptIn: true,
    welcomeEmail: true,
    unsubscribePage: ''
  });

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New list modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchSettings();
    fetchLists();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getNewsletterSettings();
      setSettings((prev) => ({
        ...prev,
        ...data,
        apiKey: data.apiKey || ''
      }));
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLists = async () => {
    try {
      const response = await getLists();
      setLists(response.data || []);
    } catch (err) {
      console.error('Error fetching lists:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateNewsletterSettings(settings);
      setSuccess('Configuracoes guardadas com sucesso!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erro ao guardar configuracoes');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey) {
      setError('Insira a chave API antes de testar');
      return;
    }

    setTesting(true);
    setConnectionStatus(null);

    try {
      const result = await testBrevoConnection(settings.apiKey);
      setConnectionStatus(result.success ? 'success' : 'error');
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('Erro ao testar conexao');
    } finally {
      setTesting(false);
    }
  };

  const handleCreateList = async () => {
    if (!newList.name) {
      showError('O nome da lista e obrigatorio');
      return;
    }

    try {
      const result = await createList(newList);
      if (result.isMock) {
        showInfo('Modo de demonstracao: lista simulada.');
      }
      setShowNewListModal(false);
      setNewList({ name: '', description: '' });
      fetchLists();
    } catch (err) {
      console.error('Error creating list:', err);
      showError('Erro ao criar lista');
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Tem certeza que deseja eliminar esta lista?')) return;

    try {
      await deleteList(id);
      fetchLists();
    } catch (err) {
      console.error('Error deleting list:', err);
      showError('Erro ao eliminar lista');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Newsletter</h1>
          <p className="text-gray-500 text-sm">Configuracoes e integracoes</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <NewsletterNav />

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-green-700">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brevo Integration */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center gap-2">
              <Key className="text-brand" size={20} />
              <h2 className="font-semibold">Integracao Brevo</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chave API
                  <a
                    href="https://app.brevo.com/settings/keys/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-brand text-xs hover:underline inline-flex items-center gap-1"
                  >
                    Obter chave <ExternalLink size={12} />
                  </a>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.apiKey}
                      onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                      placeholder="xkeysib-xxxxxxxxxxxx..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:ring-brand focus:border-brand font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    disabled={testing || !settings.apiKey}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw size={16} className={testing ? 'animate-spin' : ''} />
                    Testar
                  </button>
                </div>
                {connectionStatus && (
                  <p
                    className={`mt-2 text-sm flex items-center gap-1 ${
                      connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {connectionStatus === 'success' ? (
                      <>
                        <CheckCircle size={14} />
                        Conexao estabelecida com sucesso!
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} />
                        Falha na conexao. Verifique a chave API.
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 flex items-start gap-2">
                <HelpCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Como obter a chave API do Brevo:</p>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>
                      Crie uma conta em{' '}
                      <a
                        href="https://www.brevo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        brevo.com
                      </a>
                    </li>
                    <li>Aceda a Configuracoes → Chaves API</li>
                    <li>Clique em "Gerar nova chave API"</li>
                    <li>Copie a chave e cole acima</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Sender Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center gap-2">
              <Mail className="text-brand" size={20} />
              <h2 className="font-semibold">Remetente Padrao</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Remetente
                  </label>
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => setSettings((s) => ({ ...s, senderName: e.target.value }))}
                    placeholder="O Investigador"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email do Remetente
                  </label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings((s) => ({ ...s, senderEmail: e.target.value }))}
                    placeholder="newsletter@jornalinvestigador.pt"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responder Para
                </label>
                <input
                  type="email"
                  value={settings.replyTo}
                  onChange={(e) => setSettings((s) => ({ ...s, replyTo: e.target.value }))}
                  placeholder="redacao@jornalinvestigador.pt"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email que recebera as respostas dos subscritores
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center gap-2">
              <Shield className="text-brand" size={20} />
              <h2 className="font-semibold">Preferencias de Subscricao</h2>
            </div>
            <div className="p-4 space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.doubleOptIn}
                  onChange={(e) => setSettings((s) => ({ ...s, doubleOptIn: e.target.checked }))}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                <div>
                  <p className="font-medium">Double Opt-In</p>
                  <p className="text-sm text-gray-500">
                    Requer confirmacao por email antes de adicionar subscritores (recomendado para
                    RGPD)
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.welcomeEmail}
                  onChange={(e) => setSettings((s) => ({ ...s, welcomeEmail: e.target.checked }))}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                <div>
                  <p className="font-medium">Email de Boas-Vindas</p>
                  <p className="text-sm text-gray-500">
                    Enviar email automatico quando alguem subscreve
                  </p>
                </div>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Pagina de Cancelamento
                </label>
                <input
                  type="url"
                  value={settings.unsubscribePage}
                  onChange={(e) => setSettings((s) => ({ ...s, unsubscribePage: e.target.value }))}
                  placeholder="https://jornalinvestigador.pt/cancelar-subscricao"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe vazio para usar a pagina padrao do Brevo
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded hover:bg-brand-light disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'A guardar...' : 'Guardar Configuracoes'}
            </button>
          </div>
        </div>

        {/* Lists Management */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="text-brand" size={20} />
                <h2 className="font-semibold">Listas</h2>
              </div>
              <button
                onClick={() => setShowNewListModal(true)}
                className="text-brand text-sm hover:underline"
              >
                + Nova Lista
              </button>
            </div>
            <div className="divide-y">
              {lists.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Nenhuma lista encontrada
                </div>
              ) : (
                lists.map((list) => (
                  <div key={list.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{list.name}</p>
                      <p className="text-sm text-gray-500">{list.subscribers} subscritores</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.defaultListId === list.id && (
                        <span className="text-xs bg-brand/10 text-brand px-2 py-1 rounded">
                          Padrao
                        </span>
                      )}
                      <button
                        onClick={() => setSettings((s) => ({ ...s, defaultListId: list.id }))}
                        className="text-xs text-gray-500 hover:text-brand"
                        title="Definir como padrao"
                      >
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-gradient-to-br from-brand to-brand-dark rounded-lg p-4 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <HelpCircle size={18} />
              Precisa de Ajuda?
            </h3>
            <ul className="text-sm text-white/80 space-y-2">
              <li>
                <a
                  href="https://developers.brevo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  Documentacao do Brevo
                </a>
              </li>
              <li>
                <a
                  href="https://help.brevo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  Central de Ajuda
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Nova Lista</h2>
              <button
                onClick={() => setShowNewListModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newList.name}
                  onChange={(e) => setNewList((l) => ({ ...l, name: e.target.value }))}
                  placeholder="Ex: Newsletter Semanal"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <textarea
                  value={newList.description}
                  onChange={(e) => setNewList((l) => ({ ...l, description: e.target.value }))}
                  placeholder="Descricao opcional da lista..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-brand focus:border-brand"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewListModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateList}
                  className="flex-1 px-4 py-2 bg-brand text-white rounded hover:bg-brand-light"
                >
                  Criar Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSettings;
